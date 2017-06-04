import express from 'express'
import multer from 'multer'
import path from 'path'
import uuidV4 from 'uuid/v4'

import { search, getPageContentHtml, breakTextIntoSlides } from '../../controllers/wiki'
import { fetchArticle, updateMediaToSlide } from '../../controllers/article'

import Article from '../../models/Article'

const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, '/../../../public/uploads/')),
  filename: (req, file, cb) =>
    cb(null, `${uuidV4()}.${file.originalname.split('.').pop()}`),
})

const upload = multer({ storage })

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

  // ============== Upload media to slide
  router.post('/article/upload', upload.single('file'), (req, res) => {
    const { title, slideNumber } = req.body
    const { file } = req

    updateMediaToSlide(title, slideNumber, {
      mimetype: file.mimetype,
      filepath: file.filename,
    }, (err) => {
      if (err) {
        return res.status(500).send('Error while uploading file!')
      }

      res.json({
        mimetype: file.mimetype,
        filepath: file.filename,
      })
    })
  })

  // ============== Fetch VideoWiki article by title
  router.get('/article', (req, res) => {
    const { title } = req.query

    if (!title) {
      return res.send('Invalid wiki title!')
    }

    fetchArticle(title, (err, article) => {
      if (err) {
        return res.send('Error while fetching data!')
      }

      res.json(article)
    })
  })

  // ============== Convert wiki to video wiki
  router.get('/convert', (req, res) => {
    const { title } = req.query

    if (!title) {
      return res.send('Invalid wiki title!')
    }

    breakTextIntoSlides(title, (err, result) => {
      if (err) {
        return res.send('Error while fetching data!')
      }

      res.json(result)
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

    Article.findOne({ title }, (err, article) => {
      if (err) {
        console.log(err)
        return res.send('Error while fetching content!')
      }

      if (article) {
        return res.json({ redirect: true, path: `/videowiki/${title}` })
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
