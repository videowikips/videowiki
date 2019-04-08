import { Article, User } from '../shared/models'
import remote from 'remote-file-size'
import { getRemoteFileDuration } from '../../utils/fileUtils'

import { publishArticle } from './utils';
import { fetchImagesFromBing, fetchGifsFromGiphy } from '../shared/services/bing';
import { fetchImagesFromCommons, fetchGifsFromCommons, fetchVideosFromCommons, fetchCategoriesFromCommons } from '../shared/services/wikiCommons';
import { homeArticles } from './config';

const articleController = {
  getTopArticles(req, res) {
    let { limit } = req.query
    const titles = homeArticles.map((category) => category.articles).reduce((acc, a) => [...acc, ...a], []);

    if (limit) {
      limit = parseInt(limit)
    }

    Article
      .find({ published: true, title: { $in: titles } })
      .sort({ reads: -1 })
      .limit(limit || 4)
      .select('title image reads wikiSource ns')
      .exec((err, articles) => {
        if (err) {
          console.log(err)
          return res.status(503).send('Error while fetching top articles!')
        }

        return res.json({ articles })
      })
  },

  // ================ fetch all articles
  getAllArticles(req, res) {
    let { offset } = req.query

    offset = parseInt(offset)

    Article
      .find({ published: true })
      .sort({ featured: -1 })
      .skip(offset || 0)
      .limit(10)
      .select('title image wikiSource ns')
      .exec((err, articles) => {
        if (err) {
          console.log(err)
          return res.status(503).send('Error while fetching articles!')
        }

        return res.json({ articles })
      })
  },

  countPublishedArticles(req, res) {
    Article
      .find({ published: true })
      .count((err, count) => {
        if (err) {
          return res.status(503).send('Error while fetching article count!')
        }

        return res.json({ count })
      })
  },

  getConvertProgress(req, res) {
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
  },

  publishDraftedArticle(req, res) {
    const { title, wikiSource } = req.query
    const editor = req.user ? req.user._id : req.headers['x-vw-anonymous-id']
    let name

    if (req.user) {
      const { firstName, lastName, email } = req.user
      name = `${firstName}-${lastName}_${email}`
    } else {
      name = `Anonymous_${req.headers['x-vw-anonymous-id']}`
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
  },

  getArticleContributors(req, res) {
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
  },

  // =========== wikimedia commons image search
  searchWikiCommonsImages(req, res) {
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
  },

  // =========== wikimedia commons gif search
  searchWikiCommonsGifs(req, res) {
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
  },

  searchWikiCommonsVideos(req, res) {
    const { searchTerm } = req.query

    if (searchTerm && searchTerm !== '') {
      fetchVideosFromCommons(searchTerm, (err, videos) => {
        if (err) {
          return res.status(500).send('Error while fetching gifs!')
        }

        res.json({ videos })
      })
    } else {
      res.json({ videos: [] })
    }
  },

  searchWikiCommonsCategories(req, res) {
    const { searchTerm } = req.query

    if (searchTerm && searchTerm !== '') {
      fetchCategoriesFromCommons(searchTerm, (err, categories) => {
        if (err) {
          return res.status(500).send('Error while fetching categories!')
        }

        res.json({ categories })
      })
    } else {
      res.json({ categories: [] })
    }
  },

  searchBingImages(req, res) {
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
  },

  searchBingGifs(req, res) {
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
  },

  getAudioFileInfo(req, res) {
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
        if (err) {
          console.log('error fetching file size', err);
          data.size = 0;
        } else if (sizeInBytes) {
          data.size = (sizeInBytes / (1024 * 1024)).toString().substr(0, 5)
        }

        // Get file duration
        getRemoteFileDuration(fileUrl, (err, duration) => {
          if (err) {
            data.duration = 0;
            console.log('error fetching duration', err);
          } else if (duration) {
            data.duration = Math.ceil(duration)
          }

          return res.json({ file: data })
        })
      })
    })
  },

}

export default articleController;
