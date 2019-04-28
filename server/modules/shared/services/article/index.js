import Article from '../../models/Article';
import mongoose from 'mongoose';
import { fetchArticleRevisionId } from '../wiki';
import { applySlidesHtmlToArticle, applyScriptMediaOnArticle } from '../../../wiki/utils';
import { customVideowikiPrefixes } from '../../constants';

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

const validateArticleRevisionAndUpdate = function validateArticleRevisionAndUpdate(title, wikiSource, callback) {
  Article.findOne({ title, wikiSource, published: true }, (err, article) => {
    if (err) return callback(err);

    fetchArticleRevisionId(title, wikiSource, (err, revisionId) => {
      if (err || !revisionId) {
        console.log('error fetching revision id', title, err);
        return callback();
      }
      if (!article.wikiRevisionId || (parseInt(article.wikiRevisionId) !== parseInt(revisionId))) {
        console.log('revision ids', article.wikiRevisionId, revisionId, article.wikiRevisionId === revisionId);
        finalizeArticleUpdate(article)(callback);
      } else {
        return callback();
      }
    })
  })
}

const isCustomVideowikiScript = function isCustomVideowikiScript(title) {
  return title === 'User:Hassan.m.amin/sandbox' || customVideowikiPrefixes.some((prefix) => title.toLowerCase().trim().indexOf(prefix.trim().toLowerCase()) !== -1);
}

const finalizeArticleUpdate = (article) => (cb) => {
  console.log('finalizing article update', article.title);
  applySlidesHtmlToArticle(article.wikiSource, article.title, (err) => {
    if (err) {
      console.log('error applying slides html to', article.title, err);
    }
    if (isCustomVideowikiScript(article.title)) {
    // if (true) {
      console.log('is custom script')
      applyScriptMediaOnArticle(article.title, article.wikiSource, (err) => {
        if (err) {
          console.log('error applying script media on article', article.title, article.wikiSource, err);
        }
        Article.findOneAndUpdate({ title: article.title, wikiSource: article.wikiSource, published: true }, { $set: { mediaSource: 'script' } }, (err) => {
          if (err) {
            console.log('error updating mediaSource on article', article.title, err);
          }
          updateArticleRevisionId(article.title, article.wikiSource, (err) => {
            if (err) {
              console.log('error updating article revision id', article.title, article.wikiSource, err);
            }
            return cb();
          })
        })
      })
    } else {
      updateArticleRevisionId(article.title, article.wikiSource, (err) => {
        if (err) {
          console.log('error updating article revision id', article.title, article.wikiSource, err);
        }
        return cb();
      })
    }
  })
}

const updateArticleRevisionId = function updateArticleRevisionId(title, wikiSource, callback) {
  fetchArticleRevisionId(title, wikiSource, (err, wikiRevisionId) => {
    if (err) return callback(err);
    if (!wikiRevisionId) return callback(null, null);
    Article.findOneAndUpdate({ title, wikiSource, published: true }, { $set: { wikiRevisionId } }, { new: true }, (err, doc) => {
      if (err) return callback(err);
      return callback(null, doc);
    })
  })
}

export {
  updateMediaToSlide,
  fetchArticleAndUpdateReads,
  cloneArticle,
  finalizeArticleUpdate,
  updateArticleRevisionId,
  isCustomVideowikiScript,
  validateArticleRevisionAndUpdate,
};
