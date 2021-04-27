import Queue from 'bull'
import wiki from 'wikijs'
import request from 'request'
import async from 'async'
import slug from 'slug'
import striptags from 'striptags';
import cheerio from 'cheerio';
import { getArticleMedia, getTextFromWiki, getSectionText, normalizeSectionText } from '../shared/services/wiki';
import { Article, User } from '../shared/models';
import * as Models from '../shared/models';
import { paragraphs, splitter, textToSpeech } from '../shared/utils';
import { SECTIONS_BLACKLIST, SUPPORTED_TTS_LANGS } from '../shared/constants'
import { LANG_CODES } from '../shared/utils/TextToSpeechUtils';
import {
  finalizeArticleUpdate,
  isCustomVideowikiScript,
  isMDwikiScript,
  updateArticleMediaTimingFromSlides,
} from '../shared/services/article';
import { runBotOnArticle } from '../../bots/autoupdate';
import { getRemoteFileDuration } from '../shared/utils/fileUtils';

const METAWIKI_SOURCE = 'https://meta.wikimedia.org';
const lang = process.argv.slice(2)[1];
const VIDEOWIKI_LANG = lang;

const convertQueue = new Queue(`convert-articles-${lang}`, process.env.REDIS_SERVER)

const console = process.console

const updateTitleOnAllModels = function (oldTitle, newTitle, callback = () => { }) {
  const updateFuncArray = [];
  Object.keys(Models).forEach((modelKey) => {
    const M = Models[modelKey]
    if (Object.keys(M.schema.obj).indexOf('title') !== -1) {
      updateFuncArray.push((cb) => {
        M.updateMany({ oldTitle }, { $set: { title: newTitle } }, (err) => {
          if (err) {
            console.log('error updating model', modelKey, err);
          }
          cb();
        })
      })
    }
  })
  async.parallel(updateFuncArray, (err) => {
    if (err) return callback(err);
    return callback(null, { success: true });
  })
}

const getMainImage = function (wikiSource, title, callback) {
  const url = `${wikiSource}/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURI(title)}&formatversion=2`
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

const getArticleNamespace = function (wikiSource, title, callback) {
  const url = `${wikiSource}/w/api.php?action=query&format=json&titles=${encodeURI(title)}&redirects&formatversion=2`;
  request(url, (err, response, body) => {
    if (err) {
      return callback(err);
    };

    try {
      body = JSON.parse(body);
      const { pages } = body.query;
      if (pages && pages.length > 0) {
        callback(null, pages[0].ns);
      } else {
        callback(null, null);
      }
    } catch (e) {
      return callback(err);
    }
  })
}

const getSummaryImage = function (wikiSource, title, callback) {
  const url = `${wikiSource}/w/api.php?action=query&format=json&formatversion=2&prop=pageimages&piprop=thumbnail&pithumbsize=600&titles=${encodeURI(title)}`
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

const search = function (wikiSource, searchTerm, limit = 7, callback) {
  // Combine provided wikiSource with meta.wikimedia api to perform search

  const wikiSearch = wiki({
    apiUrl: `${wikiSource}/w/api.php`,
    origin: null,
  }).search(searchTerm, limit)
    .then((res) =>
      new Promise((resolve) => {
        const results = res.results.map((result) => ({ title: result, source: wikiSource }));
        resolve(results);
      }))

  const metawikiSearch = wiki({
    apiUrl: `${METAWIKI_SOURCE}/w/api.php`,
    origin: null,
  }).search(searchTerm, limit)
    .then((res) =>
      new Promise((resolve) => {
        const results = res.results.map((result) => ({ title: result, source: METAWIKI_SOURCE }))
        resolve(results);
      }))

  Promise.all([wikiSearch, metawikiSearch])
    .then((responses) => {
      const response = responses.reduce((results, response) => results.concat(response), []);

      callback(null, response);
    })
    .catch((err) => callback(err))
}

const getPageContentHtml = function (proposedSource, title, callback) {
  getArticleWikiSource(proposedSource, title)
    .then((wikiSource) => {
      wiki({
        apiUrl: `${wikiSource}/w/api.php`,
        origin: false,
      })
        .page(title)
        .then((page) => page.html())
        .then((result) => {
          callback(null, result)
        })
        .catch((err) => callback(err));
    })
    .catch((err) => callback(err));
}

const getInfobox = function (wikiSource, title, callback) {
  getArticleWikiSource(wikiSource, title)
    .then((wikiSource) => {
      const url = `${wikiSource}/w/api.php?action=query&prop=revisions&rvprop=content&format=json&titles=${encodeURI(title)}&rvsection=0&rvparse&formatversion=2`

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
    })
    .catch((err) => {
      console.log(err)
      return callback(null, '');
    })
}

function escapeRegExp(stringToGoIntoTheRegex) {
  /* eslint-disable no-useless-escape */
  return stringToGoIntoTheRegex.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
}

function escapeSpecialHtml(str) {
  let text = str
  text = text.replace('&ndash;', '\u2013')
  text = text.replace('&#8211;', '\u2013')

  return text
}

const getArticleSummary = function (wikiSource, title, callback) {
  getArticleWikiSource(wikiSource, title)
    .then((wikiSource) => {
      getSummaryImage(wikiSource, title, (image) => {
        getTextFromWiki(wikiSource, title, (err, articleText) => {
          if (err) {
            console.log(err)
            return callback(err);
          }
          const text = articleText ? articleText.substring(0, 250) : '';
          return callback(null, { image, articleText: text });
        })
      });
    })
    .catch((err) => {
      callback(err);
    })
}

const breakTextIntoSlides = function (wikiSource, title, user, job, callback) {
  const article = {
    slug: slug(title),
    title,
    wikiSource,
    converted: false,
    published: false,
    draft: true,
    editor: 'videowiki-bot',
    version: new Date().getTime(),
    $addToSet: { contributors: user },
  }

  Article.findOneAndUpdate({ title, wikiSource }, article, { upsert: true }, (err) => {
    if (err) {
      console.log(err)
      return callback(err)
    }
    getMainImage(wikiSource, title, (image) => {
      article['image'] = image

      getSectionText(wikiSource, title, (err, sections) => {
        if (err) {
          console.log(err)
          return callback(err)
        }

        const { langCode, lang } = getLanguageFromWikisource(wikiSource);

        article['sections'] = sections
        article['slides'] = [];
        article['lang'] = lang;
        article['langCode'] = langCode;

        const slides = []

        const updatedSections = []

        const sectionFunctionArray = []
        let currentPosition = 0

        sections.map((section) => {
          // Break text into 300 chars to create multiple slides
          const { text } = section
          const paras = paragraphs(text)
          let slideText = []
          if (isCustomVideowikiScript(title) || isMDwikiScript(wikiSource, title)) {
            slideText.push(normalizeSectionText(VIDEOWIKI_LANG, text));
          } else {
            paras.forEach((para) => {
              slideText = slideText.concat(splitter(para, 300));
            })
          }

          section['numSlides'] = slideText.length
          section['slideStartPosition'] = currentPosition

          currentPosition += slideText.length

          const pollyFunctionArray = []

          function s(cb) {
            console.log('lang code', lang, SUPPORTED_TTS_LANGS.indexOf(lang))
            // For each slide, generate audio file using amazon polly
            slideText.forEach((text, index) => {
              if (text) {
                function p(cb) {
                  // If it's not supported lang, dont generate tts
                  if (SUPPORTED_TTS_LANGS.indexOf(lang) === -1) {
                    setTimeout(() => {
                      slides.push({
                        text,
                        audio: '',
                        position: (section['slideStartPosition'] + index),
                        duration: 0,
                        date: new Date(),
                      })
                      cb(null)
                    }, 50);
                  } else {
                    textToSpeech({ text, langCode }, (err, audioFilePath) => {
                      if (err) {
                        return cb(err)
                      }
                      getRemoteFileDuration(`https:${audioFilePath}`, (err, duration) => {
                        if (err) {
                          console.log('error getting file duration', audioFilePath, err)
                        }
                        console.log('duration', duration, text)
                        slides.push({
                          text,
                          audio: audioFilePath,
                          position: (section['slideStartPosition'] + index),
                          duration: duration ? duration * 1000 : 0,
                          date: new Date(),
                        })
                        cb(null)
                      })
                    })
                  }
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
              // Offset -10 to give enough space for hyperlinks to fetch before reporting finished
              let progressPercentage = Math.floor(updatedSections.length * 100 / sections.length) - 10;
              if (progressPercentage < 0) {
                progressPercentage = 0;
              }
              // console.log(progressPercentage, 'progress percentage');
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
          article['conversionProgress'] = 90
          article['published'] = true
          article['draft'] = false

          getArticleNamespace(article.wikiSource, article.title, (err, namespace) => {
            if (err) {
              console.log('error getting article namespace', article.title, article.wikiSource);
            } else if (namespace !== undefined && namespace !== null) {
              article['ns'] = namespace
            }
            Article.findOneAndUpdate({ title: article.title, wikiSource: article.wikiSource }, article, { upsert: true }, (err) => {
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
  })
}

convertQueue.process((job, done) => {
  const { title, userName, wikiSource } = job.data

  // console.log(title)

  breakTextIntoSlides(wikiSource, title, userName, job, (err) => {
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
  const { title, user, wikiSource } = job.data;

  const finalizeFuncArray = [];

  Article.findOne({ title, wikiSource, published: true }, (err, article) => {
    if (err || !article) {
      console.log('error finding article', err);
    }

    finalizeFuncArray.push((cb) => {
      runBotOnArticle({ title, wikiSource }, () => {
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
        return cb();
      })
    })

    async.series(finalizeFuncArray, () => { });
  })
})

convertQueue.on('progress', (job, progress) => {
  const { title } = job.data
  Article.findOneAndUpdate({ title }, { conversionProgress: progress }, { upsert: true }, (err) => {
    console.log(err)
  })
})

const convertArticleToVideoWiki = function (wikiSource, title, user, userName, callback) {

  convertQueue.count().then((count) => {
    if (count >= 5) {
      console.log(count)
      return callback('Our servers are working hard converting other articles and are eager to spend some time with you! Please try back in 10 minutes!')
    }

    Article.findOne({ title, wikiSource }, (err, article) => {

      if (err) {
        console.log(err)
        return callback('Error while converting article!')
      }

      if (article) {
        return callback(null, 'Article already converted or in progress!')
      }

      convertQueue.add({ title, userName, user, wikiSource })
      console.log('queued successfully ')
      callback(null, 'Job queued successfully')
    })
  })
}

const applySlidesHtmlToAllPublishedArticle = function () {

  Article
    .count({ published: true })
    .where('slides.500').exists(false)
    .then(count => {
      let limitPerOperation = 2;
      let q = publishedArticlesQueue();

      console.log('----------- Apply slidesHtml to all published articles -----------')
      console.log('number of published articles is', count);

      for (var i = 0; i < count; i += limitPerOperation) {
        q.push({ skip: i, limitPerOperation: limitPerOperation + 1 });
      }

      q.drain = function () {
        console.log("------------------- Successfully updated Links of all articles ----------------------");
      };


    })
}

const publishedArticlesQueue = function () {
  return async.queue((task, callback) => {
    console.log(' started for ', task);
    Article
      .find({ published: true })
      .sort({ created_at: -1 })
      .where('slides.500').exists(false)
      .skip(task.skip)
      .limit(task.limitPerOperation)
      .exec((err, articles) => {

        if (err) return callback(err);
        if (!articles) return callback(null); // end of articles

        let articleFunctionArray = [];

        articles.forEach(article => {

          function articleUpdate(cb) {
            applySlidesHtmlToArticle(article.wikiSource, article.title, (err, result) => {
              // console.log('applied for ', article.title);
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

const applySlidesHtmlToArticle = function (wikiSource, title, callback) {
  if (!callback) {
    callback = function () { };
  }
  // console.log('starting to apply slides html', title)
  applyRefsOnArticle(title, wikiSource, (err, res) => {
    if (err) {
      console.log('error applying refs on article', err);
    }
    Article.findOne({ title, wikiSource, published: true }, (err, article) => {
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

      fetchArticleHyperlinks(wikiSource, title, (err, links) => {

        if (err) {
          return callback(err);
        }
        // if (!links || links.length == 0) {
        //   console.log('No links')
        //   return callback(null, null);
        // }
        // for each article slide, replace any text that can be a hyperlink with an <a> tag
        let slidesHtml = [];
        let consumedLinks = [];

        article.slides.forEach((slide) => {
          // Apply references
          if (slide.references && slide.references.length > 0) {
            const slideRefs = slide.references.sort((a, b) => b.referenceNumber - a.referenceNumber);
            slideRefs.forEach((ref) => {
              if (slide.text.indexOf(ref.paragraph) !== -1) {
                slide.text = slide.text.replace(ref.paragraph, `${ref.paragraph}<span class="reference" >[${ref.referenceNumber}]</span>`)
              } else {
                // If we cannot find an exact match for the reference paragraph
                // Just keep it at the end of the slide's text
                slide.text = `${slide.text} <span class="reference" >[${ref.referenceNumber}]</span>`
              }
            })
          }
          // Apply links
          if (links && links.length > 0) {
            links.forEach((link) => {
              if (striptags(slide.text).indexOf(' ' + link.text) > -1 && consumedLinks.indexOf(link.text) == -1) {
                slide.text = slide.text.replace(` ${link.text}`, ` <a href="${link.href}">${link.text}</a>`);
                consumedLinks.push(link.text);
              }
            });
          }
          slidesHtml.push(slide);
        });

        // save slidesHtml to the article
        Article.findByIdAndUpdate(article._id, { slidesHtml }, { new: true }, (err) => {
          if (err) {
            return callback('Error saving article slidesHtml');
          }
          return callback(null, true);
        })
      });
    })
  })
}

const applyScriptMediaOnArticle = function (title, wikiSource, callback) {
  console.log('apply script media on article', title, wikiSource)
  Article.findOne({ title, wikiSource, published: true }, (err, article) => {
    if (err) return callback(err);
    if (!article) return callback(new Error('Invalid article title or wikiSource'));
    article = article.toObject();
    const oldMedia = [];
    // Clear old article media first
    article.slides.forEach((slide) => {
      slide.media = [];
    })

    article.slidesHtml.forEach((slide) => {
      if (slide.media) {
        oldMedia.push(slide.media);
      } else {
        oldMedia.push([]);
      }
      slide.media = [];
    })
    Article.findOneAndUpdate({ title, wikiSource, published: true }, { $set: { slides: article.slides, slidesHtml: article.slidesHtml } }, (err) => {
      if (err) {
        console.log('error clearing article media', err);
      }
      getArticleMedia(title, wikiSource, (err, allSectionsImages) => {
        if (err) return callback(err);
        if (!allSectionsImages || allSectionsImages.length === 0) return callback(null, null);
        allSectionsImages = allSectionsImages.filter((si) => si && si.media && si.media.length > 0);

        article.sections.forEach((section) => {
          const sectionImagesIndex = allSectionsImages.findIndex((s) => s.title.toLowerCase().trim() === section.title.trim().toLowerCase() && section.toclevel === s.toclevel && section.tocnumber === s.tocnumber);
          if (sectionImagesIndex === -1) return;

          const sectionImages = allSectionsImages[sectionImagesIndex];
          if (!section.numSlides || section.numSlides === 0) return;
          if (!sectionImages || !sectionImages.media || sectionImages.media.length === 0) return;

          const { slideStartPosition, numSlides } = section;
          for (let i = slideStartPosition; i < (slideStartPosition + numSlides); i++) {
            article.slides[i].media = sectionImages.media;
            if (article.slidesHtml[i]) {
              article.slidesHtml[i].media = sectionImages.media;
            }
            if (article.slides[i].duration) {
              const mitemDuration = article.slides[i].duration / article.slides[i].media.length;
              const mediaTimingMatch = article.mediaTiming &&
                article.mediaTiming[i] &&
                Object.keys(article.mediaTiming[i]).reduce((acc, m) => acc + article.mediaTiming[i][m], 0) === article.slides[i].duration;
              // see if the durations are previously set
              if (article.slides[i].media.length === 1) {
                article.slides[i].media[0].time = mitemDuration;
                if (article.slidesHtml[i] && article.slidesHtml[i].media[0]) {
                  article.slidesHtml[i].media[0].time = mitemDuration;
                }
              } else if (!article.mediaTiming || !article.mediaTiming[i] || Object.keys(article.mediaTiming[i]).length !== article.slides[i].media.length || !mediaTimingMatch) {
                article.slides[i].media.forEach((mitem, index) => {
                  mitem.time = mitemDuration;
                  if (article.slidesHtml[i]) {
                    article.slidesHtml[i].media[index].time = mitemDuration;
                  }
                })
              } else {
                article.slides[i].media.forEach((mitem, index) => {
                  const duration = article.mediaTiming && article.mediaTiming[i] && article.mediaTiming[i][index] ? article.mediaTiming[i][index] : mitemDuration;
                  mitem.time = duration;
                  if (article.slidesHtml[i]) {
                    article.slidesHtml[i].media[index].time = duration;
                  }
                })
              }
            }
          }
        })

        // check if media were modified to update article version
        let modified = false;
        for (let i = 0; i < oldMedia.length; i++) {
          /*
            Update cases:
              - no media => got media
              - has media => no media
              - media items changed
          */
          // Unchanged empty media
          if (oldMedia[i].length === 0 && (!article.slides[i].media || article.slides[i].media.length === 0)) {
            continue;
          }
          //  no media => got media
          if ((!oldMedia[i] || oldMedia[i].length === 0) && article.slides[i].media && article.slides[i].media.length > 0) {
            modified = true;
            break;
          }
          // has media => got media
          if (oldMedia[i] && oldMedia[i].length > 0 && (!article.slides[i].media || article.slides[i].media.length === 0)) {
            modified = true;
            break;
          }
          /*
            Media items changed
          */
          // Changed number of media items
          if (article.slides[i].media && oldMedia[i].length !== article.slides[i].media) {
            modified = true;
            break;
          }
          // deep comparison of medias
          if (oldMedia[i] && oldMedia[i].length > 0 && article.slides[i].media && article.slides[i].media.length > 0) {
            if (article.slides[i].media.some((newMedia) => oldMedia[i].findIndex((old) => newMedia.url === old.url) === -1) ||
              oldMedia[i].some((old) => article.slides[i].media.findIndex((newMedia) => newMedia.url === old.url) === -1)) {
              modified = true;
              break;
            }
          }
        }
        const articleUpdate = { slides: article.slides, slidesHtml: article.slidesHtml };
        if (modified) {
          articleUpdate.version = new Date().getTime();
          console.log('version update');
        }

        Article.findOneAndUpdate({ title, wikiSource, published: true }, { $set: articleUpdate }, (err) => {
          if (err) return callback(err);
          updateArticleMediaTimingFromSlides(title, wikiSource, (err) => {
            if (err) {
              console.log('error updating media timings', err);
            }
            return callback(null, true);
          })
        })
      });
    })
  })
}

// applyScriptMediaOnArticle('Wikipedia:VideoWiki/Dengue_fever', 'https://en.wikipedia.org', (err) => {
//   console.log(err);
// })

const fetchArticleHyperlinks = function (wikiSource, title, callback) {
  return new Promise((resolve, reject) => {
    if (!callback) {
      callback = function () { };
    }
    wiki({
      apiUrl: wikiSource + '/w/api.php',
      origin: null
    }).page(title)
      .then(page => page.html())
      .then(pageHtml => {
        // console.log('page html', pageHtml)
        if (pageHtml) {

          let $ = cheerio.load(pageHtml);
          let linksObj = $('p a[title]');

          let linksArray = [];
          let linksTexts = [];
          linksObj.each(function (index, el) {
            // console.log(el.html());
            const text = $(this).text();
            const hrefMatch = $(this).attr('href').match(/(\/wiki\/.*)/);

            let href = hrefMatch && hrefMatch.length > 0 ? hrefMatch[0] : $(this).attr('href');
            const title = href.replace('/wiki/', '');

            // add wikisource to the url
            let sourceMatch = $(this).attr('href').match(/(.+)\/wiki\//);

            if (sourceMatch && sourceMatch[0]) {
              href += `?wikiSource=${sourceMatch[0].replace('/wiki/', '')}`;
            } else {
              href += `?wikiSource=${wikiSource}`;
            }

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
      .catch(err => { reject(err); return callback(err); });
  })
}

/**
 * Get the wikiSource of an artilce by searching the title in all available wikies
 * @param {string} proposedSource The wikiSource that's searched first
 * @param {string} title The title of the article
 * @param {Function} callback an optional callback
 * @returns {Promise} Promise resolving with the wikiSource to which the article belongs
 *
 * @example
 * getArticleWikiSource('http://en.wikipedia.org', 'Elon_Musk', callback)
 * // 'http://en.wikipedia.org'
 *
 * getArticleWikiSource('http://en.wikipedia.org', 'Wiki_Video', callback)
 * // 'http://meta.mediawiki.org'
 * 
 */

const getArticleWikiSource = function (proposedSource, title, callback) {
  return new Promise((resolve, reject) => {
    wiki({
      apiUrl: proposedSource + '/w/api.php/',
      origin: null
    })
      .page(title)
      .then(page => {
        return new Promise((resolve, reject) => {
          if (page) {
            return resolve(proposedSource)
          }
          return reject(new Error('Not found in ' + proposedSource));
        })
      })
      .catch(err => {
        // try meta.mediawiki 
        return new Promise(function (resolve, reject) {
          wiki({
            apiUrl: METAWIKI_SOURCE + '/w/api.php',
            origin: null
          })
            .page(title)
            .then(page => {
              if (page) {
                return resolve(METAWIKI_SOURCE);
              } else {
                return reject(new Error('Article not found in any wiki'));
              }
            })
            .catch(err => {
              console.log(err)
              return reject(new Error('Article not found in any wiki'));
            })
        })

      })
      .then(wikiSource => {
        resolve(wikiSource);
        callback && callback(null, wikiSource);
      })
      .catch(err => {
        console.log(err);
        let reason = new Error('Cannot find in any wiki');
        reject(reason);
        callback && callback(reason);
      })
  })
}

const applyNamespacesOnArticles = function () {
  const noNamespacesArticlesQueue = function () {
    return async.queue((task, callback) => {
      Article
        .find({ published: true, ns: { $exists: false } })
        .sort({ created_at: 1 })
        .skip(task.skip)
        .limit(task.limitPerOperation)
        .exec((err, articles) => {
          if (err) return callback(err);
          if (!articles || articles.length === 0) return callback(null); // end of articles

          const articleFunctionArray = [];
          articles.forEach((article) => {
            function articleUpdate(cb) {
              getArticleNamespace(article.wikiSource, article.title, (err, namespace) => {
                if (err || namespace === null || namespace === undefined) {
                  console.log('error fetching namespace', err, namespace);
                  return cb();
                }

                Article.update({ title: article.title, wikiSource: article.wikiSource }, { $set: { ns: namespace } }, { multi: true }, (err) => {
                  if (err) {
                    console.log('error updating namespaces ', err);
                  }
                  // console.log('updated namespace for ', article.title);
                  return cb();
                })
              })
            }

            articleFunctionArray.push(articleUpdate);
          })

          async.parallelLimit(async.reflectAll(articleFunctionArray), 5, (err) => {
            if (err) {
              console.log('error fetching articles links', err);
            }
            callback();
          })
        })
    })
  }

  Article
    .count({ published: true, ns: { $exists: false } })
    .then((count) => {
      const limitPerOperation = 10;
      const q = noNamespacesArticlesQueue();

      console.log('----------- Apply namespaces to all published -----------')
      console.log('number of targeted articles is', count);

      for (let i = 0; i < count; i += limitPerOperation) {
        q.push({ skip: i, limitPerOperation });
      }

      q.drain = function () {
        console.log('------------------- Successfully updated namespaces of all articles ----------------------');
      };
    })
}

const getLanguageFromWikisource = function (wikiSource) {
  const re = /^https:\/\/(.+)\.(.+)\.(.+)$/;

  const match = wikiSource.match(re);
  if (match && match.length > 1 && LANG_CODES[match[1]]) {
    return { langCode: LANG_CODES[match[1]], lang: Object.keys(LANG_CODES).find((key) => LANG_CODES[key] === LANG_CODES[match[1]]) };
  }

  // Default to english
  return { langCode: LANG_CODES['en'], lang: 'en' };
}

const escapeWikiSpecialText = function (text) {
  return text.replace(/\[edit\]|\[update\]|\[citation needed\]|\[not in citation given\]/g, '')
}

const getArticleRefs = function (title, wikiSource, callback) {
  wiki({
    apiUrl: `${wikiSource}/w/api.php/`,
    origin: null,
  })
    .page(title)
    .then((page) => page.html())
    .then((page) => {
      if (page) {
        const re = /\[[0-9]+\](\:[0-9]+)?|\n+/gi
        const headingTags = ['h6', 'h5', 'h4', 'h3', 'h2', 'h1'];
        const $ = cheerio.load(page, { decodeEntities: false });
        let references = [];
        // First check if there's any references in the Overview section
        $('div.mw-parser-output').prepend(`<p>${$('div.mw-parser-output').children('p').first().html()}</p>`)
          .children('p').first().nextUntil('h2')
          .each(function (index, el) {
            $(this).find('span.noexcerpt').remove()
            const paragraphText = $(this).text();
            $(this).find('sup.reference').each(function (index, el) {
              let paragraph = $(this).closest('p');
              const refText = $(this).text();
              const refNumber = parseInt(refText.replace(/\[|\]/, ''));

              // Early exit if that reference was parsed before 
              if (references.find((ref) => ref.section === 'Overview' && ref.referenceNumber === refNumber)) return;

              const refMatch = paragraphText.match(re);
              if (refMatch.length > 0) {
                paragraph = paragraphText
                  .split(refText)
                  // Remove empty and unrelated splits
                  .filter((p) => p && paragraphText.indexOf(`${p}${refText}`) !== -1)
                  // Replace special content [edit, update ...etc] and get the last words 5 words
                  .map((p) =>
                    p.replace(re, '')
                      .replace(/\[edit\]|\[update\]|\[citation needed\]|\[not in citation given\]/g, '')
                      // Some weird spacing character that's supposed to be an empty space
                      // Not totally sure how that's parsed yet
                      .replace(new RegExp(' ', 'gi'), ' '))
                  .map((p) => {
                    const paragParts = p.split(' ');
                    if (paragParts.length > 5) {
                      return paragParts.splice(paragParts.length - 4, paragParts.length).join(' ');
                    }
                    return p;
                  })
                  .filter((p) => p);
              } else {
                return;
              }

              references.push({
                section: 'Overview',
                referenceNumber: parseInt(refText.replace(/\[|\]/, '')),
                paragraphs: paragraph,
              })
            })
          })
        // Now we check for each section
        headingTags.forEach((tag) => {
          const tags = $(tag);
          tags.each(function (index, el) {
            const sectionTitle = $(this).find('span.mw-headline').text();
            if (SECTIONS_BLACKLIST[VIDEOWIKI_LANG].some((s) => s.toLowerCase().trim() === sectionTitle.toLowerCase().trim())) return;
            // console.log('start of section ', sectionTitle)
            let next = $(this);
            while (headingTags.every((t) => !next.next().is(t)) && next.length > 0) {
              next = next.next();
              const refs = next.find('sup.reference')
              refs.each(function (index, el) {
                // console.log(sectionTitle, $(this).text());
                let paragraph = $(this).closest('p');
                const refText = $(this).text();
                const refNumber = parseInt(refText.replace(/\[|\]/, ''));

                // Early exit if that reference was parsed before in this section
                // if (references.find((ref) => ref.section === sectionTitle && ref.referenceNumber === refNumber && ref.paragraphs.any(p => ))) return;

                if (!refText.match(re)) return;

                if (paragraph.length === 0) {
                  paragraph = $(this).closest('li');
                }
                if (paragraph && paragraph.length > 0 && refText) {
                  paragraph.find('span.noexcerpt').remove();
                  const paragraphText = paragraph.text();
                  const refMatch = paragraphText.match(re);
                  if (refMatch.length > 0) {
                    paragraph = paragraphText
                      .split(refText)
                      // Remove empty and unrelated splits
                      .filter((p) => p && paragraphText.indexOf(`${p}${refText}`) !== -1)
                      // Replace special content [edit, update ...etc] and get the last words 5 words
                      .map((p) =>
                        p.replace(re, '')
                          .replace(/\[edit\]|\[update\]|\[citation needed\]|\[not in citation given\]/g, '')
                          // Some weird spacing character that's supposed to be an empty space
                          // Not totally sure how that's parsed yet
                          .replace(new RegExp(' ', 'gi'), ' '))
                      .map((p) => {
                        const paragParts = p.split(' ');
                        if (paragParts.length > 5) {
                          return paragParts.splice(paragParts.length - 4, paragParts.length).join(' ');
                        }
                        return p;
                      })
                      .filter((p) => p);
                  } else {
                    return;
                  }

                  // This section was parsed before with the same reference number, just add to its paragraph
                  const prevRefIndex = references.findIndex((ref) => ref.section === sectionTitle && ref.referenceNumber === refNumber);
                  if (prevRefIndex !== -1) {
                    paragraph.forEach(p => {
                      if (references[prevRefIndex].paragraphs.indexOf(p) === -1) {
                        references[prevRefIndex].paragraphs.push(p);
                      }
                    })
                    return;
                  }

                  references.push({
                    section: sectionTitle.replace(re, '').replace(/\[edit\]|\[update\]|\[citation needed\]|\[not in citation given\]/g, ''),
                    referenceNumber: parseInt(refText.replace(/\[|\]/, '')),
                    paragraphs: paragraph,
                  })
                }
              })
            }
          })
        });
        references = references.sort((a, b) => a.referenceNumber - b.referenceNumber);
        const referencesList = {};
        $('ol.references li').each(function (index, el) {
          const listItem = $(this);
          listItem.find('a').each(function (index, el) {
            const link = $(this);
            link.attr('target', '_blank');
            if (link.attr('href') && (link.attr('href').indexOf('https') === -1 && link.attr('href').indexOf('http') === -1)) {
              if (link.attr('href').indexOf('#') === 0) {
                link.attr('href', `${wikiSource}/wiki/${title}${link.attr('href')}`);
              } else {
                link.attr('href', `${wikiSource}${link.attr('href')}`);
              }
            }
          })
          referencesList[index + 1] = listItem.html()
        })

        return callback(null, { articleReferences: references, referencesList });
      } else {
        return callback(new Error(`Not found in ${wikiSource}`));
      }
    })
    .catch((err) => callback(err));
}

function applyRefsOnArticle(title, wikiSource, callback = () => { }) {
  getArticleRefs(title, wikiSource, (err, references) => {
    if (err) {
      return callback(err)
    }

    const { articleReferences, referencesList } = references;

    if (!articleReferences) {
      return callback(null, { success: false, reason: 'no references in the article ' });
    }

    Article.findOne({ title, wikiSource, published: true }, (err, article) => {
      if (err) {
        return callback(err);
      }
      if (!article || !article.slides || article.slides.length === 0) return callback(null, { success: false, reason: 'No slides in article' });

      // Clean up previous references
      const articleSlides = article.slides.slice().map((slide) => ({ ...slide, references: [] }));

      articleReferences.forEach((reference) => {
        const section = article.sections.find((section) => section.title === reference.section);
        if (section) {
          const sectionStartPosition = section.slideStartPosition;
          const sectionEndPosition = section.slideStartPosition + section.numSlides;
          const sectionSlides = articleSlides.slice(sectionStartPosition, sectionEndPosition);
          const sectionText = normalizeText(sectionSlides.reduce((acc, slide) => `${acc} ${slide.text.trim()}`, ''));
          const slidesIndices = [];
          sectionSlides.forEach((slide) => {
            slidesIndices.push({
              position: slide.position,
              slideIndex: sectionText.indexOf(normalizeText(slide.text)),
            })
          })

          reference.paragraphs.forEach((paragraph) => {
            const paragraphIndex = sectionText.indexOf(normalizeText(paragraph));
            if (paragraphIndex === -1) {
              // console.log('Invalid paragraph index ', paragraphIndex, normalizeText(reference.paragraph))
              // console.log(normalizeText(sectionText))
              return;
            }

            let slidePosition;
            slidesIndices.forEach(slideIndex => {
              if (paragraphIndex >= slideIndex.slideIndex) {
                slidePosition = slideIndex.position;
              }
            })

            if (slidePosition !== undefined && slidePosition !== 'undefined' && slidePosition !== null && articleSlides.length > parseInt(slidePosition)) {
              const refObj = { referenceNumber: reference.referenceNumber, paragraph };
              if (articleSlides[slidePosition].references) {
                articleSlides[slidePosition].references.push(refObj);
              } else {
                articleSlides[slidePosition].references = [refObj];
              }
            } else {
              // console.log('cannot update slide ', articleSlides.length, slidePosition)
            }
          })
        }
        if (!section) {
          // console.log('doesnt have section', reference)
        }
      })
      // const referencesModified = Object.keys(referencesList).some((key) =>
      //   !article.referencesList || !article.referencesList[key] || article.referencesList[key] !== referencesList[key]);
      // console.log('references modified', referencesModified);
      Article.findByIdAndUpdate(article._id, { $set: { slides: articleSlides, referencesList } }, (err, article) => {
        if (err) {
          return callback(err);
        }
        return callback(null, { success: true });
      });
    })
  })
}

function normalizeText(text) {
  return escapeSpecialHtml(text.replace(/\s+|\n+|\.+/g, ''));
}

function getThumbFromUrl(url) {
  const fileName = url.split('/').filter((a) => a).pop();
  let mediaUrl = `${url.replace('/commons/', '/commons/thumb/')}/400px-${fileName}`;
  // Special case for svg files, thumbnails are in .png extension
  if (fileName.split('.').pop() === 'svg') {
    mediaUrl += '.png';
  }
  return mediaUrl;
}

// applySlidesHtmlToAllPublishedArticle()

export {
  search,
  updateTitleOnAllModels,
  getPageContentHtml,
  breakTextIntoSlides,
  convertArticleToVideoWiki,
  getInfobox,
  fetchArticleHyperlinks,
  applySlidesHtmlToArticle,
  applySlidesHtmlToAllPublishedArticle,
  getArticleSummary,
  getArticleWikiSource,
  METAWIKI_SOURCE,
  applyNamespacesOnArticles,
  applyScriptMediaOnArticle,
}
