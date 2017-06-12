import express from 'express'
import Article from '../../models/Article'

const router = express.Router()

module.exports = () => {
  // ================ fetch top articles based on reads
  router.get('/articles/top', (req, res) => {
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

  return router
}
