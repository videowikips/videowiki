import express from 'express'
import User from '../../models/User'

const router = express.Router()

module.exports = () => {
  router.get('/leaderboard', (req, res) => {
    const { limit } = req.query
    User
      .find({ totalEdits: { $ne: 0 } })
      .sort({ totalEdits: -1 })
      .limit(limit || 10)
      .select('firstName lastName email totalEdits')
      .exec((err, users) => {
        if (err) {
          return res.status(503).send('Error while fetching top users!')
        }

        return res.json({ users })
      })
  })

  return router
}
