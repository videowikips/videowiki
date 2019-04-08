const bcrypt = require('bcrypt-nodejs')

export function createHash (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
}

export function isValidPassword (user, password) {
  return bcrypt.compareSync(password, user.password)
}
