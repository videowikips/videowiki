// const login = require('./login')
// const signup = require('./signup')
const wiki = require('./wiki')
// const User = require('../../models/User')

export default {
  init(passport) {
    // Passport needs to be able to serialize and deserialize users to support persistent login sessions
    passport.serializeUser((user, done) => {
      done(null, user)
    })

    passport.deserializeUser((obj, done) => {
      done(null, obj)
    })
    // Setting up Passport Strategies for Login and SignUp/Registration
    // login(passport)
    // signup(passport)
    wiki(passport)
    return passport;
  },
}
