import express from 'express'

const router = express.Router()

module.exports = () => {
  // ================ upload
  router.get('/upload', (req, res) => {
    res.send('Upload something!')
  })

  return router
}
