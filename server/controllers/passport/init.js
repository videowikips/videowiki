const login = require('./login')
const signup = require('./signup')
const User = require('../../models/User')

module.exports = (passport) => {
  // Passport needs to be able to serialize and deserialize users to support persistent login sessions
  passport.serializeUser((user, done) => {
    done(null, user._id)
  })

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user)
    })
  })

  // Setting up Passport Strategies for Login and SignUp/Registration
  login(passport)
  signup(passport)
}
