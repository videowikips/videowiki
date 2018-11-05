import express from 'express'
import Article from '../../models/Article'

const router = express.Router()

const console = process.console

module.exports = () => {
  // ================ fetch top articles based on reads
  router.get('/article/:title', (req, res) => {
    const { wikiSource } = req.query
    const { title } = req.params;

    Article
      .findOne({ published: true, title, wikiSource })
      .exec((err, article) => {
        if (err || !article) {
          console.log(err)
          return res.status(503).send('Error while fetching top articles!')
        }

        return res.set('Content-Type', 'text/html').send(`
        <!DOCTYPE html>
          <html lang="en">
          <head>
            <title>VideoWiki: ${article.title.split('_').join(' ')}</title>
            <meta charset="UTF-8">
            <meta itemprop="name" content="Videowiki: ${article.title.split('_').join(' ')}" >
            <meta itemprop="description" content="Checkout the new VideoWiki article at https://videowiki.org/videowiki/${article.title}?wikiSource=${article.wikiSource}">
            <meta itemprop="image" content="${article.image}">
            <meta property="og:url" content="https://videowiki.org/videowiki/${article.title}" data-rdm="">
            <meta property="og:type" content="article" data-rdm="">
            <meta property="og:image" content="${article.image}" data-rdm="">
            <meta property="og:site_name" content="Videowiki" data-rdm="">
            <meta property="og:description" content="Checkout the new VideoWiki article at https://videowiki.org/videowiki/${article.title}?wikiSource=${article.wikiSource}" data-rdm="">
            </head>
          <body>
            <p>Loading...</p>
            <script>
            setTimeout(function() {
              location.assign('/videowiki/${title}?wikiSource=${wikiSource}')
            }, 2000)
            </script>
          </body>
          </html>
        `)
      })
  })

  return router
}
