import express from 'express'
import Article from '../../models/Article'
import User from '../../models/User'

import { publishArticle } from '../../controllers/article'

const router = express.Router()

const console = process.console

module.exports = () => {
  // ================ fetch top articles based on reads
  router.get('/top', (req, res) => {
    const { limit } = req.query
    Article
      .find({ published: true })
      .sort({ reads: -1 })
      .limit(limit || 3)
      .select('title image reads')
      .exec((err, articles) => {
        if (err) {
          return res.status(503).send('Error while fetching top articles!')
        }

        return res.json({ articles })
      })
  })

  // ================ fetch all articles
  router.get('/all', (req, res) => {
    const { limit, offset } = req.query

    Article
      .find({ published: true })
      .limit(limit || 10)
      .skip(offset || 0)
      .select('title image')
      .exec((err, articles) => {
        if (err) {
          return res.status(503).send('Error while fetching articles!')
        }

        return res.json({ articles })
      })
  })

  router.get('/count', (req, res) => {
    Article
      .find({ published: true })
      .count((err, count) => {
        if (err) {
          return res.status(503).send('Error while fetching article count!')
        }

        return res.json({ count })
      })
  })

  router.get('/progress', (req, res) => {
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
  })

  // ========================= publish
  router.get('/publish', (req, res) => {
    const { title } = req.query
    const editor = req.cookies['vw_anonymous_id']

    publishArticle(title, editor, (err) => {
      if (err) {
        console.log(err)
        return res.status(500).send(err)
      }

      if (req.user) {
        // update total edits and articles edited
        User.findByIdAndUpdate(req.user._id, {
          $inc: { totalEdits: 1 },
          $addToSet: { articlesEdited: title },
        }, (err) => {
          if (err) {
            console.log(err)
          }
        })
      }

      res.send('Article published successfully!')
    })
  })

  return router
}
