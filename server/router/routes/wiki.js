import express from 'express'
// import multer from 'multer'
import mimetypes from 'mime-types'
import AWS from 'aws-sdk'
// import path from 'path'
import uuidV4 from 'uuid/v4'
// import wiki from 'wikijs'
// import User from '../../models/User'
import UploadFormTemplate from '../../models/UploadFormTemplate';
// import { bucketName, accessKeyId, secretAccessKey } from '../../config/aws'

import { search, getPageContentHtml, convertArticleToVideoWiki, getInfobox, getArticleSummary, getArticleWikiSource } from '../../controllers/wiki'
import { updateMediaToSlide, fetchArticleAndUpdateReads, cloneArticle } from '../../controllers/article'
import { runBotOnArticles } from '../../bots/autoupdate/index';

import Article from '../../models/Article'
import { uploadFileToWikiCommons } from '../../middlewares/wikiUpload'
import uploadLocal from '../../middlewares/uploadLocal'
import { saveTemplate } from '../../middlewares/saveTemplate';

const s3 = new AWS.S3({
  signatureVersion: 'v4',
  region: 'us-east-1',
})

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

// if we're in production mode, use Wiki Commons.
// otherwise mock using local storage

let uploadFileMiddleware;
if (process.env.ENV === 'production') {
  uploadFileMiddleware = uploadFileToWikiCommons
} else {
  uploadFileMiddleware = (req, res, next) => {
    const { file } = req.body
    req.file = {
      location: file,
      mimetype: mimetypes.lookup(file),
    }
    next()
  }
}

const console = process.console
const router = express.Router()
const lang = process.argv.slice(2)[1];

const DEFAULT_WIKISOURCE = `https://${lang}.wikipedia.org`

module.exports = () => {
  // ========== Search
  router.get('/search', (req, res) => {
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
        console.log('')
        return {
          title: result.title,
          description: result.source,
        }
      })

      return res.json({ searchResults })
    })
  })

  // ============== upload image url to slide
  router.post('/article/imageUpload', (req, res) => {
    const { title, wikiSource, slideNumber, url, mimetype } = req.body
    console.log(req.body, mimetype || 'mime type ')
    const editor = req.cookies['vw_anonymous_id']

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
  })

  // // ============== Upload media to slide
  // // uploadFileToWikiCommons
  // router.post('/article/uploadCommons', isAuthenticated, saveTemplate, (req, res) => {
  //   const { title, wikiSource, slideNumber, file } = req.body
  //   const editor = req.cookies['vw_anonymous_id']
  //   console.log('file from controller ', file)

  //   // file path is either in location or path field,
  //   // depends on using local storage or multerS3
  //   const filepath = file;

  //   updateMediaToSlide(title, wikiSource, slideNumber, editor, {
  //     mimetype: 'image',
  //     filepath,
  //   }, (err) => {
  //     if (err) {
  //       return res.status(500).send('Error while uploading file!')
  //     }

  //     res.json({
  //       title,
  //       slideNumber,
  //       mimetype: 'image',
  //       filepath,
  //     })
  //   })
  // })

  // ============== Upload media to slide
  // uploadFileToWikiCommons  ==========> PRODUCTION
  router.post('/article/uploadCommons', isAuthenticated, saveTemplate, uploadFileToWikiCommons, (req, res) => {
    const { title, wikiSource, slideNumber } = req.body
    const { file } = req
    const editor = req.cookies['vw_anonymous_id']
    console.log('file from controller ', file)

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
  })

   // ============== Upload media to locally temporarly slide
  router.post('/article/uploadTemp', isAuthenticated, uploadLocal, (req, res) => {
    const { title, wikiSource, slideNumber } = req.body
    const { file } = req
    // const editor  = req.cookies['vw_anonymous_id'];
    console.log(req.user)
    console.log('file from controller ', file, title, wikiSource, slideNumber)
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
  })

  // ============== Fetch VideoWiki article by title
  router.get('/article', (req, res) => {
    const { title, edit } = req.query

    if (!title) {
      return res.send('Invalid wiki title!')
    }

    if (edit === 'true') {
      const userId = req.cookies['vw_anonymous_id'] || uuidV4()
      res.cookie('vw_anonymous_id', userId, { maxAge: 30 * 24 * 60 * 60 * 1000 })
      // clone doc etc
      cloneArticle(title, userId, (err, article) => {
        if (err) {
          console.log(err)
          return res.send('Error while fetching data!')
        }

        res.json(article)
      })
    } else {
      fetchArticleAndUpdateReads(title, (err, article) => {
        if (err) {
          console.log(err)
          return res.send('Error while fetching data!')
        }

        res.json(article)
      })
    }
  })

  // ============== Fetch article summary by title
  router.get('/article/summary', (req, res) => {
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
  })

  // ============== Convert wiki to video wiki
  router.get('/convert', (req, res) => {
    const { title, wikiSource = DEFAULT_WIKISOURCE } = req.query
    if (!title) {
      return res.send('Invalid wiki title!')
    }
    const userId = req.cookies['vw_anonymous_id'] || uuidV4()
    res.cookie('vw_anonymous_id', userId, { maxAge: 30 * 24 * 60 * 60 * 1000 })

    let name = 'Anonymous'

    if (req.user) {
      const { username, email } = req.user
      name = `${username}_${email}`
    } else {
      name = `Anonymous_${req.cookies['vw_anonymous_id']}`
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
      .catch(err => {
        console.log(err);
        res.status(500).send(err);
      })
  });

  router.get('/updateArticle', (req, res) => {
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
  });
  // ================ Get infobox
  router.get('/infobox', (req, res) => {
    const { title, wikiSource = DEFAULT_WIKISOURCE } = req.query

    if (!title) {
      return res.send('Invalid wiki title!')
    }

    getInfobox(wikiSource, title, (err, infobox) => {
      console.log(err)
      return res.json({ infobox })
    })
  })

  // ============== Get wiki content
  router.get('/', (req, res) => {
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

          console.log('wikisource is ', wikiSource)
          return res.json({ wikiContent: result, wikiSource });
        })
      }
    })
  })

  router.get('/forms', isAuthenticated, (req, res) => {
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
  })
  return router
}
