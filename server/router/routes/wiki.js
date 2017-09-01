import express from 'express'
import multer from 'multer'
import multerS3 from 'multer-s3'
import AWS from 'aws-sdk'
import path from 'path'
import uuidV4 from 'uuid/v4'

import User from '../../models/User'

import { bucketName, accessKeyId, secretAccessKey } from '../../config/aws'

import { search, getPageContentHtml, convertArticleToVideoWiki, getInfobox } from '../../controllers/wiki'
import { updateMediaToSlide, fetchArticleAndUpdateReads, cloneArticle } from '../../controllers/article'

const s3 = new AWS.S3({
  signatureVersion: 'v4',
  region: 'us-east-1',
})

import Article from '../../models/Article'


const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, '/../../../public/uploads/')),
  filename: (req, file, cb) =>
    cb(null, `${uuidV4()}.${file.originalname.split('.').pop()}`),
})

const storageS3 = multerS3({
  s3,
  bucket: bucketName,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) =>
    cb(null, `${uuidV4()}.${file.originalname.split('.').pop()}`),
})

const upload = multer({ storage: storageS3 })

const console = process.console
const router = express.Router()

module.exports = () => {
 
  // ========== Search
  router.get('/search', (req, res) => {
    const { searchTerm, limit } = req.query

    if (!searchTerm) {
      return res.send('Invalid searchTerm!')
    }

    search(searchTerm, limit, (err, results) => {
      if (err) {
        console.log(err)
        return res.send('Error while searching!')
      }

      const searchResults = results.map((result) => {
        console.log('')
        return {
          title: result,
          description: '',
        }
      })

      return res.json({ searchResults })
    })
  })

  // ============== upload image url to slide
  router.post('/article/imageUpload', upload.single('file'), (req, res) => {
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

    updateMediaToSlide(title, slideNumber, editor, {
      mimetype: file.mimetype,
      filepath: file.location,
    }, (err) => {
      if (err) {
        return res.status(500).send('Error while uploading file!')
      }

      res.json({
        title,
        slideNumber,
        mimetype: file.mimetype.split('/')[0],
        filepath: file.location,
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

  // ============== Convert wiki to video wiki
  router.get('/convert', (req, res) => {
    const { title } = req.query
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

    convertArticleToVideoWiki(title, req.user, name, (err, result) => {
      if (err) {
        return res.status(500).send(err)
      }

      res.json(result)
    })
  })

  // ================ Get infobox
  router.get('/infobox', (req, res) => {
    const { title } = req.query

    if (!title) {
      return res.send('Invalid wiki title!')
    }

    getInfobox(title, (err, infobox) => {
      if (err) {
        console.log(err)
        return res.status(500).send('Error while fetching infobox!')
      }

      res.json({ infobox })
    })
  })

  // ============== Get wiki content
  router.get('/', (req, res) => {
    const { title } = req.query

    if (!title) {
      return res.send('Invalid wiki title!')
    }

    // Check if DB already contains a VideoWiki article. If yes, redirect user to
    // videowiki article.

    Article.findOne({ title, editor: 'videowiki-bot' }, (err, article) => {
      if (err) {
        console.log(err)
        return res.send('Error while fetching content!')
      }

      if (article) {
        if (article.published) {
          return res.json({ redirect: true, path: `/videowiki/${title}` })
        } else {
          return res.json({ redirect: true, path: `/wiki/convert/${title}` })
        }
      } else {
        getPageContentHtml(title, (err, result) => {
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
