const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ArticleSchema = new Schema({
  id: String,
  slug: String,
  title: String,
  content: {
    type: Array,
    default: [],
  },
  created_at: { type: Date, default: Date.now },
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
