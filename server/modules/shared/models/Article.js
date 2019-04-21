const mongoose = require('mongoose')
require('mongoose-long')(mongoose)
const Schema = mongoose.Schema

const ArticleSchema = new Schema({
  id: String,
  slug: String,
  title: String,
  lang: String,
  langCode: String,
  converted: Boolean,
  published: Boolean,
  draft: Boolean,
  editor: String,
  version: String,
  wikiSource: String, // The wiki source the artcle was fetched from
  // media source controls from where does the article get it's media
  // script: for custom artcles on Wikipedia
  // user: for all other articles
  mediaSource: {
    type: String,
    enum: ['script', 'user'],
    default: 'user',
  },
  ns: Number, // the namespace of the article
  featured: {
    type: Number,
    default: 0,
  },
  conversionProgress: {
    type: Number,
    default: 0,
  },
  reads: {
    type: Number,
    default: 0,
    index: true,
  },
  image: String,
  contributors: [String],
  slides: {
    type: Array,
    default: [],
  },
  slidesHtml: {
    type: Array,
    default: [],
  },
  sections: {
    type: Array,
    default: [],
  },
  referencesList: {},
  clonedFrom: { type: Schema.Types.ObjectId, ref: 'Article' },
  created_at: { type: Date, default: Date.now, index: true },
  updated_at: { type: Date, default: Date.now },
})

ArticleSchema.pre('save', function (next) {
  const now = new Date()
  this.updated_at = now
  if (!this.created_at) {
    this.created_at = now
  }
  next()
})

ArticleSchema.statics.isObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id)

ArticleSchema.statics.getObjectId = (id) =>
  mongoose.Types.ObjectId(id)

const ArticleModel = mongoose.model('Article', ArticleSchema);

module.exports = ArticleModel;
