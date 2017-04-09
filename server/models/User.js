// get an instance of mongoose and mongoose.Schema
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
  id: String,
  email: String,
  password: String,
  role: {
    type: String,
    default: 'normal',
  },
  firstName: String,
  lastName: String,
  avatar: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  verified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
})

UserSchema.pre('save', function (next) {
  const now = new Date()
  this.updated_at = now
  if (!this.created_at) {
    this.created_at = now
  }
  next()
})

UserSchema.statics.isObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id)

UserSchema.statics.getObjectId = (id) =>
  mongoose.Types.ObjectId(id)

module.exports = mongoose.model('User', UserSchema)
