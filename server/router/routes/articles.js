import express from 'express'
import Article from '../../models/Article'

const router = express.Router()

module.exports = () => {
  // ================ fetch top articles based on reads
  router.get('/top', (req, res) => {
    const { limit } = req.query
    Article
      .find({})
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
      .find({})
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

        return res.json({ progress: article.conversionProgress, converted: article.converted })
      })
  })

  return router
}
