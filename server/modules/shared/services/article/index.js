import Article from '../../models/Article';
import mongoose from 'mongoose';
import { applySlidesHtmlToArticle, applyScriptMediaOnArticle } from '../../../wiki/utils';
import { CUSTOM_VIDEOWIKI_PREFIX } from '../../constants';

const updateMediaToSlide = function (title, wikiSource, slideNumber, editor, { mimetype, filepath }, callback) {
  Article.findOne({ title, wikiSource, editor }, (err, article) => {
    if (err) {
      console.error(err)
      return callback(err)
    }

    if (article) {
      const mimetypeKey = `slides.${slideNumber}.mediaType`
      const filepathKey = `slides.${slideNumber}.media`

      // update slidesHtml slide media
      const mimetypeKeyHtml = `slidesHtml.${slideNumber}.mediaType`
      const filepathKeyHtml = `slidesHtml.${slideNumber}.media`

      Article.update({
        title,
        wikiSource,
        editor,
      }, {
        $set: {
          [mimetypeKey]: mimetype.split('/')[0],
          [filepathKey]: filepath,

          [mimetypeKeyHtml]: mimetype.split('/')[0],
          [filepathKeyHtml]: filepath,
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

const fetchArticleAndUpdateReads = function (title, callback) {
  Article.findOneAndUpdate({ title, published: true }, { $inc: { reads: 1 } }, (err, article) => {
    if (err) {
      console.error(err)
      return callback(err)
    }

    callback(null, article)
  })
}

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
            // if different, clone the article and replace
            Article
              .findOne({ title, editor, published: false, version: article.version })
              .remove()
              .exec()
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

const finalizeArticleUpdate = (article) => (cb) => {
  applySlidesHtmlToArticle(article.wikiSource, article.title, (err) => {
    if (err) {
      console.log('error applying slides html to', article.title, err);
    }
    if (article.title.toLowerCase().trim().indexOf(CUSTOM_VIDEOWIKI_PREFIX.trim().toLocaleLowerCase()) !== -1) {
    // if (true) {
      applyScriptMediaOnArticle(article.title, article.wikiSource, (err) => {
        if (err) {
          console.log('error applying script media on article', article.title, article.wikiSource, err);
        }
        Article.findOneAndUpdate({ title: article.title, wikiSource: article.wikiSource, published: true }, { $set: { mediaSource: 'script' } }, (err) => {
          if (err) {
            console.log('error updating mediaSource on article', article.title, err);
          }
          return cb();
        })
      })
    } else {
      cb();
    }
  })
}

export {
  updateMediaToSlide,
  fetchArticleAndUpdateReads,
  cloneArticle,
  finalizeArticleUpdate,
};
