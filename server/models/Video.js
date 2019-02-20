const mongoose = require('mongoose')
require('mongoose-long')(mongoose)
const Schema = mongoose.Schema

const VideoSchema = new Schema({
  title: String,
  wikiSource: String,
  article: { type: Schema.Types.ObjectId, ref: 'Article' },
  formTemplate: { type: Schema.Types.ObjectId, ref: 'UploadFormTemplate' },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  extraUsers: [String],
  autoDownload: { type: Boolean, default: false },
  downloaded: { type: Boolean, default: false },
  version: String,
  status: { type: String, enum: ['queued', 'progress', 'converted', 'uploaded'], default: 'queued' },
  conversionProgress: { type: Number, default: 0 },
  textReferencesProgress: { type: Number, default: 0 },
  combiningVideosProgress: { type: Number, default: 0 },
  wrapupVideoProgress: { type: Number, default: 0 },
  withSubtitles: { type: Boolean, default: false },
  url: String,
  commonsUrl: String,
  ETag: String, // s3 tag id
  created_at: { type: Date, default: Date.now, index: true },
  updated_at: { type: Date, default: Date.now },
})

VideoSchema.pre('save', function (next) {
  const now = new Date()
  this.updated_at = now
  if (!this.created_at) {
    this.created_at = now
  }
  next()
})

VideoSchema.statics.isObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id)

VideoSchema.statics.getObjectId = (id) =>
  mongoose.Types.ObjectId(id)

module.exports = mongoose.model('Video', VideoSchema)
