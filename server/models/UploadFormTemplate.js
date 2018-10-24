const mongoose = require('mongoose')
require('mongoose-long')(mongoose)
const Schema = mongoose.Schema

const UploadFormTemplateSchema = new Schema({
  title: String,
  wikiSource: String,
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  form: Object,
})

module.exports = mongoose.model('UploadFormTemplate', UploadFormTemplateSchema)
