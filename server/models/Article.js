const mongoose = require('mongoose')
require('mongoose-long')(mongoose)
const Schema = mongoose.Schema
const SchemaTypes = mongoose.Schema.Types

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
    default: []
  },
  sections: {
    type: Array,
    default: [],
  },
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

module.exports = mongoose.model('Article', ArticleSchema)
