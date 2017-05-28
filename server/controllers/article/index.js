import slug from 'slug'

import Article from '../../models/Article'

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

export {
  fetchArticle,
}
