import express from 'express';
import Article from '../../models/Article';
import VideoModel from '../../models/Video';
import { convertArticle } from '../../controllers/converter';
import { isAuthenticated } from '../../controllers/auth';
import UploadFormTemplateModel from '../../models/UploadFormTemplate';
import HumanVoiceModel from '../../models/HumanVoice';
import { saveTemplate } from '../../middlewares/saveTemplate';
import { checkExportableArticle } from '../../middlewares/checkExportableArticle';

const args = process.argv.slice(2);
const lang = args[1];

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
    .sort({ created_at: -1 })
    .populate('article')
    .populate('formTemplate')
    .populate('user', 'username email')
    .exec((err, videos) => {
      if (err) {
        return res.status(400).send('Something went wrong');
      }
      return res.status(200).json({ videos });
    })
  })

  // // ================ convert article to video and no upload to commons
  // router.post('/convert', isAuthenticated, (req, res) => {
  //   // PROD
  //   const {
  //     title,
  //     wikiSource,
  //     withSubtitles,
  //     autoDownload,
  //     extraUsers,
  //   } = req.body;

  //   const errors = []
  //   if (withSubtitles && lang === 'hi') {
  //     return res.status(400).send('Subtitles are not yet supported in the Hindi Videowiki, stay tuned!');
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

  //     // Check if that article was converted before
  //     VideoModel.find({ article: article._id, status: 'uploaded' }, (err, articles) => {
  //       if (err) {
  //         console.log(err);
  //         return res.status(400).send('Something went wrong');
  //       }
  //       if (articles && articles.length > 0) {
  //         return res.status(400).send('This article has been already exported');
  //       }
  //       const newVideo = {
  //         title,
  //         wikiSource,
  //         withSubtitles,
  //         user: req.user._id,
  //         article: article._id,
  //         extraUsers: extraUsers || [],
  //         autoDownload,
  //       };

  //       // Check if there's a video already being converted for this article
  //       VideoModel.count({ title, wikiSource, status: { $in: ['queued', 'progress'] } }, (err, count) => {
  //         if (err) {
  //           return res.status(400).send('Something went wrong, please try again');
  //         }

  //         if (count !== 0) {
  //           const message = 'This article is currently being converted.';
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

  // ================ convert article to video and upload to commons
  router.post('/convert', isAuthenticated, checkExportableArticle, saveTemplate, (req, res) => {
    // PROD
    const {
      fileTitle,
      description,
      categories,
      licence,
      source,
      sourceUrl,
      date,
      title,
      wikiSource,
      autoDownload,
      extraUsers,
      mode,
      humanvoiceId,
    } = req.body;
    console.log('body', req.body);
    const errors = []

    if (!fileTitle) {
      errors.push('File title is required')
    }
    if (!description) {
      errors.push('Description is required')
    }
    if (!categories || categories.length === 0) {
      errors.push('At least one category is required')
    }
    if (!source) {
      errors.push('Source field is required')
    }
    if (!date) {
      errors.push('Date field is required')
    }
    if (!licence) {
      errors.push('Licence field is required')
    }
    if (source && source === 'others' && !sourceUrl) {
      errors.push('Please specify the source of the file')
    }

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

      // Create a form template

      UploadFormTemplateModel.create({
        title,
        wikiSource,
        published: req.body.saveTemplate,
        user: req.user._id,
        mode: mode || 'new',
        form: { ...req.body, categories: req.body.categories.split(',') },
      }, (err, formTemplate) => {
        if (err) {
          console.log('error creating form template', err);
          return res.status(400).send('Something went wrong, please try again');
        }

        const newVideo = {
          title,
          wikiSource,
          lang: article.lang,
          autoDownload,
          formTemplate: formTemplate._id,
          user: req.user._id,
          article: article._id,
          articleVersion: article.version,
          extraUsers: extraUsers || [],
        };

        // Check if there's a video already being converted for this article
        VideoModel.count({ title, wikiSource, status: { $in: ['queued', 'progress'] } }, (err, count) => {
          if (err) {
            return res.status(400).send('Something went wrong, please try again');
          }

          if (count !== 0) {
            const message = 'This article is currently being converted. though We\'ve saved the form template for you to try later.';
            UploadFormTemplateModel.findByIdAndUpdate(formTemplate._id, { $set: { published: true } }, () => {
            })
            return res.status(400).send(message);
          }
          if (humanvoiceId) {
            HumanVoiceModel.findById(humanvoiceId, (err, humanvoice) => {
              if (err) {
                console.log('error finding human voice', err);
                return res.status(400).send('Something went wrong');
              }
              if (!humanvoice) {
                return res.status(400).send('Invalid human voice id provided');
              }
              VideoModel.create(newVideo, (err, video) => {
                if (err) {
                  console.log('error creating new video', err);
                  return res.status(400).send('something went wrong');
                }
                res.json({ video });
                VideoModel.findByIdAndUpdate(video._id, { $set: { lang: humanvoice.lang, humanvoice: humanvoiceId } }, { new: true }, (err, newVideo) => {
                  if (err) {
                    console.log('error updating video lang', err);
                  }
                  console.log('updated video human voice', err, newVideo)
                  return convertArticle({ videoId: video._id });
                })
                // If there's a human voice associated, change the language of the video document
              })
              // Check to see if that version of the article has been exported before in the specified language of humanvoice
            })
          } else {
            // Check to see if that version of the article has been exported before in the specified language
            VideoModel.count({ title, wikiSource, articleVersion: article.version, lang: article.lang, status: 'uploaded' }, (err, count) => {
              if (err) {
                console.log('error counting same version of videos', err);
                return res.status(400).send('Something went wrong');
              }
              if (count === 0 || count === undefined) {
                VideoModel.create(newVideo, (err, video) => {
                  if (err) {
                    console.log('error creating new video', err);
                    return res.status(400).send('something went wrong');
                  }

                  res.json({ video });
                  return convertArticle({ videoId: video._id });
                  // If there's a human voice associated, change the language of the video document
                })
              } else {
                return res.status(400).send('A video has already been exported for this version, please check the history page');
              }
            })
          }
          // Check to see if that version of the article has been exported before in the specified language
          // VideoModel.count({ title, wikiSource, articleVersion: article.version, status: 'uploaded' }, (err, count) => {
          //   if (err) {
          //     console.log('error counting same version of videos', err);
          //     return res.status(400).send('Something went wrong');
          //   }
          //   if (count === 0 || count === undefined){
          //     VideoModel.create(newVideo, (err, video) => {
          //       if (err) {
          //         console.log('error creating new video', err);
          //         return res.status(400).send('something went wrong');
          //       }

          //       res.json({ video });
          //       // If there's a human voice associated, change the language of the video document
          //       if (humanvoiceId) {
          //         HumanVoiceModel.findById(humanvoiceId, (err, humanvoice) => {
          //           if (err) {
          //             console.log('error finding human voice', err);
          //           }
          //           if (!humanvoice) {
          //             console.log('invalid human voice, falling back to TTS voice', humanvoiceId);
          //             return convertArticle({ videoId: video._id });
          //           }
          //           VideoModel.findByIdAndUpdate(video._id, { $set: { lang: humanvoice.lang, humanvoice: humanvoiceId } }, { new: true }, (err, newVideo) => {
          //             if (err) {
          //               console.log('error updating video lang', err);
          //             }
          //             console.log('updated video human voice', err, newVideo)
          //             return convertArticle({ videoId: video._id });
          //           })
          //         })
          //       } else {
          //         return convertArticle({ videoId: video._id });
          //       }
          //     })
          //   } else {
          //     return res.status(400).send('A video has already been exported for this version, please check the history page');
          //   }
          // })
        })
      })
    })
  })

  router.get('/by_article_title', (req, res) => {
    const { title, wikiSource, lang } = req.query;
    const searchQuery = { title: decodeURIComponent(title), commonsUrl: { $exists: true } };
    const articleQuery = { title: searchQuery.title, published: true };
    if (wikiSource) {
      searchQuery.wikiSource = wikiSource;
      articleQuery.wikiSource = wikiSource;
    }
    Article.findOne(articleQuery, (err, article) => {
      if (err) {
        console.log('error fetchign article by title', err);
        return res.status(400).send('Something went wrong');
      }
      if (!article) return res.status(400).send('Invalid article title');

      if (lang) {
        searchQuery.lang = lang;
      } else {
        searchQuery.lang = article.lang;
      }

      VideoModel.find(searchQuery)
      .sort({ version: -1 })
      .populate('formTemplate')
      .limit(1)
      .exec((err, videos) => {
        if (err) return res.status(400).send('Something went wrong');
        console.log(videos)
        if (videos.length > 0) {
          return res.json({ video: videos[0] });
        }
        return res.json({ videos });
      })
    })
  })

  router.get('/by_article_id/:articleId', (req, res) => {
    const { articleId } = req.params;
    const lang = req.query.lang;
    const searchQuery = { article: articleId, status: 'uploaded' };
    if (lang) {
      searchQuery.lang = lang;
    }
    console.log('searchquery', searchQuery)
    VideoModel.findOne(searchQuery, (err, video) => {
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

  router.get('/by_article_version/:version', (req, res) => {
    const { version } = req.params;
    const { title, wikiSource, lang } = req.query;

    VideoModel.findOne({ title, wikiSource, articleVersion: version, lang, status: 'uploaded' }, (err, video) => {
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

  router.get('/by_article_version/:version', (req, res) => {
    const { version } = req.params;
    const { title, wikiSource } = req.query;

    VideoModel.findOne({ title, wikiSource, articleVersion: version, status: 'uploaded' }, (err, video) => {
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

// function exportArticle(title, wikiSource) {
//   Article.findOne({ title, wikiSource, published: true }, (err, article) => {

//     const newVideo = {
//       title,
//       wikiSource,
//       withSubtitles: true,
//       // user: req.user._id,
//       article: article._id,
//     };

//     VideoModel.create(newVideo, (err, video) => {
//       if (err) {
//         console.log('error creating new video', err);
//       }

//       console.log('video is ', video)
//       convertArticle({ videoId: video._id });
//     })
//   })
// }

// setTimeout(() => {
//   exportArticle('Wikipedia:VideoWiki/Katherine_Maher', 'https://en.wikipedia.org')
// }, 5000);
