import { Article, User } from '../shared/models'
import remote from 'remote-file-size'
import { getRemoteFileDuration } from '../shared/utils/fileUtils'

import { publishArticle, uploadS3File, deleteAudioFromS3, updateScriptPageWithAudioAction } from './utils';
import { fetchImagesFromBing, fetchGifsFromGiphy } from '../shared/services/bing';
import { homeArticles } from '../shared/config/articles';
import { updateArticleMediaTimingFromSlides } from '../shared/services/article';
import { bucketName, url } from '../shared/config/aws';
import { allowedAudioExtensions } from './config';
import uuidV4 from 'uuid/v4';
import { SUPPORTED_TTS_LANGS } from '../shared/constants';
import audio_processor from '../shared/services/audio_processor';

const args = process.argv.slice(2);
const lang = args[1];
const topArticles = homeArticles[lang];

const articleController = {
  getTopArticles(req, res) {
    let { limit } = req.query
    if (!topArticles) return res.json(null)
    const titles = topArticles.map((category) => category.articles).reduce((acc, a) => [...acc, ...a], []);

    if (limit) {
      limit = parseInt(limit)
    }

    Article
      .find({ published: true, title: { $in: titles } })
      .sort({ reads: -1 })
      .limit(limit || 4)
      .select('title image reads wikiSource ns')
      .exec((err, articles) => {
        if (err) {
          console.log(err)
          return res.status(503).send('Error while fetching top articles!')
        }

        return res.json({ articles })
      })
  },

  // ================ fetch all articles
  getAllArticles(req, res) {
    const defaultImage = '/img/default_profile.png'
    let { offset } = req.query
    const { wiki } = req.query
    const MDwikiSource = 'https://mdwiki.org'
    const query = { published: true }
    if (wiki && wiki === 'mdwiki') {
      query.wikiSource = MDwikiSource
    } else {
      query.wikiSource = { $ne: MDwikiSource }
    }

    offset = parseInt(offset)

    Article
      .find(query)
      .sort({ featured: -1 })
      .skip(offset || 0)
      .limit(10)
      .select('title image wikiSource ns slides')
      .exec((err, articles) => {
        if (err) {
          console.log(err)
          return res.status(503).send('Error while fetching articles!')
        }

        return res.json({ articles: articles.map(({ _id, title, image, wikiSource, ns, slides }) => {
          const article = { _id, title, image, wikiSource, ns }
          if (image === defaultImage) {
            article.thumbUrl = slides[0].media[0].thumburl
            return article
          }
          article.thumbUrl = article.image
          return article
        }) })
      })
  },

  countPublishedArticles(req, res) {
    const { wiki } = req.query
    const MDwikiSource = 'https://mdwiki.org'
    const query = { published: true }
    if (wiki && wiki === 'mdwiki') {
      query.wikiSource = MDwikiSource
    } else {
      query.wikiSource = { $ne: MDwikiSource }
    }

    Article
      .find(query)
      .count((err, count) => {
        if (err) {
          return res.status(503).send('Error while fetching article count!')
        }

        return res.json({ count })
      })
  },

  getConvertProgress(req, res) {
    const { title } = req.query

    Article
      .findOne({ title })
      .select('conversionProgress converted')
      .exec((err, article) => {
        if (err) {
          return res.status(503).send('Error while fetching articles!')
        }

        if (article) {
          return res.json({ progress: article.conversionProgress, converted: article.converted, title })
        } else {
          return res.json({ progress: 0, converted: false, title })
        }
      })
  },

  publishDraftedArticle(req, res) {
    const { title, wikiSource } = req.query
    const editor = req.user ? req.user._id : req.headers['x-vw-anonymous-id']
    let name

    if (req.user) {
      const { firstName, lastName, email } = req.user
      name = `${firstName}-${lastName}_${email}`
    } else {
      name = `Anonymous_${req.headers['x-vw-anonymous-id']}`
    }

    publishArticle(title, wikiSource, editor, name, (err) => {
      if (err) {
        console.log(err)
        return res.status(500).send(err)
      }

      if (req.user) {
        // update total edits and articles edited
        User.findByIdAndUpdate(req.user._id, {
          $inc: { totalEdits: 1 },
          $addToSet: { articlesEdited: title },
        }, { new: true }, (err, article) => {
          if (err) {
            return console.log(err)
          }

          if (article) {
            User.findByIdAndUpdate(req.user._id, {
              articlesEditCount: article.articlesEdited.length,
            }, (err) => {
              if (err) {
                console.log(err)
              }
            })
          }
        })
      }

      res.send('Article published successfully!')
    })
  },

  getArticleContributors(req, res) {
    const { title } = req.query

    Article
      .findOne({ title, published: true })
      .select('contributors')
      .exec((err, article) => {
        if (err) {
          return res.status(500).send('Error while fetching contributors list!')
        }

        if (!article) {
          return res.json({ contributors: [] })
        }

        const contributorsNames = article.contributors.map((person) =>
          person.split('_')[0].split('-').join(' '))

        res.json({ contributors: contributorsNames })
      })
  },

  searchBingImages(req, res) {
    const { searchTerm } = req.query

    if (searchTerm && searchTerm !== '') {
      fetchImagesFromBing(searchTerm, (err, images) => {
        if (err) {
          return res.status(500).send('Error while fetching images!')
        }

        res.json({ images })
      })
    } else {
      res.json({ images: [] })
    }
  },

  searchBingGifs(req, res) {
    const { searchTerm } = req.query

    if (searchTerm && searchTerm !== '') {
      fetchGifsFromGiphy(searchTerm, (err, gifs) => {
        if (err) {
          return res.status(500).send('Error while fetching gifs!')
        }

        res.json({ gifs })
      })
    } else {
      res.json({ gifs: [] })
    }
  },

  getAudioFileInfo(req, res) {
    const { filename } = req.query

    const nameParts = filename.replace('File:', '').split('__');
    const title = nameParts[0];
    const version = nameParts[1];
    const fileIndex = nameParts[3];

    Article.findOne({ title, version }, (err, article) => {
      if (err) {
        return res.status(400).send('Something went wrong')
      }

      if (!article) {
        return res.status(404).send('Cannot find article');
      }

      if (article.slides.length < fileIndex) {
        return res.status(400).send('Invalid file');
      }

      const file = article.slides[fileIndex];
      const fileUrl = process.env.ENV === 'production' ? `https:${file.audio}` : 'https://dnv8xrxt73v5u.cloudfront.net/28a9f153-7acd-4831-a77d-31f61ed228c7.mp3';

      const data = {
        title: article.title,
        wikiSource: article.wikiSource,
        source: fileUrl,
        date: file.date,
      }

      // Get file size
      remote(fileUrl, (err, sizeInBytes) => {
        if (err) {
          console.log('error fetching file size', err);
          data.size = 0;
        } else if (sizeInBytes) {
          data.size = (sizeInBytes / (1024 * 1024)).toString().substr(0, 5)
        }

        // Get file duration
        getRemoteFileDuration(fileUrl, (err, duration) => {
          if (err) {
            data.duration = 0;
            console.log('error fetching duration', err);
          } else if (duration) {
            data.duration = Math.ceil(duration)
          }

          return res.json({ file: data })
        })
      })
    })
  },

  updateMediaDurations(req, res) {
    const { title, wikiSource, slideNumber } = req.body;
    let { durations } = req.body
    durations = durations.filter((d) => d && d !== null);
    if (!title || !wikiSource || !durations || durations.length === 0 || slideNumber === undefined || slideNumber === null) {
      return res.status(400).send('Please specify title, wikiSource, durations and slideNumber');
    }
    Article.findOne({ title, wikiSource, published: true }, (err, article) => {
      if (err) {
        console.log('err ', err);
        return res.status(400).send('Something went wrong');
      }
      if (!article) return res.status(400).send('Invalid title and wikiSource');
      const durationsUpdate = {};
      durations.forEach((duration, index) => {
        if (article.slides[slideNumber] && article.slides[slideNumber].media[index]) {
          durationsUpdate[`slides.${slideNumber}.media.${index}.time`] = duration;
          durationsUpdate[`slidesHtml.${slideNumber}.media.${index}.time`] = duration;
        }
      })
      Article.findOneAndUpdate({ title, wikiSource, published: true }, { $set: { ...durationsUpdate } }, (err, doc) => {
        if (err) {
          console.log('error updating media durations', err);
          return res.status(400).send('Something went wrong');
        }
        updateArticleMediaTimingFromSlides(title, wikiSource, (err) => {
          if (err) {
            console.log('error updating media timing from slides', err);
          }
          return res.json({ title, wikiSource, slideNumber, durations });
        })
      })
    })
  },

  deleteSlideAudio(req, res) {
    const { title, wikiSource, position } = req.body;
    const userId = req.user._id;
    Article.findOne({ title, wikiSource, published: true }, (err, article) => {
      if (err) {
        console.log('error fetching article ', err);
        return res.status(400).end('Something went wrong');
      }
      if (!article) {
        return res.status(400).end('Invalid article');
      }
      if (SUPPORTED_TTS_LANGS.indexOf(article.lang) !== -1) {
        return res.status(400).send(`This feature is enabled only on no-tts languages videowiki's, supported langs are ${SUPPORTED_TTS_LANGS.join(', ')}`)
      }
      const slideIndex = article.slides.findIndex((s) => parseInt(position) === parseInt(s.position));
      const slideHtmlIndex = article.slidesHtml.findIndex((s) => parseInt(position) === parseInt(s.position));
      if (slideIndex === -1) {
        return res.status(400).send('Invalid slide index');
      }
      const articleUpdate = {
        [`slides.${slideIndex}.audio`]: '',
        [`slides.${slideIndex}.duration`]: 0,
        [`slides.${slideIndex}.audioKey`]: '',
        [`slides.${slideIndex}.audioUploadedToCommons`]: false,

        [`slidesHtml.${slideHtmlIndex}.audio`]: '',
        [`slidesHtml.${slideHtmlIndex}.duration`]: 0,
        [`slidesHtml.${slideHtmlIndex}.audioKey`]: '',
        [`slidesHtml.${slideHtmlIndex}.audioUploadedToCommons`]: false,
      };

      Article.findByIdAndUpdate(article._id, { $set: articleUpdate }, { new: true }, (err, updatedArticle) => {
        if (err) {
          console.log(err);
          return res.status(400).send('Something went wrong');
        }

        res.json({ article: updatedArticle });

        if (article.slides[slideIndex].audioKey) {
          console.log('deleting audio from s3', article.slides[slideIndex].audioKey)
          deleteAudioFromS3(bucketName, article.slides[slideIndex].audioKey);
        }

        updateScriptPageWithAudioAction(userId, article, slideIndex, 'deleted');
      })
    })
  },

  uploadSlideAudio(req, res) {
    if (!req.files || !req.files.file) return res.status(400).end('File is required');
    const file = req.files.file;
    const { title, wikiSource, position, enableAudioProcessing } = req.body;
    const userId = req.user._id;
    Article.findOne({ title, wikiSource, published: true }, (err, article) => {
      if (err) {
        console.log('error fetching article ', err);
        return res.status(400).end('Something went wrong');
      }
      if (!article) {
        return res.status(400).end('Invalid article');
      }
      if (SUPPORTED_TTS_LANGS.indexOf(article.lang) !== -1) {
        return res.status(400).send(`This feature is enabled only on no-tts languages videowiki's, supported langs are ${SUPPORTED_TTS_LANGS.join(', ')}`)
      }
      const slideIndex = article.slides.findIndex((s) => parseInt(position) === parseInt(s.position));
      const slideHtmlIndex = article.slidesHtml.findIndex((s) => parseInt(position) === parseInt(s.position));
      if (slideIndex === -1) {
        return res.status(400).send('Invalid slide index');
      }
      let fileExtension = file.path.split('.').pop();
      // if no file extension is available on the filename, set to webm as default
      if (file.path.split('.').length === 1) {
        fileExtension = 'wav';
      }
      if (allowedAudioExtensions.indexOf(fileExtension) === -1) {
        return res.status(400).send('Invalid file extension');
      }

      const filename = `slidesAudio/audio-${uuidV4()}.${fileExtension}`;
      uploadS3File(bucketName, filename, file)
        .then((result) => {
          const audioURL = `${url}/${filename}`;
          console.log('upload result', result, audioURL)
          getRemoteFileDuration(audioURL, (err, duration) => {
            if (err) {
              console.log('error getting audio url', err);
              return res.status(400).send('Something went wrong');
            }
            console.log('duration is', duration);
            const newDuration = duration * 1000;
            const articleUpdate = {
              [`slides.${slideIndex}.audio`]: audioURL,
              [`slides.${slideIndex}.duration`]: newDuration,
              [`slides.${slideIndex}.audioKey`]: result.Key,
              [`slides.${slideIndex}.audioUploadedToCommons`]: false,
                
              [`slidesHtml.${slideIndex}.audio`]: audioURL,
              [`slidesHtml.${slideIndex}.duration`]: newDuration,
              [`slidesHtml.${slideIndex}.audioKey`]: result.Key,
              [`slidesHtml.${slideIndex}.audioUploadedToCommons`]: false,
            }
            // Update media timings
            if (article.slides[slideIndex].media && article.slides[slideIndex].media.length > 0) {
              article.slides[slideIndex].media.forEach((mitem, index) => {
                articleUpdate[`slides.${slideIndex}.media.${index}.time`] = newDuration / article.slides[slideIndex].media.length;
                articleUpdate[`slidesHtml.${slideHtmlIndex}.media.${index}.time`] = newDuration / article.slides[slideIndex].media.length;
                articleUpdate[`mediaTiming.${position}.${index}`] = newDuration / article.slides[slideIndex].media.length;
              })
            }
            Article.findByIdAndUpdate(article._id, { $set: articleUpdate }, { new: true }, (err, updatedArticle) => {
              if (err) {
                console.log(err);
                return res.status(400).send('Something went wrong');
              }
              audio_processor.processArticleAudio({ articleId: article._id, position });
              res.json({ article: updatedArticle });
              updateScriptPageWithAudioAction(userId, article, slideIndex, 'updated');

              if (article.slides[slideIndex].audioKey) {
                console.log('deleting old audio', article.slides[slideIndex].audioKey)
                deleteAudioFromS3(bucketName, article.slides[slideIndex].audioKey);
              }
            })
          })
        })
        .catch((err) => {
          console.log('error uploading file', err);
          return res.status(400).end('Something went wrong');
        })
    })
  },

}

export default articleController;
