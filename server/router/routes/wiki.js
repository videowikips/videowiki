import express from 'express'
import multer from 'multer'
import multerS3 from 'multer-s3'
import AWS from 'aws-sdk'
import path from 'path'
import uuidV4 from 'uuid/v4'
import wiki from 'wikijs'
import User from '../../models/User'

import { bucketName, accessKeyId, secretAccessKey } from '../../config/aws'

import { search, getPageContentHtml, convertArticleToVideoWiki, getInfobox, getArticleSummary, METAWIKI_SOURCE, getArticleWikiSource } from '../../controllers/wiki'
import { updateMediaToSlide, fetchArticleAndUpdateReads, cloneArticle } from '../../controllers/article'

const s3 = new AWS.S3({
  signatureVersion: 'v4',
  region: 'us-east-1',
})

import Article from '../../models/Article'


// if we're in production mode, use AWS S3.
// otherwise use local storage

let storage;

if (process.env.ENV == 'production') {

  storage = multerS3({
    s3,
    bucket: bucketName,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) =>
      cb(null, `${uuidV4()}.${file.originalname.split('.').pop()}`),
  });

} else {

  storage = multer.diskStorage({
    destination: (req, file, cb) =>
      cb(null, path.join(__dirname, '/../../../public/uploads/')),
    filename: (req, file, cb) =>
      cb(null, `${uuidV4()}.${file.originalname.split('.').pop()}`),
  });

}

const upload = multer({ storage });
const console = process.console
const router = express.Router()

const ENWIKI_SOURCE = 'https://en.wikipedia.org';

module.exports = () => {

  // ========== Search
  router.get('/search', (req, res) => {
    let { searchTerm, limit, wikiSource = ENWIKI_SOURCE } = req.query

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
    const { title, slideNumber, url } = req.body

    const editor = req.cookies['vw_anonymous_id']

    updateMediaToSlide(title, slideNumber, editor, {
      mimetype: 'image/jpg',
      filepath: url,
    }, (err) => {
      if (err) {
        return res.status(500).send('Error while uploading file!')
      }

      res.json({
        title,
        slideNumber,
        mimetype: 'image',
        filepath: url,
      })
    })
  })

  // ============== Upload media to slide
  router.post('/article/upload', upload.single('file'), (req, res) => {
    const { title, slideNumber } = req.body
    const { file } = req

    const editor = req.cookies['vw_anonymous_id']
    // file path is either in location or path field,
    // depends on using local storage or multerS3
    let filepath;
    if (file.location) {
      filepath = file.location;
    } else if (file.path) {
      filepath = file.path.substring(file.path.indexOf('/uploads'), file.path.length);
    }

    updateMediaToSlide(title, slideNumber, editor, {
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
    const { title, wikiSource = ENWIKI_SOURCE } = req.query;
    if (!title) {
      return res.send('Invalid wiki title!');
    }
    

    getArticleSummary(wikiSource, title, (err, data) => {
      if (err) {
        return res.status(500).send(err);
      }
      return res.json(data);
    })
  })

  // ============== Convert wiki to video wiki
  router.get('/convert', (req, res) => {
    const { title, wikiSource = ENWIKI_SOURCE } = req.query
    if (!title) {
      return res.send('Invalid wiki title!')
    }
    
    const userId = req.cookies['vw_anonymous_id'] || uuidV4()
    res.cookie('vw_anonymous_id', userId, { maxAge: 30 * 24 * 60 * 60 * 1000 })

    let name = 'Anonymous'

    if (req.user) {
      const { firstName, lastName, email } = req.user
      name = `${firstName}-${lastName}_${email}`
    } else {
      name = `Anonymous_${req.cookies['vw_anonymous_id']}`
    }
    // Find the artilce in the given wiki or in meta.mediawiki
    getArticleWikiSource(wikiSource, title)
    .then(wikiSource => {

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

  })

  // ================ Get infobox
  router.get('/infobox', (req, res) => {
    const { title, wikiSource = ENWIKI_SOURCE } = req.query

    if (!title) {
      return res.send('Invalid wiki title!')
    }

    getInfobox(wikiSource, title, (err, infobox) => {
        if (err) {
          console.log(err)
          return res.status(500).send('Error while fetching infobox!')
        }
  
        res.json({ infobox })
      })
    })

  // ============== Get wiki content
  router.get('/', (req, res) => {
    const { title, wikiSource = ENWIKI_SOURCE } = req.query

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

          return res.send(result)
        })
      }
    })
  })

  return router
}
