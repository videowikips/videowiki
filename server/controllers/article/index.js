import slug from 'slug'
import mongoose from 'mongoose'

import Article from '../../models/Article'

const console = process.console

const cloneArticle = function (title, editor, callback) {
  // Check if an article with the same editor and title exists
  Article.findOne({ title, editor, published: false }, (err, article) => {
    if (err) {
      return callback(err)
    }

    // Fetch the published article
    Article.findOne({ title, published: true }, (err2, publishedArticle) => {
      if (err2) {
        return callback(err2)
      }

      if (!publishedArticle) {
        return callback()
      }

      if (article) { // if yes,
        // check if the original artical version and fetched article version are same
        if (article.version === publishedArticle.version) {
          // if same, use this article
          return callback(null, article)
        }
        // if different, clone the article and replace
        Article
          .findOne({ title, editor, published: false, version: article.version })
          .remove()
          .exec()

        // clone the article and add to db
        const clonedArticle = publishedArticle
        clonedArticle._id = mongoose.Types.ObjectId()
        clonedArticle.isNew = true

        clonedArticle.published = false
        clonedArticle.draft = true
        clonedArticle.editor = editor

        clonedArticle.version = publishedArticle.version

        clonedArticle.save((err) => {
          if (err) {
            callback(err)
          } else {
            callback(null, clonedArticle)
          }
        })
      } else { // if no,
        // clone the article and add to db
        const clonedArticle = publishedArticle
        clonedArticle._id = mongoose.Types.ObjectId()
        clonedArticle.isNew = true

        clonedArticle.published = false
        clonedArticle.draft = true
        clonedArticle.editor = editor

        clonedArticle.version = publishedArticle.version

        clonedArticle.save((err) => {
          if (err) {
            callback(err)
          } else {
            callback(null, clonedArticle)
          }
        })
      }
    })
  })
}

const fetchArticle = function (title, callback) {
  const titleSlug = slug(title)

  Article.findOneAndUpdate({ slug: titleSlug }, { $inc: { reads: 1 } }, (err, article) => {
    if (err) {
      console.error(err)
      return callback(err)
    }

    callback(null, article)
  })
}

const fetchArticleAndUpdateReads = function (title, callback) {
  const titleSlug = slug(title)

  Article.findOneAndUpdate({ slug: titleSlug }, { $inc: { reads: 1 } }, (err, article) => {
    if (err) {
      console.error(err)
      return callback(err)
    }

    callback(null, article)
  })
}

const updateMediaToSlide = function (title, slideNumber, editor, { mimetype, filepath }, callback) {
  const titleSlug = slug(title)

  Article.findOne({ title, editor }, (err, article) => {
    if (err) {
      console.error(err)
      return callback(err)
    }

    if (article) {
      const mimetypeKey = `slides.${slideNumber}.mediaType`
      const filepathKey = `slides.${slideNumber}.media`

      Article.update({
        title,
        editor,
      }, {
        $set: {
          [mimetypeKey]: mimetype.split('/')[0],
          [filepathKey]: filepath,
        },
      }, (err) => {
        if (err) {
          console.error(err)
          return callback(err)
        }

        callback(null, 'Article Updated')
      })
    } else {
      const err = new Error('Article not found!')
      callback(err)
    }
  })
}

export {
  fetchArticle,
  fetchArticleAndUpdateReads,
  updateMediaToSlide,
  cloneArticle,
}
