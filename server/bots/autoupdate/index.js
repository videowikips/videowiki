import async from 'async'
import { Article } from '../../modules/shared/models'
import { paragraphs, splitter, textToSpeech, dotSplitter } from '../../modules/shared/utils'
import { getSectionText } from '../../modules/wiki/utils';
import { validateArticleRevisionAndUpdate, isCustomVideowikiScript } from '../../modules/shared/services/article';
// import wiki from 'wikijs'
// import request from 'request'
// import slug from 'slug'

// import { oldUpdatedSlides } from './updatedSections';
// import {
//   removeDeletedSlides,
//   getSlidesPosition,
//   fetchUpdatedSlidesMeta,
//   getDifferences,
//   addRandomMediaOnSlides
// } from './helpers';

// const Diff = require('text-diff');
// const diffClient = new Diff();

// const homepageArticles = [
//   "Ed_Sheeran",
//   "Justin_Bieber",
//   "Eminem",
//   "Michael_Jackson",
//   "Kim_Kardashian",
//   "Johnny_Depp",
//   "Leonardo_DiCaprio",
//   "Cristiano_Ronaldo",
//   "Michael_Jordan",
//   "Lionel_Messi",
//   "Muhammad_Ali",
//   "Narendra_Modi",
//   "Donald_Trump",
//   "Adolf_Hitler",
//   "Barack_Obama",
//   "Angelina_Jolie",
// ];

const console = process.console;
var changedSlidesNumber = 0;
var convertedCharactersCounter = 0;

const bottest = function (req, res) {
  const title = req.params.title || 'The_Dewarists';
  console.log('title', title)
  Article.findOne({ title: title, published: true }, (err, article) => {
    if (err) return res.json(err);
    console.log(err, article)
    if (!article) return res.end('No published article with this title!');

    updateArticle(article, (err, result) => {
      if (err) return res.json({ err: JSON.strigify(err) })
      return res.json(result)
    });
  });
  // const deletedAudios = ['e2a44b9f-c359-4403-a7a7-6498878e6463.mp3'];

  // deleteAudios(deletedAudios, (err, data) => {
  //     res.json({err, data});
  // });

  // runBot(4);
}
const runBot = function (limitPerOperation) {
  // get number of articles to be updated
  Article
    .count({ published: true })
    .where('slides.500').exists(false)
    .exec((err, count) => {
      if (err) return console.log('error fetching articles count for bot', err);
      // setup a queue for performing updates on article sets
      const numberOfArticles = count;
      console.log('Number of published articles: ', numberOfArticles)
      let q = articlesQueue();

      for (let i = 0; i < numberOfArticles; i += limitPerOperation) {
        q.push({ skip: i, limitPerOperation: limitPerOperation });
      }

      q.drain = function () {
        console.log("------------------- Successfully updated all articles ----------------------");
        console.log("------------------- Total number of converted slides is " + changedSlidesNumber + "------------------------");
        console.log("------------------- Total number of converted characters" + convertedCharactersCounter + "--------------------");
        changedSlidesNumber = 0;
        convertedCharactersCounter = 0;
      };

    })

}

// runs the bot against specific article titles
const runBotOnArticles = function (titles, callback = function () { }) {

  // Article.create()
  console.log('running bot on article ', titles)
  Article
    .find({ published: true, title: { $in: titles } })
    .exec((err, articles) => {
      if (err) return callback(err);
      if (!articles) return callback(null); // end of articles
      updateArticles(articles, (err, results) => {
        const modifiedArticles = results.map((result) => {
          const article = result.value.article;

          const modified = result.value.modified || article.slides.length !== article.slidesHtml.length;
          return {
            title: article.title,
            modified,
            wikiSource: article.wikiSource,
            article,
          }
        });

        saveUpdatedArticles(results.map((result) => result.value), (err, result) => {
          // Update slidesHtml after saving updated articles
          const updateSlidesHtmlArray = [];
          modifiedArticles.forEach((article) => {
            updateSlidesHtmlArray.push(function upd(cb) {
              // Check to see if the article revision has changed, which indicates a change
              // in either the media or the text. in such case, update the slides html and media if possible
              validateArticleRevisionAndUpdate(article.title, article.wikiSource, cb);
            });
          })

          async.parallel(async.reflectAll(updateSlidesHtmlArray), (err) => {
            callback(err, result);
          })
        });
      });
    })
}

const articlesQueue = function () {
  return async.queue((task, callback) => {

    Article
      .find({ published: true })
      .sort({ created_at: 1 })
      .where('slides.500').exists(false)
      .skip(task.skip)
      .limit(task.limitPerOperation)
      .exec((err, articles) => {
        if (err) return callback(err);
        if (!articles) return callback(null); // end of articles
        updateArticles(articles, (err, results) => {
          console.log('task done ' + task.skip);
          const modifiedArticles = results.map((result) => {
            const article = result.value.article;

            const modified = result.value.modified || article.slides.length !== article.slidesHtml.length;
            return {
              title: article.title,
              modified,
              wikiSource: article.wikiSource,
              article,
            }
          });

          saveUpdatedArticles(results.map((result) => result.value), (err, result) => {
            // Update slidesHtml after saving updated articles
            const updateSlidesHtmlArray = [];
            modifiedArticles.forEach((article) => {
              updateSlidesHtmlArray.push(function upd(cb) {
                // Check to see if the article revision has changed, which indicates a change
                // in either the media or the text. in such case, update the slides html and media if possible
                validateArticleRevisionAndUpdate(article.title, article.wikiSource, cb);
              });
            })

            async.parallel(async.reflectAll(updateSlidesHtmlArray), (err, results) => {
              callback(err, result);
            })
          });
        });
      })
  })
}

const saveUpdatedArticles = function (values, callback) {
  const updateArray = [];
  const updatedAt = Date.now();

  values.forEach(({ article, modified }) => {
    const query = {
      updateOne: {
        filter: { _id: article._id },
        update: {
          $set: {
            'slides': article.slides,
            'sections': article.sections,
            'updated_at': updatedAt,
            'version': modified ? new Date().getTime() : article.version,
          },
        },
      },
    };
    updateArray.push(query);
  });

  Article.bulkWrite(updateArray)
    .then(res => callback(null, res))
    .catch(err => callback(err));
}

const updateArticles = function (articles, callback) {
  const articleUpdateFunctionArray = [];

  articles.forEach((article) => {
    function a(cb) {
      updateArticle(article, (err, newArticle) => {
        if (err) return cb(err)

        return cb(null, newArticle);
      })
    }
    articleUpdateFunctionArray.push(a);
  })

  async.parallel(async.reflectAll(articleUpdateFunctionArray), (err, results) => {
    if (err) return console.log(err);
    return callback(null, results);
  })
}

const updateArticle = function (article, callback) {
  diffArticleSectionsV2(article, (err, result) => {
    if (err) return callback(err);
    return callback(null, result);
  })

  // if (isCustomVideowikiScript(article.title)) {
  //   diffCustomArticleSections(article, (err, result) => {
  //     if (err) return callback(err);
  //     return callback(null, result);
  //   })
  // } else {
  //   diffArticleSectionsV2(article, (err, result) => {
  //     if (err) return callback(err);
  //     return callback(null, result);
  //   })
  // }
}
// compares the old articles with new articles fetched from wikipedia
const updateArticleSlides = function (currentSlides, newSlides, langCode, callback) {
  // noramalize and trim slides text 
  let reg = /(\s|\.|\,)/g;
  const currentSlidesText = currentSlides.map(slide => slide.text.trim().replace(reg, '').toLowerCase());
  const newSlidesText = newSlides.map(slide => slide.text.trim());

  newSlidesText.forEach((slideText, index) => {
    // if new slide is in current slides, get its audio and media
    // then remove its audio reference to protect from deletion
    if (currentSlidesText.indexOf(slideText.trim().replace(reg, '').toLowerCase()) > -1) {
      const slideIndex = currentSlidesText.indexOf(slideText.trim().replace(reg, '').toLowerCase());
      const matchingSlide = currentSlides[slideIndex];

      newSlides[index].audio = matchingSlide.audio;
      newSlides[index].media = matchingSlide.media;
      newSlides[index].mediaType = matchingSlide.mediaType;
      newSlides[index].references = matchingSlide.references ? matchingSlide.references : [];

      // If the slide doesn't have date, set a new value for that
      newSlides[index].date = matchingSlide.date || new Date();

      currentSlides[slideIndex].audio = '';

    } else {
      // console.log(' a new slide ', slideText, currentSlidesText.indexOf(slideText))
    }
  })

  // set incremental position on new slides after updating and trim the text
  for (let i = 0; i < newSlides.length; i++) {
    newSlides[i].position = i;
    newSlides[i].text = newSlides[i].text ? newSlides[i].text.trim() : newSlides[i].text;
  }

  // now, we generate audio for newely fetched slides that don't have any ( It's a totally new slide ) 
  let pollyFunctionArray = [];
  let modified = false;
  // if the lengths of the new slides and current slides don't match,
  // then a slide did get updated ( added/removed )
  if (currentSlides.length !== newSlides.length) {
    modified = true;
  }
  newSlides.forEach((newSlide) => {
    if (!newSlide.audio && newSlide.text && newSlide.text.length > 2) {

      modified = true;
      function p(cb) {
        changedSlidesNumber++;
        convertedCharactersCounter += newSlide.text.length;

        textToSpeech({ text: newSlide.text, langCode }, (err, audioFilePath) => {
          if (err) {
            return cb(err)
          }
          newSlide.audio = audioFilePath
          newSlide.date = new Date();
          return cb(null)
        })

      }
      pollyFunctionArray.push(p);

    }
  })

  // lets generate some audios now!
  async.parallelLimit(pollyFunctionArray, 5, (err) => {
    if (err) {
      console.log(err)
      return callback(err)
    }

    // TODO delete unused audios

    // All good, return newSlides after being polished
    return callback(null, { slides: newSlides, modified, currentSlides, currentSlidesText, newSlidesText });
  })
}




const addNewSlides = function (updatedSlides, addedSlidesArray, callback) {
  // TODO generate audio for new slides
  generateSlidesAudio(updatedSlides, addedSlidesArray, (err, newAddedSlides) => {
    for (let i = 0; i < newAddedSlides.length; i++) {
      updatedSlides.splice(newAddedSlides[i].position, 0, newAddedSlides[i]);
    }
    return callback(err, updatedSlides)
  })
}

const generateSlidesAudio = function (updatedSlides, slides, callback) {
  let pollyFunctionArray = [];
  let audifiedSlides = [];
  let updatedSlidesText = updatedSlides.map(slide => slide.text);
  // return callback(null, audifiedSlides);
  slides.forEach(slide => {
    if (slide.text) {

      const params = {
        'Text': slide.text,
        'OutputFormat': 'mp3',
        'VoiceId': 'Joanna',
      }

      function p(cb) {
        // if the slide is already in the db and just the position updated
        // don't generate new audio.
        if (updatedSlidesText.indexOf(slide.text) > -1) {
          audifiedSlides.push({
            text: slide.text,
            audio: slide.audio,
            position: slide.position,
            media: slide.media,
            mediaType: slide.mediaType,
            references: slide.references ? slide.references : [],
          })
          updatedSlides.splice(updatedSlidesText.indexOf(slide.text), 1);
          return cb(null)
        } else {
          // audifiedSlides.push({
          //     text: slide.text,
          //     audio: 'path/to/new/audio',
          //     position: slide.position,
          //     media: slide.media,
          //     mediaType: slide.mediaType
          // })
          // return cb(null)
          changedSlidesNumber++;
          let textToConvert = slide.text ? slide.text.trim() : slide.text;
          if (textToConvert) {
            convertedCharactersCounter += textToConvert.length;
          }
          textToSpeech(textToConvert, (err, audioFilePath) => {
            if (err) {
              return cb(err)
            }

            audifiedSlides.push({
              text: slide.text,
              audio: audioFilePath,
              position: slide.position,
              media: slide.media,
              mediaType: slide.mediaType,
            })
            return cb(null)
          })
        }
      }
      pollyFunctionArray.push(p);
    }
  });

  async.waterfall(pollyFunctionArray, (err) => {
    if (err) {
      console.log(err)
      return callback(err)
    }

    callback(null, audifiedSlides);
  })
}

const getLatestData = function (wikiSource, title, callback) {

  getSectionText(wikiSource, title, (err, sections) => {

    if (err) {
      console.log(err)
      return callback(err)
    }

    getSectionsSlides(sections, (err, data) => {
      if (err) {
        console.log(err)
        return callback(err)
      }
      return callback(null, { slides: data.slides, sections: data.sections })
    })
  })
}

const getSectionsSlides = function (sections, callback) {

  const slides = []
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

    slideText.forEach(function (text, index) {
      slides.push({
        text,
        position: (section['slideStartPosition'] + index),
      })
    });
  })

  return callback(null, { slides, sections })
}

// const updateArticleV2 = function (article, callback) {
//   getLatestData(article.wikiSource, article.title, (err, data) => {
//     console.log('updating article ', article.title);
//     if (err) return callback(err);
//     // compares the old articles with new articles fetched from wikipedia
//     updateArticleSlides(article.slides, data.slides, article.langCode, (err2, result) => {
//       if (err2) return callback(err2);

//       article.slides = result.slides;
//       article.sections = data.sections;
//       const modified = result.modified;

//       return callback(null, { article, modified, result });
//     });
//   })
// }

function diffCustomArticleSections(article, callback) {
  console.log('=============== diffCustomArticleSections ================= ')
  let changedSlidesNumber = 0;
  let convertedCharactersCounter = 0;
  getLatestData(article.wikiSource, article.title, (err, data) => {
    if (err) return callback(err);
    console.log('got data');
    let currentPosition = 0;
    let updatedSlides = [];
    // Break all section text to slides again.
    data.sections.forEach((section) => {
      // Break text into 300 chars to create multiple slides
      const { text } = section
      const paras = paragraphs(text)
      let slideText = [];

      paras.forEach((para) => {
        slideText = slideText.concat(dotSplitter(para));
      })

      section['numSlides'] = slideText.length
      section['slideStartPosition'] = currentPosition

      currentPosition += slideText.length
      updatedSlides = updatedSlides.concat(slideText.map((t) => ({ text: t })));
    });
    // find if there's any of the slides that match current slides, hence we dont need
    // to reconvert the audio, otherwise set to generate the audio
    const pollyFunctionArray = [];
    let modified = false;
    updatedSlides.forEach((slide, index) => {
      slide.position = index;
      const matchingSlide = article.slides.find((s) => noramalizeText(s.text.trim()).trim() === noramalizeText(slide.text.trim()).trim());
      if (matchingSlide) {
        Object.keys(matchingSlide).forEach((key) => {
          slide[key] = matchingSlide[key];
        })
      } else if (slide.text && slide.text.length > 2) {
        modified = true;
        function genAudio(cb) {
          changedSlidesNumber++;
          convertedCharactersCounter += slide.text.length;

          textToSpeech({ text: slide.text, langCode: article.langCode }, (err, audioFilePath) => {
            if (err) {
              return cb(err)
            }
            slide.audio = audioFilePath
            slide.date = new Date();
            return cb(null)
          })
        }
        pollyFunctionArray.push(genAudio);
      }
    })
    // lets generate some audios now!
    async.parallelLimit(pollyFunctionArray, 5, (err) => {
      if (err) {
        console.log(err)
        return callback(err)
      }

      // TODO delete unused audios

      // All good, return newSlides after being polished
      updatedSlides.forEach((slide, index) => {
        slide.position = index;
      })
      console.log('changed slide number', changedSlidesNumber, convertedCharactersCounter);
      article.slides = updatedSlides;
      article.sections = data.sections;
      return callback(null, { article, modified })
    })
  })
}

function diffArticleSectionsV2(article, callback) {
  // Fetch the new sections the wikimedia source
  getLatestData(article.wikiSource, article.title, (err, data) => {
    if (err) return callback(err);

    let modified = false;
    // const deletedSlides = [];
    let updatedSlides = [];
    data.sections.forEach((section, sectionIndex) => {
      const oldSectionStartPosition = section.slideStartPosition;
      section.slideStartPosition = updatedSlides.length;
      let noOfSectionSlides = 0;

      // Get matching section based on title, tocleve and tocnumber
      let matchinSection = article.sections.find((sec) => (section.title === sec.title && section.toclevel === sec.toclevel && section.tocnumber === sec.tocnumber));

      // if doesnt exist, search by prev/following sections
      if (!matchinSection) {
        if (sectionIndex !== 0 && sectionIndex !== data.sections.length - 1) {
          // Has prev and next sections
          const prevSection = data.sections[sectionIndex - 1];
          const nextSection = data.sections[sectionIndex + 1];
          matchinSection = article.sections.find((sec, secIndex) => {
            if (secIndex === 0 || secIndex === article.sections.length - 1) return false;
            return sec.title === section.title && article.sections[secIndex - 1].title === prevSection.title && article.sections[secIndex + 1].title === nextSection.title;
          });
        } else if (sectionIndex === 0 && sectionIndex !== data.sections.length - 1) {
          // Has only next section ( first section )
          const nextSection = data.sections[sectionIndex + 1];
          matchinSection = article.sections.find((sec, secIndex) => {
            if (secIndex === article.sections.length - 1) return false;
            return sec.title === section.title && article.sections[secIndex + 1].title === nextSection.title;
          });
        } else if (sectionIndex !== 0 && sectionIndex === data.sections.length - 1) {
          // Has only prev section ( last section )
          const prevSection = data.sections[sectionIndex - 1];
          matchinSection = article.sections.find((sec, secIndex) => {
            if (secIndex === 0) return false;
            return sec.title === section.title && article.sections[secIndex - 1].title === prevSection.title;
          });
        }
      }
      // Last resort, find section by title
      if (!matchinSection) {
        matchinSection = article.sections.find((sec) => sec.title === section.title);
      }

      // If the section wasn't found by now, it might have been renamed
      // Check if the section was renamed by comparing prev/following sections titles
      if (!matchinSection) {
        if (sectionIndex !== 0 && sectionIndex !== data.sections.length - 1) {
          // Has prev and next sections
          const prevSection = data.sections[sectionIndex - 1];
          const nextSection = data.sections[sectionIndex + 1];
          matchinSection = article.sections.find((sec, secIndex) => {
            if (secIndex === 0 || secIndex === article.sections.length - 1) return false;
            return section.toclevel === sec.toclevel && section.tocnumber === sec.tocnumber && article.sections[secIndex - 1].title === prevSection.title && article.sections[secIndex + 1].title === nextSection.title;
          });
        } else if (sectionIndex === 0 && sectionIndex !== data.sections.length - 1) {
          // Has only next section ( first section )
          const nextSection = data.sections[sectionIndex + 1];
          matchinSection = article.sections.find((sec, secIndex) => {
            if (secIndex === article.sections.length - 1) return false;
            return section.toclevel === sec.toclevel && section.tocnumber === sec.tocnumber && article.sections[secIndex + 1].title === nextSection.title;
          });
        } else if (sectionIndex !== 0 && sectionIndex === data.sections.length - 1) {
          // Has only prev section ( last section )
          const prevSection = data.sections[sectionIndex - 1];
          matchinSection = article.sections.find((sec, secIndex) => {
            if (secIndex === 0) return false;
            return section.toclevel === sec.toclevel && section.tocnumber === sec.tocnumber && article.sections[secIndex - 1].title === prevSection.title;
          });
        }
      }
      // All attempts failed to find a matching section, so it's a new one
      if (!matchinSection) {
        // This is a new section
        const sectionSlides = data.slides.slice(oldSectionStartPosition, oldSectionStartPosition + section.numSlides);
        updatedSlides = updatedSlides.concat(sectionSlides);
        noOfSectionSlides = sectionSlides.length;
        section.numSlides = noOfSectionSlides;
        return;
      } else {
        // Check for the section slides in either the old slides or new slides
        // if it doesn't exist in the old slides, then the section
        // didn't have slides earlier and now it does
        let oldSectionsSlides = article.slides.slice(matchinSection.slideStartPosition, matchinSection.slideStartPosition + matchinSection.numSlides);
        if (!oldSectionsSlides || oldSectionsSlides.length === 0) {
          // We get the slides now from the new fetched slides
          oldSectionsSlides = data.slides.slice(oldSectionStartPosition, oldSectionStartPosition + section.numSlides);
        }
        // console.log('old section slides', oldSectionsSlides)

        // const sectionsDiff = diffClient.main(noramalizeText(matchinSection.text), noramalizeText(section.text)).filter(dif => dif[1].trim())
        // diffClient.cleanupSemantic(sectionsDiff)
        // // console.log('sections diff', sectionsDiff)
        // if (sectionsDiff.filter((dif) => dif[0] !== 0).length === 0) {
        //   updatedSlides = updatedSlides.concat(oldSectionsSlides);
        //   noOfSectionSlides += oldSectionsSlides.length;
        //   section.numSlides = noOfSectionSlides;
        //   return;
        // }

        let normalizedSection = noramalizeText(section.text);
        oldSectionsSlides.forEach((slide, index) => {
          let lastTextIndex = 0;
          const normalizedSlide = noramalizeText(slide.text);
          let lastSlideChanged = false;
          // Text can be inserted at the end of the last slide of the section while that slide will still be valid
          // We manually compare that slide
          if (index === (oldSectionsSlides.length - 1)) {
            const noDotsSectionSlice = noramalizeText(normalizedSection.slice(normalizedSection.indexOf(normalizedSlide), normalizedSection.length).trim()).trim();
            if (noDotsSectionSlice !== normalizedSlide.trim()) {
              lastSlideChanged = true;
            }
          }
          if (normalizedSection.trim().indexOf(normalizedSlide.trim()) !== lastTextIndex ||
              lastSlideChanged
            // See if that's the last slide and some text was added at the end of the last slide
          ) {
            // Some change occured
            modified = true;
            // Traverse the slides array till finding a valid slide
            // i.e. a slide that didnt change
            let i = index;
            let nextValidSlide = noramalizeText(oldSectionsSlides[i].text);
            while (normalizedSection.indexOf(nextValidSlide) === -1 && i < oldSectionsSlides.length) {
              nextValidSlide = noramalizeText(oldSectionsSlides[i].text);
              i++;
            }
            let sliceIndex ;
            // the slide is valid but some text was inserted before the slide
            if (i === index && i < oldSectionsSlides.length && oldSectionsSlides[i + 1]) {
              nextValidSlide = noramalizeText(oldSectionsSlides[i + 1].text);
              // normalizedSection = normalizedSection.replace(normalizedSlide, noramalizeText(updateSlideText))
              sliceIndex = normalizedSection.indexOf(nextValidSlide);
              // Last slide
            } else if (index === (oldSectionsSlides.length - 1) || normalizedSection.indexOf(nextValidSlide) === -1) {
              sliceIndex = normalizedSection.length;
            } else {
              sliceIndex = normalizedSection.indexOf(nextValidSlide)
            }

            const updateSlideText = normalizedSection.slice(lastTextIndex, sliceIndex).trim();
            // the next valid slide is the current slide,
            // so the new text got inserted before this slide
            // newSlides.push(slide);
            if (i !== index) {
              normalizedSection = normalizedSection.replace(normalizedSlide, noramalizeText(updateSlideText))
            }
            lastTextIndex += updateSlideText.length;
            // See if the updates on that slide requires dividing it into multiple ones
            // i.e. text legnth is greater than 300
            let newSlides = [];
            // If the length of the new updated text is > 300
            // We divide it into multiple slides
            if (updateSlideText.length <= 300) {
              newSlides = [{ ...slide, text: updateSlideText, audio: '' }];
            } else {
              // Check if the updated slide has an exact match for the old slide
              // Either at the begining of the new text or at end, If so, we
              // reserve that slide and add extra text as another slides
              const normalizedUpdatedText = noramalizeText(updateSlideText).trim();
              const oldSlideIndex = normalizedUpdatedText.indexOf(normalizedSlide.trim());
              // console.log('old slide index ', oldSlideIndex, normalizedUpdatedText.length - normalizedSlide.trim().length)
              if (oldSlideIndex === 0 || oldSlideIndex === (normalizedUpdatedText.length - normalizedSlide.trim().length)) {
                const remainingText = updateSlideText.replace(normalizedSlide.trim(), '');
                const paras = splitter(remainingText, 300);

                paras.forEach((para) => {
                  newSlides.push({ media: '', mediaType: '', text: para, audio: '' });
                });

                if (oldSlideIndex === 0) {
                  newSlides.unshift(slide);
                } else {
                  newSlides.push(slide);
                }
              } else {
                const paras = splitter(updateSlideText, 300)
                let media = '';
                let mediaType = '';
                paras.forEach((para, index) => {
                  // Attach any old media to the first paragraph if exists
                  if (index === 0 && slide.media && slide.mediaType) {
                    media = slide.media;
                    mediaType = slide.mediaType;
                  } else {
                    media = '';
                    mediaType = '';
                  }
                  newSlides.push({ ...slide, media, mediaType, text: para, audio: '' });
                });
              }
            }
            // Cleanup empty slides
            newSlides = newSlides.filter((s) => s.text && s.text.trim());
            // Add to updated slides
            updatedSlides = updatedSlides.concat(newSlides);
            noOfSectionSlides += newSlides.length;
          } else {
            // Move the index after the current slide
            lastTextIndex += normalizedSlide.length;
            updatedSlides.push(slide);
            noOfSectionSlides += 1;
          }
          // Move beyond any trailing empty space or dot (.)
          while (normalizedSection.slice(lastTextIndex, lastTextIndex + 1) === ' ' || normalizedSection.slice(lastTextIndex, lastTextIndex + 1) === '.') {
            lastTextIndex += 1;
          }
          // console.log('before slice',normalizedSection)
          normalizedSection = normalizedSection.slice(lastTextIndex).trim();
          // console.log('after slice',normalizedSection)
        })
        section.numSlides = noOfSectionSlides;
      }
    })

    const pollyFunctionArray = [];
    updatedSlides.forEach((newSlide) => {
      if (!newSlide.audio && newSlide.text && newSlide.text.length > 2) {

        modified = true;
        function p(cb) {
          changedSlidesNumber++;
          convertedCharactersCounter += newSlide.text.length;

          textToSpeech({ text: newSlide.text, langCode: article.langCode }, (err, audioFilePath) => {
            if (err) {
              return cb(err)
            }
            newSlide.audio = audioFilePath
            newSlide.date = new Date();
            return cb(null)
          })
        }
        pollyFunctionArray.push(p);
      }
    })

    // lets generate some audios now!
    async.parallelLimit(pollyFunctionArray, 5, (err) => {
      if (err) {
        console.log(err)
        return callback(err)
      }

      // TODO delete unused audios

      // All good, return newSlides after being polished
      updatedSlides.forEach((slide, index) => {
        slide.position = index;
      })
      article.slides = updatedSlides;
      article.sections = data.sections;
      return callback(null, { article, modified })
    })
  })
}

function noramalizeText(text = '') {
  // remove any \n, dots in the begining and end of the text
  return text.replace(/(\n)+/g, '').replace(/^\.(.*)$/, '$1').replace(/^(.*)\.$/, '$1').trimLeft();
}

export {
  bottest,
  updateArticle,
  updateArticleSlides,
  runBot,
  runBotOnArticles,
  getLatestData,
}

// const TEMP_WIKISOURCE = 'https://en.wikipedia.org'; 
// const TEMP_TITLE = 'Elon_Musk';

// Article.findOne({title: TEMP_TITLE, wikiSource: TEMP_WIKISOURCE, published: true}, (err, article) => {

//   diffArticleSectionsV2(article, (err, data) => {
//     // console.log(err,data);

//   })
// })
