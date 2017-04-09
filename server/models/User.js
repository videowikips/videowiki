// get an instance of mongoose and mongoose.Schema
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
  id: String,
  email: String,
  password: String,
  role: String,
  firstName: String,
  lastName: String,
  avatar: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
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

module.exports = mongoose.model('User', UserSchema)
