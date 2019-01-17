import express from 'express';
import Article from '../../models/Article';
import VideoModel from '../../models/Video';
import { convertArticle } from '../../controllers/converter';
// import UploadFormTemplateModel from '../../models/UploadFormTemplate';
// import { saveTemplate } from '../../middlewares/saveTemplate';

const router = express.Router()

module.exports = () => {
  router.get('/history', (req, res) => {
    const { title, wikiSource } = req.query;
    if (!title) {
      return res.status(400).send('Title is a required field');
    }
    const query = {
      title,
      status: 'uploaded',
    };
    // Wikisource is optional
    if (wikiSource) {
      query.wikiSource = wikiSource;
    }

    VideoModel.find(query)
    .sort({ version: -1 })
    .populate('article')
    .populate('formTemplate')
    .exec((err, videos) => {
      if (err) {
        return res.status(400).send('Something went wrong');
      }
      return res.status(200).json({ videos });
    })
  })

  // ================ convert article to video and no upload to commons
  router.post('/convert', isAuthenticated, (req, res) => {
    // PROD
    const {
      title,
      wikiSource,
    } = req.body;

    const errors = []

    if (!title || !wikiSource) {
      return errors.push('Title and wiki source are required fields');
    }

    if (errors.length > 0) {
      console.log(errors)
      return res.status(400).send(errors.join(', '))
    }

    Article.findOne({ title, wikiSource, published: true }, (err, article) => {
      if (err) {
        return res.status(400).send('Something went wrong');
      }
      if (!article) {
        return res.status(400).send('Invalid article title or wiki source');
      }

      // allow normal articles with less than 50 slides to be converted
      if (article.ns === 0 && article.slides.length > 50) {
        return res.status(400).send('only custom articles and normal articles with less than 50 slides can be exported now')
      }

      // Check if that article was converted before
      VideoModel.find({ article: article._id, status: 'uploaded' }, (err, articles) => {
        if (err) {
          console.log(err);
          return res.status(400).send('Something went wrong');
        }
        if (articles && articles.length > 0) {
          return res.status(400).send('This article has been already exported');
        }
        const newVideo = {
          title,
          wikiSource,
          withSubtitles: true,
          user: req.user._id,
          article: article._id,
        };

        // Check if there's a video already being converted for this article
        VideoModel.count({ title, wikiSource, status: { $in: ['queued', 'progress'] } }, (err, count) => {
          if (err) {
            return res.status(400).send('Something went wrong, please try again');
          }

          if (count !== 0) {
            const message = 'This article is currently being converted.';
            return res.status(400).send(message);
          }

          VideoModel.create(newVideo, (err, video) => {
            if (err) {
              console.log('error creating new video', err);
              return res.status(400).send('something went wrong');
            }

            console.log('video is ', video)
            convertArticle({ videoId: video._id });
            return res.json({ video });
          })
        })
      })
    })
  })

  // // ================ convert article to video and upload to commons
  // router.post('/convert', isAuthenticated, saveTemplate, (req, res) => {
  //   // PROD
  //   const {
  //     fileTitle,
  //     description,
  //     categories,
  //     licence,
  //     source,
  //     sourceUrl,
  //     date,
  //     title,
  //     wikiSource,
  //     withSubtitles,
  //   } = req.body;

  //   const errors = []

  //   if (!fileTitle) {
  //     errors.push('File title is required')
  //   }
  //   if (!description) {
  //     errors.push('Description is required')
  //   }
  //   if (!categories || categories.length === 0) {
  //     errors.push('At least one category is required')
  //   }
  //   if (!source) {
  //     errors.push('Source field is required')
  //   }
  //   if (!date) {
  //     errors.push('Date field is required')
  //   }
  //   if (!licence) {
  //     errors.push('Licence field is required')
  //   }
  //   if (source && source === 'others' && !sourceUrl) {
  //     errors.push('Please specify the source of the file')
  //   }

  //   if (!title || !wikiSource) {
  //     return errors.push('Title and wiki source are required fields');
  //   }

  //   if (errors.length > 0) {
  //     console.log(errors)
  //     return res.status(400).send(errors.join(', '))
  //   }

  //   Article.findOne({ title, wikiSource, published: true }, (err, article) => {
  //     if (err) {
  //       return res.status(400).send('Something went wrong');
  //     }
  //     if (!article) {
  //       return res.status(400).send('Invalid article title or wiki source');
  //     }

  //     // allow normal articles with less than 50 slides to be converted
  //     if (article.ns === 0 && article.slides.length > 50) {
  //       return res.status(400).send('only custom articles and normal articles with less than 50 slides can be exported now')
  //     }

  //     // Create a form template

  //     UploadFormTemplateModel.create({
  //       title,
  //       wikiSource,
  //       published: req.body.saveTemplate,
  //       user: req.user._id,
  //       form: { ...req.body, categories: req.body.categories.split(',') },
  //     }, (err, formTemplate) => {
  //       if (err) {
  //         console.log('error creating form template', err);
  //         return res.status(400).send('Something went wrong, please try again');
  //       }

  //       const newVideo = {
  //         title,
  //         wikiSource,
  //         withSubtitles,
  //         formTemplate: formTemplate._id,
  //         user: req.user._id,
  //         article: article._id,
  //       };

  //       // Check if there's a video already being converted for this article
  //       VideoModel.count({ title, wikiSource, status: { $in: ['queued', 'progress'] } }, (err, count) => {
  //         if (err) {
  //           return res.status(400).send('Something went wrong, please try again');
  //         }

  //         if (count !== 0) {
  //           const message = 'This article is currently being converted. though We\'ve saved the form template for you to try later.';
  //           UploadFormTemplateModel.findByIdAndUpdate(formTemplate._id, { $set: { published: true } }, () => {
  //           })
  //           return res.status(400).send(message);
  //         }

  //         VideoModel.create(newVideo, (err, video) => {
  //           if (err) {
  //             console.log('error creating new video', err);
  //             return res.status(400).send('something went wrong');
  //           }

  //           console.log('video is ', video)
  //           convertArticle({ videoId: video._id });
  //           return res.json({ video });
  //         })
  //       })
  //     })
  //   })
  // })

  router.get('/by_article_id/:articleId', (req, res) => {
    const { articleId } = req.params;

    VideoModel.findOne({ article: articleId, status: 'uploaded' }, (err, video) => {
      if (err) {
        console.log(err);
        return res.status(400).send('Something went wrong');
      }
      if (video) {
        return res.json({ exported: true, video });
      }
      return res.json({ exported: false });
    })
  })

  router.get('/:id', (req, res) => {
    const { id } = req.params;

    VideoModel.findById(id, (err, video) => {
      if (err) {
        return res.status(400).send('Something went wrong while fetching the video');
      }
      if (!video) {
        return res.status(400).send('Invalid video');
      }

      return res.json({ video });
    })
  });

  return router
}

const isAuthenticated = (req, res, next) => {
  // if user is authenticated in the session, call the next() to call the next request handler
  // Passport adds this method to request object. A middleware is allowed to add properties to
  // request and response objects
  if (req.isAuthenticated()) {
    return next()
  }
  // if the user is not authenticated then redirect him to the login page
  res.send(401, 'Unauthorized!')
}
