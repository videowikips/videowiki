import Queue from 'bull'
import wiki from 'wikijs'
import request from 'request'
import async from 'async'
import slug from 'slug'

import Article from '../../models/Article'
import User from '../../models/User'
import * as fs from 'fs';
import cheerio from 'cheerio';
import { paragraphs, splitter, textToSpeech } from '../../utils'
import striptags from 'striptags';

const convertQueue = new Queue('convert-articles', 'redis://127.0.0.1:6379')

const console = process.console

const getMainImage = function (title, callback) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${title}&formatversion=2`
  request(url, (err, response, body) => {
    const defaultImage = '/img/default_profile.png'

    if (err) {
      callback(defaultImage)
    }

    try {
      body = JSON.parse(body)
      const { pages } = body.query

      const { thumbnail } = pages[0]
      if (thumbnail) {
        const image = thumbnail.original || defaultImage
        callback(image)
      } else {
        callback(defaultImage)
      }
    } catch (e) {
      callback(defaultImage)
    }
  })
}

const getSummaryImage = function(title, callback) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&prop=pageimages&piprop=thumbnail&pithumbsize=600&titles=${title}`
  request(url, (err, response, body) => {
    const defaultImage = '/img/default_profile.png'

    if (err) {
      return callback(defaultImage)
    }

    try {
      body = JSON.parse(body)
      const { pages } = body.query

      const { thumbnail } = pages[0]
      if (thumbnail) {
        const image = thumbnail.source || defaultImage
        return callback(image)
      } else {
        return callback(defaultImage)
      }
    } catch (e) {
      return callback(defaultImage)
    }
  })
}

const search = function (searchTerm, limit = 5, callback) {
  wiki().search(searchTerm, limit)
    .then((data) => callback(null, data.results))
    .catch((err) => callback(err))
}

const getPageContentHtml = function (title, callback) {
  wiki().page(title)
    .then((page) => page.html())
    .then((result) => {
      callback(null, result)
    })
    .catch((err) => callback(err))
}

const getSectionsFromWiki = function (title, callback) {
  const url = `https://en.wikipedia.org/w/api.php?action=parse&format=json&page=${title}&prop=sections&redirects`
  request(url, (err, response, body) => {
    if (err) {
      return callback(err)
    }

    body = JSON.parse(body)

    const introSection = {
      title: 'Overview',
      toclevel: 1,
      tocnumber: '',
      index: 0,
    }

    if (body && body.parse) {
      const { sections } = body.parse

      const parsedSections = sections.map((section) => {
        const { line } = section
        const regex = /(<([^>]+)>)/ig

        const s = {
          title: line.replace(regex, ''),
          toclevel: section.toclevel,
          tocnumber: section.number,
          index: section.index,
        }

        return s
      })

      const allSections = [introSection].concat(parsedSections)

      callback(null, allSections)
    } else {
      callback(null, [introSection])
    }
  })
}

const getInfobox = function (title, callback) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&format=json&titles=${title}&rvsection=0&rvparse&formatversion=2`

  request(url, (err, response, body) => {
    if (err) {
      return callback(err)
    }

    body = JSON.parse(body)

    if (body && body.query) {
      const { pages } = body.query
      let content = ''

      if (pages && pages.length > 0) {
        const page = pages[0]
        const revisions = page['revisions']

        if (revisions && revisions.length > 0) {
          content = revisions[0]['content']
        } else {
          callback(null, '')
        }

        // extract infobox from content
        const regex = /(<table class=.+infobox(.|[\r\n])+<\/table>)/
        const match = regex.exec(content)

        if (match && match.length > 0) {
          callback(null, match[1])
        } else {
          callback(null, '')
        }
      } else {
        callback(null, '')
      }
    } else {
      callback(null, '')
    }
  })
}

const getTextFromWiki = function (title, callback) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&titles=${title}&explaintext=1&exsectionformat=wiki&redirects`
  request(url, (err, response, body) => {
    if (err) {
      return callback(err)
    }

    body = JSON.parse(body)

    if (body && body.query) {
      const { pages } = body.query
      let extract = ''

      if (pages) {
        for (const page in pages) {
          if (pages.hasOwnProperty(page)) {
            extract = pages[page]['extract']
            break
          }
        }
        callback(null, extract)
      } else {
        callback(null, '')
      }
    } else {
      callback(null, '')
    }
  })
}


function escapeRegExp (stringToGoIntoTheRegex) {
  return stringToGoIntoTheRegex.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
}

function escapeSpecialHtml (str) {
  let text = str
  text = text.replace('&ndash;', '\u2013')
  text = text.replace('&#8211;', '\u2013')

  return text
}

const getArticleSummary = function(title, callback) {
  getSummaryImage(title, (image) => {
    getTextFromWiki(title, (err, articleText) => {
      if (err) {
        console.log(err)
        return callback(err);
      }
      return callback(null, {image: image, articleText: articleText.substring(0, 200) });
    })
  }); 
}

const getSectionText = function (title, callback) {
  getTextFromWiki(title, (err, text) => {
    if (err) {
      return callback(err)
    }

    getSectionsFromWiki(title, (err, sections) => {
      if (err) {
        return callback(err)
      }

      let remainingText = text

      const updatedSections = []

      // Extract sections from complete text
      for (let i = 1; i < sections.length; i++) {
        sections[i]['title'] = escapeSpecialHtml(sections[i]['title'])
        const { title, toclevel } = sections[i]

        const numEquals = Array(toclevel + 2).join('=')
        const regex = new RegExp(`${numEquals} ${escapeRegExp(title)} ${numEquals}`, 'i') // == <title> ==

        if (remainingText) {
          const match = remainingText.split(regex)
          const [text, ...remaining] = match
          sections[i - 1]['text'] = text.replace(/(=+)(.+)(=+)/g, '');
          remainingText = remaining.join(`${numEquals} ${title} ${numEquals}`)
        }

        const previousSection = sections[i - 1]
        const previousSectionTitle = previousSection.title

        if (previousSectionTitle.toLowerCase() === 'notes' ||
          previousSectionTitle.toLowerCase() === 'further reading' ||
          previousSectionTitle.toLowerCase() === 'references' ||
          previousSectionTitle.toLowerCase() === 'external links' ||
          previousSectionTitle.toLowerCase() === 'sources' ||
          previousSectionTitle.toLowerCase() === 'footnotes' ||
          previousSectionTitle.toLowerCase() === 'bibliography' ||
          previousSectionTitle.toLowerCase() === 'see also'
        ) {
          //
        } else {
          updatedSections.push(previousSection)
        }
      }
      callback(null, updatedSections)
    })
  })
}

const breakTextIntoSlides = function (title, user, job, callback) {
  const article = {
    slug: slug(title),
    title,
    converted: false,
    published: false,
    draft: true,
    editor: 'videowiki-bot',
    version: new Date().getTime(),
    $addToSet: { contributors: user },
  }

  Article.findOneAndUpdate({ title }, article, { upsert: true }, (err) => {
    if (err) {
      console.log(err)
      return callback(err)
    }
    getMainImage(title, (image) => {
      article['image'] = image

      getSectionText(title, (err, sections) => {
        if (err) {
          console.log(err)
          return callback(err)
        }

        article['sections'] = sections
        article['slides'] = []

        const slides = []

        const updatedSections = []

        const sectionFunctionArray = []
        let currentPosition = 0

        sections.map((section) => {
          // Break text into 300 chars to create multiple slides
          const { text } = section
          const paras = paragraphs(text)
          let slideText = []

          paras.map((para) => {
            slideText = slideText.concat(splitter(para, 300))
          })

          section['numSlides'] = slideText.length
          section['slideStartPosition'] = currentPosition

          currentPosition += slideText.length

          const pollyFunctionArray = []

          function s (cb) {
            // For each slide, generate audio file using amazon polly
            slideText.forEach((text, index) => {
             
              if (text) {
                const params = {
                  'Text': text,
                  'OutputFormat': 'mp3',
                  'VoiceId': 'Joanna',
                }

                console.log(params)

                function p (cb) {
                 
                  textToSpeech(text, (err, audioFilePath) => {
                                         if (err) {
                      return cb(err)
                    }

                    slides.push({
                      text,
                      audio: audioFilePath,
                      position: (section['slideStartPosition'] + index),
                    })

                    cb(null)
                  })
                  // Polly.synthesizeSpeech(params, (err, data) => {
                  //   if (err) {
                  //     cb(err)
                  //   } else if (data) {
                  //     if (data.AudioStream instanceof Buffer) {
                  //       const filename = `${uuidV4()}.mp3`
                  //       const randomFileName = path.join(__dirname, '../../../public/audio/' + filename)
                  //       fs.writeFile(randomFileName, data.AudioStream, (err) => {
                  //         if (err) {
                  //           console.log(err)
                  //           return cb(err)
                  //         }

                  //         slides.push({
                  //           text,
                  //           audio: `/audio/${filename}`,
                  //           position: (section['slideStartPosition'] + index),
                  //         })

                  //         cb(null)
                  //       })
                  //     }
                  //   }
                  // })
                }

                pollyFunctionArray.push(p)
              }
            })

            async.waterfall(pollyFunctionArray, (err) => {
                if (err) {
                console.log(err)
                return callback(err)
              }
              updatedSections.push(section)

              // update progress
              // Offset -5 to give enough space for hyperlinks to fetch before reporting finished
              let progressPercentage = Math.floor(updatedSections.length * 100 / sections.length) - 5;
              if (progressPercentage < 0) {
                progressPercentage = 0;
              }
              console.log(progressPercentage, 'progress percentage');
              job.progress(progressPercentage)

              cb(null)
            })
          }

          sectionFunctionArray.push(s)
        })

        async.waterfall(sectionFunctionArray, (err) => {
          if (err) {
            console.log(err)
            return callback(err)
          }

          // Save the converted article to DB
          article['slides'] = slides

          article['converted'] = true
          article['conversionProgress'] = 100
          article['published'] = true
          article['draft'] = false

          Article.findOneAndUpdate({ title: article.title }, article, { upsert: true }, (err) => {
            if (err) {
              console.log(err)
              return callback(err)
            }
            callback(null, article)
          })
        })
      })
    })
  })
}

convertQueue.process((job, done) => {
  const { title, userName } = job.data


  console.log(title)

  breakTextIntoSlides(title, userName, job, (err) => {
    if (err) {
      console.log(err)
    }
    done();
  })
})

convertQueue.on('stalled', (job) => {
  console.log(`${job.data.title} has stalled`)
})
convertQueue.on('error', (error) => {  
  console.log(error)
})

convertQueue.on('completed', (job, result) => {
  const { title, user } = job.data;
      
  applySlidesHtmlToArticle(title, (err, result) => {
    if (err) {
      console.log("Error adding links to slides", err);
    }

    Article.findOneAndUpdate({ title }, { conversionProgress: 100 }, { upsert: true }, (err) => {
      console.log(err)
    })
    if (user) {
      // update total edits and articles edited
      User.findByIdAndUpdate(user._id, {
        $inc: { totalEdits: 1 },
        $addToSet: { articlesEdited: title },
      }, { new: true }, (err, article) => {
        if (err) {
          return console.log(err)
        }

        if (article) {
          User.findByIdAndUpdate(user._id, {
            articlesEditCount: article.articlesEdited.length,
          }, (err) => {
            if (err) {
              console.log(err)
            }
          })
        }
      })
    }
  });
})

convertQueue.on('progress', (job, progress) => {
  const { title } = job.data
  Article.findOneAndUpdate({ title }, { conversionProgress: progress }, { upsert: true }, (err) => {
    console.log(err)
  })
})

const convertArticleToVideoWiki = function (title, user, userName, callback) {

  convertQueue.count().then((count) => {
  
    if (count >= 5) {
      console.log(count)
      return callback('Our servers are working hard converting other articles and are eager to spend some time with you! Please try back in 10 minutes!')
    }

    Article.findOne({ title }, (err, article) => {
  

      if (err) {
        console.log(err)
        return callback('Error while converting article!')
      }

      if (article) {
        return callback(null, 'Article already converted or in progress!')
      }

      convertQueue.add({ title, userName, user })
      console.log('queued successfully ')
      callback(null, 'Job queued successfully')
    })
  })
}

const applySlidesHtmlToAllPublishedArticle = function() {

  Article
  .count({published: true, slidesHtml: {$exists: false}})
  .where('slides.500').exists(false)
  .then(count => {
      let limitPerOperation = 10;
      let q = publishedArticlesQueue();

      console.log('----------- Apply slidesHtml to all published articles -----------')
      console.log('number of published articles is', count);

      for(var i = 0; i < count; i+=limitPerOperation) {
        q.push({skip: i, limitPerOperation: limitPerOperation});
      }

      q.drain =function(){
          console.log("------------------- Successfully updated Links of all articles ----------------------");
      };

      
  })
}

const publishedArticlesQueue = function(){
  return async.queue((task, callback) => {
    console.log(' started for ', task);
      Article 
      .find({ published: true, slidesHtml: {$exists: false} })
      .sort({ created_at: 1 })
      .where('slides.500').exists(false)
      .skip( task.skip )
      .limit( task.limitPerOperation )
      .exec((err, articles) => {
          
        if(err) return callback(err);
        if(!articles) return callback(null); // end of articles

        let articleFunctionArray = [];

        articles.forEach(article => {

          function articleUpdate(cb) {
            applySlidesHtmlToArticle( article.title, (err, result) => {
              console.log(err, result);
              console.log('applied for ', article.title);
              return cb();
            });
          }

          articleFunctionArray.push(articleUpdate);
        })

        async.parallelLimit(async.reflectAll(articleFunctionArray), 5, (err, result) => {
          if (err) {
            console.log('error fetching articles links', err);
          }
          callback();
        })

      })
  })
} 

const applySlidesHtmlToArticle = function(title, callback) {
  if (!callback) {
    callback = function() {};
  }
  Article.findOne({title: title, published: true}, (err, article) => {
    if (err) {
      console.log(err);
      return callback(err);
    }

    if (!article) {
      console.log("Article not found");
      return callback('Article not found');
    }
    if (!article.slides || article.slides.length == 0) {
      return callback('Article doesnt have any slides');
    }
    // get the hyperlinks associated with the article
    fetchArticleHyperlinks(title, (err, links) => {

      if (err) {
        return callback(err);
      }
      if (!links || links.length == 0) {
        console.log('No links')
        return callback(null, null);
      }
    // for each article slide, replace any text that can be a hyperlink with an <a> tag
      let slidesHtml = [];
      let consumedLinks = [];
      
      article.slides.forEach(slide => {
        links.forEach(link => {
          if (striptags(slide.text).indexOf(' '+ link.text) > -1 && consumedLinks.indexOf(link.text) == -1) {
            slide.text = slide.text.replace(` ${link.text}`, ` <a href="${link.href}">${link.text}</a>` );
            consumedLinks.push(link.text);
          }
        });
        slidesHtml.push(slide);
      });


      // save slidesHtml to the article 
      Article.findByIdAndUpdate(article._id, {slidesHtml: slidesHtml}, {new: true}, (err, newArticle) => {
        if (err) {
          return callback('Error saving article slidesHtml');
        }
        return callback(null, true);
      })

    });

  })
}

const fetchArticleHyperlinks = function(title, callback) {
  return new Promise((resolve, reject) => {
    if (!callback) {
      callback = function() {};
    }
    wiki().page(title)
    .then(page => page.html())
    .then(pageHtml => {
      // console.log('page html', pageHtml)
      if (pageHtml) {
  
        let $ = cheerio.load(pageHtml);
        let linksObj = $('p a[title]');
  
        let linksArray = [];
        let linksTexts = [];
        linksObj.each(function(index, el) {
          // console.log(el.html());
          const text = $(this).text();
          const href = $(this).attr('href');
          const title = href.replace('/wiki/', '');

          // only store unique links
          if (linksTexts.indexOf(text) == -1) {
            linksArray.push({
              text,
              href,
              title
            });
            linksTexts.push(text);
          }

        })
        resolve(linksArray);
        return callback(null, linksArray);
        // console.log(linksArray);
  
      } else {
        let msg = 'No data available for this article';
        reject(msg);
        return callback(msg);
      }
    })
    .catch(err => {reject(err); return callback(err); }); 
  })
}

export {
  search,
  getPageContentHtml,
  getSectionsFromWiki,
  getTextFromWiki,
  getSectionText,
  breakTextIntoSlides,
  convertArticleToVideoWiki,
  getInfobox,
  fetchArticleHyperlinks,
  applySlidesHtmlToArticle,
  applySlidesHtmlToAllPublishedArticle,
  getArticleSummary
}
