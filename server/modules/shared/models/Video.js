const mongoose = require('mongoose')
require('mongoose-long')(mongoose)
const Schema = mongoose.Schema

const DerivativeSchema = new Schema({
  fileName: { type: String, required: true },
  author: { type: String, required: true },
  licence: { type: String, required: true },
  position: Number,
})

const VideoSchema = new Schema({
  title: String,
  wikiSource: String,
  article: { type: Schema.Types.ObjectId, ref: 'Article' },
  articleVersion: Number,
  formTemplate: { type: Schema.Types.ObjectId, ref: 'UploadFormTemplate' },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  humanvoice: { type: Schema.Types.ObjectId, ref: 'HumanVoice' },
  extraUsers: [String],
  autoDownload: { type: Boolean, default: false },
  downloaded: { type: Boolean, default: false },
  version: String,
  status: { type: String, enum: ['queued', 'progress', 'converted', 'uploaded', 'failed'], default: 'queued' },
  conversionProgress: { type: Number, default: 0 },
  textReferencesProgress: { type: Number, default: 0 },
  combiningVideosProgress: { type: Number, default: 0 },
  wrapupVideoProgress: { type: Number, default: 0 },

  withSubtitles: { type: Boolean, default: false },
  commonsSubtitles: { type: String },
  vlcSubtitles: { type: String },
  vttSubtitles: { type: String },

  url: String,
  commonsUrl: String,
  commonsUploadUrl: String,
  ETag: String, // s3 tag id
  lang: String,
  commonsTimestamp: String, // commons upload timestamp
  commonsFileInfo: Object, // commons imageinfo field
  archived: { type: Schema.Types.Boolean, default: false },
  archivename: String, // commons archive name, exists after a new version of file is uploaded
  derivatives: [DerivativeSchema],

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
const VideoModel = mongoose.model('Video', VideoSchema);

module.exports = VideoModel;
