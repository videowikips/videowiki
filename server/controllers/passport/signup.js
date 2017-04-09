const LocalStrategy = require('passport-local').Strategy
const User = require('../../models/User')
const { createHash } = require('../../utils')

module.exports = function (passport) {
  console.log('Hello!')

  passport.use('signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true, // allows us to pass back the entire request to the callback
  }, (req, email, password, done) => {
    console.log('Inside signup!')
    const findOrCreateUser = () => {
      // find a user in Mongo with provided email
      User.findOne({ email }, (err, user) => {
        // In case of any error, return using the done method
        if (err) {
          return done(err)
        }
        // already exists
        if (user) {
          return done(null, false, 'User Already Exists')
        } else {
          console.log(req.body)
          // if there is no user with that email
          // create the user
          const newUser = new User()

          // set the user's local credentials
          newUser.email = email
          newUser.password = createHash(password)
          newUser.firstName = req.body.firstName
          newUser.lastName = req.body.lastName
          newUser.role = req.body.role || 'normal'

          // save the user
          newUser.save((err) => {
            if (err) {
              console.log(`Error in Saving user: ${err}`)
              throw err
            }
            console.log('User Registration succesful')
            return done(null, newUser)
          })
        }
      })
    }
    // Delay the execution of findOrCreateUser and execute the method
    // in the next tick of the event loop
    process.nextTick(findOrCreateUser)
  }))
}
