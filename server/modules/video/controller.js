import { Article, Video as VideoModel, UploadFormTemplate as UploadFormTemplateModel, Humanvoice as HumanVoiceModel } from '../shared/models';
import { convertArticle } from '../shared/services/exporter';
import { fetchArticleContributors } from '../shared/services/wiki';
import moment from 'moment';

const lang = process.argv.slice(2)[1];

const controller = {
  getVideoById(req, res) {
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
  },
  getVideoHistory(req, res) {
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
  },

  exportVideo(req, res) {
    // PROD
    const {
      title,
      wikiSource,
      humanvoiceId,
      fileTitle,
    } = req.body;

    const formValues = {
      title,
      wikiSource,
      fileTitle: humanvoiceId ? fileTitle : title,
      description: title,
      categories: ['Category:Videowiki'],
      licence: 'cc-by-sa-3.0',
      source: 'others',
      sourceAuthors: `See [${wikiSource}/wiki/${title} script] and authors listed in details below.`,
      sourceUrl: `${process.env.HOST_URL}/${lang}/videowiki/${title}?wikiSource=${wikiSource}`,
      date: moment().format('YYYY-MM-DD'),
    }

    const errors = [];

    if (!title || !wikiSource) {
      return errors.push('Title and wiki source are required fields');
    }

    if (errors.length > 0) {
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
        user: req.user._id,
        form: formValues,
      }, (err, formTemplate) => {
        if (err) {
          console.log('error creating form template', err);
          return res.status(400).send('Something went wrong, please try again');
        }

        const newVideo = {
          title,
          wikiSource,
          lang: article.lang,
          formTemplate: formTemplate._id,
          user: req.user._id,
          article: article._id,
          articleVersion: article.version,
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
        })
      })

    })
  },

  getVideoByArticleTitle(req, res) {
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
        if (videos.length > 0) {
          return res.json({ video: videos[0] });
        }
        return res.json({ videos });
      })
    })
  },

  getVideoByArticleId(req, res) {
    const { articleId } = req.params;
    const lang = req.query.lang;
    const searchQuery = { article: articleId, status: 'uploaded' };
    if (lang) {
      searchQuery.lang = lang;
    }
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
  },
  getVideoByArticleVersion(req, res) {
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
  },
};

export default controller;
