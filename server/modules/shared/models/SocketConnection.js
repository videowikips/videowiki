const mongoose = require('mongoose')
require('mongoose-long')(mongoose)
const Schema = mongoose.Schema

const SocketConnectionSchema = new Schema({
  mediawikiId: { type: String },
  anonymousId: { type: String },
  socketId: { type: String, required: true },

  created_at: { type: Date, default: Date.now, index: true },
  updated_at: { type: Date, default: Date.now },
})

SocketConnectionSchema.pre('save', function (next) {
  const now = new Date()
  this.updated_at = now
  if (!this.created_at) {
    this.created_at = now
  }
  return next();
})

SocketConnectionSchema.statics.isObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id)

SocketConnectionSchema.statics.getObjectId = (id) =>
  mongoose.Types.ObjectId(id)
const SocketConnectionModel = mongoose.model('SocketConnection', SocketConnectionSchema);

module.exports = SocketConnectionModel;
