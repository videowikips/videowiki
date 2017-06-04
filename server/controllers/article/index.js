import slug from 'slug'

import Article from '../../models/Article'

const console = process.console

const fetchArticle = function (title, callback) {
  const titleSlug = slug(title)

  Article.findOne({ slug: titleSlug }, (err, article) => {
    if (err) {
      console.error(err)
      return callback(err)
    }

    callback(null, article)
  })
}

const updateMediaToSlide = function (title, slideNumber, { mimetype, filepath }, callback) {
  const titleSlug = slug(title)

  Article.findOne({ slug: titleSlug }, (err, article) => {
    if (err) {
      console.error(err)
      return callback(err)
    }

    if (article) {
      const mimetypeKey = `slides.${slideNumber}.mediaType`
      const filepathKey = `slides.${slideNumber}.media`

      Article.update({
        slug: titleSlug,
      }, {
        $set: {
          [mimetypeKey]: mimetype.split('/')[0],
          [filepathKey]: `/uploads/${filepath}`,
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
  updateMediaToSlide,
}
