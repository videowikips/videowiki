import express from 'express'
import remote from 'remote-file-size'
import Article from '../../models/Article'
import { getRemoteFileDuration } from '../../utils/fileUtils'

const router = express.Router()

module.exports = () => {
  router.get('/', (req, res) => {
    const { filename } = req.query
    console.log('filename is ', filename)

    const nameParts = filename.replace('File:', '').split('__');
    const title = nameParts[0];
    const version = nameParts[1];
    const fileIndex = nameParts[3];

    Article.findOne({ title, version }, (err, article) => {
      if (err) {
        return res.status(400).send('Something went wrong')
      }

      if (!article) {
        return res.status(404).send('Cannot find article');
      }

      if (article.slides.length < fileIndex) {
        return res.status(400).send('Invalid file');
      }

      const file = article.slides[fileIndex];
      const fileUrl = process.env.ENV === 'production' ? `https:${file.audio}` : 'https://dnv8xrxt73v5u.cloudfront.net/28a9f153-7acd-4831-a77d-31f61ed228c7.mp3';

      const data = {
        title: article.title,
        wikiSource: article.wikiSource,
        source: fileUrl,
        date: file.date,
      }

      // Get file size
      remote(fileUrl, (err, sizeInBytes) => {

        if (sizeInBytes) {
          data.size = (sizeInBytes / (1024 * 1024)).toString().substr(0, 5)
        }

        // Get file duration
        getRemoteFileDuration(fileUrl, (err, duration) => {
          if (duration) {
            data.duration = Math.ceil(duration)
          }

          return res.json({ file: data })
        })
      })
    })
  })

  return router
}
