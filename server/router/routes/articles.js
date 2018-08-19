import express from 'express'
import Article from '../../models/Article'
import User from '../../models/User'

import { publishArticle } from '../../controllers/article'
import { fetchImagesFromBing, fetchGifsFromGiphy } from '../../controllers/bing'
import { fetchImagesFromCommons, fetchGifsFromCommons } from '../../controllers/wikiCommons';

const router = express.Router()

const console = process.console

module.exports = () => {
  // ================ fetch top articles based on reads
  router.get('/top', (req, res) => {
    let { limit } = req.query

    if (limit) {
      limit = parseInt(limit)
    }

    Article
      .find({ published: true })
      .sort({ reads: -1 })
      .limit( limit || 4)
      .select('title image reads wikiSource')
      .exec((err, articles) => {
        if (err) {
          console.log(err)
          return res.status(503).send('Error while fetching top articles!')
        }

        return res.json({ articles })
      })
  })

  // ================ fetch all articles
  router.get('/all', (req, res) => {
    let { offset } = req.query

    offset = parseInt(offset)

    Article
      .find({ published: true })
      .sort({ featured: -1 })
      .skip(offset || 0)
      .limit(10)
      .select('title image wikiSource')
      .exec((err, articles) => {
        if (err) {
          console.log(err)
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
    const { title, wikiSource } = req.query
    const editor = req.cookies['vw_anonymous_id']
    let name

    if (req.user) {
      const { firstName, lastName, email } = req.user
      name = `${firstName}-${lastName}_${email}`
    } else {
      name = `Anonymous_${req.cookies['vw_anonymous_id']}`
    }

    publishArticle(title, wikiSource, editor, name, (err) => {
      if (err) {
        console.log(err)
        return res.status(500).send(err)
      }

      if (req.user) {
        // update total edits and articles edited
        User.findByIdAndUpdate(req.user._id, {
          $inc: { totalEdits: 1 },
          $addToSet: { articlesEdited: title },
        }, { new: true }, (err, article) => {
          if (err) {
            return console.log(err)
          }

          console.log(article)

          if (article) {
            User.findByIdAndUpdate(req.user._id, {
              articlesEditCount: article.articlesEdited.length,
            }, (err) => {
              if (err) {
                console.log(err)
              }
            })
          }
        })
      }

      res.send('Article published successfully!')
    })
  })

  // ============== contributors
  router.get('/contributors', (req, res) => {
    const { title } = req.query

    Article
      .findOne({ title, published: true })
      .select('contributors')
      .exec((err, article) => {
        if (err) {
          return res.status(500).send('Error while fetching contributors list!')
        }

        if (!article) {
          return res.json({ contributors: [] })
        }

        const contributorsNames = article.contributors.map((person) =>
          person.split('_')[0].split('-').join(' '))

        res.json({ contributors: contributorsNames })
      })
  })


  // =========== wikimedia commons image search
  router.get('/wikimediaCommons/images', (req, res) => {
    const { searchTerm } = req.query

    if (searchTerm && searchTerm !== '') {
      fetchImagesFromCommons(searchTerm, (err, images) => {
        if (err) {
          return res.status(500).send('Error while fetching images!')
        }

        res.json({ images })
      })
    } else {
      res.json({ images: [] })
    }
  })  


   // =========== wikimedia commons gif search
   router.get('/wikimediaCommons/gifs', (req, res) => {
    const { searchTerm } = req.query

    if (searchTerm && searchTerm !== '') {
      fetchGifsFromCommons(searchTerm, (err, gifs) => {
        if (err) {
          return res.status(500).send('Error while fetching gifs!')
        }

        res.json({ gifs })
      })
    } else {
      res.json({ gifs: [] })
    }
  })

  // =========== bing image search
  router.get('/bing/images', (req, res) => {
    const { searchTerm } = req.query

    if (searchTerm && searchTerm !== '') {
      fetchImagesFromBing(searchTerm, (err, images) => {
        if (err) {
          return res.status(500).send('Error while fetching images!')
        }

        res.json({ images })
      })
    } else {
      res.json({ images: [] })
    }
  })
   // =========== gif search
  router.get('/gifs', (req, res) => {
    const { searchTerm } = req.query

    if (searchTerm && searchTerm !== '') {
      fetchGifsFromGiphy(searchTerm, (err, gifs) => {
        if (err) {
          return res.status(500).send('Error while fetching gifs!')
        }

        res.json({ gifs })
      })
    } else {
      res.json({ gifs: [] })
    }
  })

  return router
}
