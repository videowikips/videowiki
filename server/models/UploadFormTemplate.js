const mongoose = require('mongoose')
require('mongoose-long')(mongoose)
const Schema = mongoose.Schema

const UploadFormTemplateSchema = new Schema({
  title: String,
  wikiSource: String,
  published: { type: Boolean, default: true },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  // Specifies weather to upload/create new file page or update existing
  // file version
  mode: { type: String, enum: ['new', 'update'], default: 'new' },
  form: Object,
})

module.exports = mongoose.model('UploadFormTemplate', UploadFormTemplateSchema)
