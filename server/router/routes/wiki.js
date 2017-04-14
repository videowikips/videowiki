import express from 'express'
import wiki from '../../controllers/wiki'

const router = express.Router()

module.exports = () => {
  router.get('/', (req, res) => {
    wiki.getPage()
    res.send('Wiki')
  })

  return router
}
