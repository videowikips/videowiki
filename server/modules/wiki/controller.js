import uuidV4 from 'uuid/v4'
import { UploadFormTemplate, Article } from '../shared/models';

import { search, getPageContentHtml, convertArticleToVideoWiki, getInfobox, getArticleSummary, getArticleWikiSource, updateTitleOnAllModels } from './utils'
import {
  updateMediaToSlide,
  fetchArticleAndUpdateReads,
  cloneArticle,
  isCustomVideowikiScript,
  isMDwikiScript,
} from '../shared/services/article';
import { runBotOnArticle, runBotOnArticles } from '../../bots/autoupdate/index';
import { fetchCommonsVideoUrlByName, fetchImagesFromCommons, fetchGifsFromCommons, fetchVideosFromCommons, fetchCategoriesFromCommons } from '../shared/services/wikiCommons';
import { fetchArticleRevisionId, fetchTitleRedirect } from '../shared/services/wiki';
import { CUSTOM_VIDEOWIKI_LANG_PREFIXES } from '../shared/constants';
const lang = process.argv.slice(2)[1];
const DEFAULT_WIKISOURCE = `https://${lang}.wikipedia.org`;

const controller = {
  searchWikiArticles (req, res) {
    const { searchTerm, limit, wikiSource = DEFAULT_WIKISOURCE } = req.query

    if (!searchTerm) {
      return res.send('Invalid searchTerm!')
    }

    search(wikiSource, searchTerm, limit, (err, results) => {
      if (err) {
        console.log(err)
        return res.send('Error while searching!')
      }

      const searchResults = results.map((result) => {
        return {
          title: result.title,
          description: result.source,
        }
      })

      return res.json({ searchResults })
    })
  },
  // =========== wikimedia commons image search
  searchWikiCommonsImages(req, res) {
    const { searchTerm } = req.query

    if (searchTerm && searchTerm !== '') {
      fetchImagesFromCommons(searchTerm, (err, images) => {
        if (err) {
          return res.status(500).send('Error while fetching images!')
        }

        res.json({ images })
      })
    } else {
      res.json({ images: [] })
    }
  },

  // =========== wikimedia commons gif search
  searchWikiCommonsGifs(req, res) {
    const { searchTerm } = req.query

    if (searchTerm && searchTerm !== '') {
      fetchGifsFromCommons(searchTerm, (err, gifs) => {
        if (err) {
          return res.status(500).send('Error while fetching gifs!')
        }

        res.json({ gifs })
      })
    } else {
      res.json({ gifs: [] })
    }
  },

  searchWikiCommonsVideos(req, res) {
    const { searchTerm } = req.query

    if (searchTerm && searchTerm !== '') {
      fetchVideosFromCommons(searchTerm, (err, videos) => {
        if (err) {
          return res.status(500).send('Error while fetching gifs!')
        }

        res.json({ videos })
      })
    } else {
      res.json({ videos: [] })
    }
  },

  searchWikiCommonsCategories(req, res) {
    const { searchTerm } = req.query

    if (searchTerm && searchTerm !== '') {
      fetchCategoriesFromCommons(searchTerm, (err, categories) => {
        if (err) {
          return res.status(500).send('Error while fetching categories!')
        }

        res.json({ categories })
      })
    } else {
      res.json({ categories: [] })
    }
  },

  getArticleByTitle(req, res) {
    const { title, edit } = req.query;
    let { wikiSource } = req.query;
    if (!wikiSource) {
      wikiSource = DEFAULT_WIKISOURCE;
    }
    if (!title) {
      return res.send('Invalid wiki title!')
    }

    if (edit === 'true') {
      const userId = req.user ? req.user._id : (req.headers['x-vw-anonymous-id'] || uuidV4());
      // res.cookie('vw_anonymous_id', userId, { maxAge: 30 * 24 * 60 * 60 * 1000 })
      // clone doc etc
      Article.findOne({ title, wikiSource, published: true }, (err, article) => {
        if (err) {
          console.log(err);
          return res.status(400).send('Error while fetching data!');
        }
        if (!article) return res.status(400).send('Invalid article title');
        if (article.mediaSource === 'script') return res.status(400).send('This article media is only editable in the script page');

        cloneArticle(title, userId, (err, article) => {
          if (err) {
            console.log(err)
            return res.send('Error while fetching data!')
          }
          res.json(article)
        })
      })
    } else {
      if (false) {
        Article.findOne({ title, wikiSource, published: true }, (err, article) => {
          if (err) return res.send('Error while fetching data');
          if (!article) return res.json(null);
          return res.json(article);
        })
      } else {
        fetchTitleRedirect(title, wikiSource, (err, redirectInfo) => {
          if (err || !redirectInfo) {
            console.log('error fetching title redirect data', err);
          }
          if (redirectInfo && redirectInfo.redirect && redirectInfo.title) {
            // If there's a redirect on that title, update all models that have "title" field matching old title
            updateTitleOnAllModels(title, redirectInfo.title, (err) => {
              if (err) return res.status(400).send('Something went wrong');
              return res.json({ redirect: true, title: redirectInfo.title, wikiSource });
            })
          } else {
            Article.findOne({ title, wikiSource, published: true }, (err, article) => {
              if (err) return res.send('Error while fetching data');
              if (!article) return res.json(null);
              if (process.env.ENV === 'development') return res.json(article);

              fetchArticleRevisionId(article.title, article.wikiSource, (err, revisionId) => {
                if (err) return res.send('Error while fetching data');
                if (article.wikiRevisionId !== revisionId) {
                  runBotOnArticle({ title, wikiSource }, () => {
                    fetchArticleAndUpdateReads({ title: article.title, wikiSource: article.wikiSource }, (err, article) => {
                      if (err) {
                        console.log(err)
                        return res.send('Error while fetching data!')
                      }
                      res.json(article)
                    })
                  })
                } else {
                  fetchArticleAndUpdateReads({ title: article.title, wikiSource: article.wikiSource }, (err, article) => {
                    if (err) {
                      console.log(err)
                      return res.send('Error while fetching data!')
                    }
                    res.json(article)
                  })
                }
              })
            })
          }
        })
      }
    }
  },

  getArticleSummaryByTitle(req, res) {
    const { title, wikiSource = DEFAULT_WIKISOURCE } = req.query;
    if (!title) {
      return res.send('Invalid wiki title!')
    }
    getArticleSummary(wikiSource, title, (err, data) => {
      if (err) {
        return res.status(500).send(err)
      }
      return res.json(data)
    })
  },
  convertWikiToVideowiki(req, res) {
    const { title, wikiSource = DEFAULT_WIKISOURCE } = req.query
    if (!title) {
      return res.send('Invalid wiki title!')
    }
    console.log('-----------------------------isCustomVideowikiScript(title)---------------------------', isCustomVideowikiScript(title))
    console.log('-----------------------------isMDwikiScript(wikiSource, title)--------------------------', isMDwikiScript(wikiSource, title))
    if (!isCustomVideowikiScript(title) && !isMDwikiScript(wikiSource, title)) {
      return res.status(400).send(`Only scripts prefixed with ${CUSTOM_VIDEOWIKI_LANG_PREFIXES[lang]} or sandbox articles and MDwiki Video: prefixed articles can be converted`);
    }
    let name = 'Anonymous'

    if (req.user) {
      const { username, email } = req.user
      name = `${username}_${email}`
    } else {
      name = `Anonymous_${req.headers['x-vw-anonymous-id']}`
    }
    // Find the artilce in the given wiki or in meta.mediawiki
    getArticleWikiSource(wikiSource, title)
      .then((wikiSource) => {
        convertArticleToVideoWiki(wikiSource, title, req.user, name, (err, result) => {
          if (err) {
            return res.status(500).send(err)
          }

          res.json(result)
        })
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send(err);
      })
  },
  updateVideowikiArticle(req, res) {
    const { title, wikiSource } = req.query;

    if (!title || !wikiSource) {
      return res.status(400).send('Title and the Wikisource are required')
    }
    Article.findOne({ title, wikiSource }, (err, article) => {
      if (err) {
        return res.status(400).send('Something went wrong, please try again')
      }
      if (!article) {
        return res.status(400).send('Invalid title');
      }

      runBotOnArticles([article.title], (err) => {
        if (err) {
          return res.status(400).send('Something went wrong, please try again')
        }
        return res.send('Article updated successfully!');
      })
    })
  },
  getArticleInfobox(req, res) {
    const { title, wikiSource = DEFAULT_WIKISOURCE } = req.query

    if (!title) {
      return res.send('Invalid wiki title!')
    }

    if (isCustomVideowikiScript(title) || isMDwikiScript(wikiSource, title)) return res.json({ infobox: '' });

    getInfobox(wikiSource, title, (err, infobox) => {
      return res.json({ infobox })
    })
  },
  uploadTempFile(req, res) {
    const { title, wikiSource, slideNumber } = req.body
    const { file } = req
    // const editor  = req.cookies['vw_anonymous_id'];
    // file path is either in location or path field,
    // depends on using local storage or multerS3
    let filepath
    if (file.location) {
      filepath = file.location
    } else if (file.path) {
      filepath = file.path.substring(file.path.indexOf('/uploads'), file.path.length)
    }

    res.json({
      title,
      slideNumber,
      mimetype: file.mimetype.split('/')[0],
      filepath,
    })
  },
  uploadImageURLToSlide(req, res) {
    const { title, wikiSource, slideNumber, url, mimetype } = req.body
    const editor = req.user ? req.user._id : req.headers['x-vw-anonymous-id']
    updateMediaToSlide(title, wikiSource, slideNumber, editor, {
      mimetype: mimetype || 'image/jpg',
      filepath: url,
    }, (err) => {
      if (err) {
        return res.status(500).send('Error while uploading file!')
      }

      res.json({
        title,
        slideNumber,
        mimetype: mimetype ? mimetype.split('/')[0] : 'image',
        filepath: url,
      })
    })
  },

  uploadImageToCommonsSlide(req, res) {
    const { title, wikiSource, slideNumber } = req.body
    const { file } = req
    const editor = req.user._id;

    // file path is either in location or path field,
    // depends on using local storage or multerS3
    let filepath
    if (file.location) {
      filepath = file.location
    } else if (file.path) {
      filepath = file.path.substring(file.path.indexOf('/uploads'), file.path.length)
    }

    updateMediaToSlide(title, wikiSource, slideNumber, editor, {
      mimetype: file.mimetype,
      filepath,
    }, (err) => {
      if (err) {
        return res.status(500).send('Error while uploading file!')
      }

      res.json({
        title,
        slideNumber,
        mimetype: file.mimetype.split('/')[0],
        filepath,
      })
    })
  },
  getVideoByName(req, res) {
    const { url } = req.body;
    if (!url) {
      return res.status(400).send('Invalid video url');
    }
    fetchCommonsVideoUrlByName(url, (err, result) => {
      if (err) {
        console.log(err)
        return res.send('Error while fetching content!')
      }
      if (!result) return res.status(400).send('Canno find file content');
      return res.json({ url: result })
    })
  },
  getWikiContent(req, res) {
    const { title, wikiSource = DEFAULT_WIKISOURCE } = req.query

    if (!title) {
      return res.send('Invalid wiki title!')
    }

    // Check if DB already contains a VideoWiki article. If yes, redirect user to
    // videowiki article.

    Article.findOne({ title, wikiSource, editor: 'videowiki-bot' }, (err, article) => {
      if (err) {
        console.log(err)
        return res.send('Error while fetching content!')
      }

      if (article) {
        if (article.published) {
          return res.json({ redirect: true, path: `/videowiki/${title}?wikiSource=${wikiSource}` })
        } else {
          return res.json({ redirect: true, path: `/wiki/convert/${title}?wikiSource=${wikiSource}` })
        }
      } else {
        getPageContentHtml(wikiSource, title, (err, result) => {
          if (err) {
            console.log(err)
            return res.send('Error while fetching content!')
          }

          return res.json({ wikiContent: result, wikiSource });
        })
      }
    })
  },
  getUserUploadForms(req, res) {
    const { title } = req.query;
    const userId = req.user._id;

    UploadFormTemplate.find({ title, user: userId, published: true }, (err, forms) => {
      if (err) {
        return res.status(400).send('Error while fetching the forms');
      }

      if (!forms) {
        return res.json({ forms: [] });
      }

      return res.json({ forms });
    })
  },
};

export default controller;
