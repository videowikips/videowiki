const LocalStrategy = require('passport-local').Strategy
const uuidV4 = require('uuid/v4')

const User = require('../../models/User')
const { createHash, sendMail } = require('../../utils')

import config from '../../config'

module.exports = function (passport) {
  console.log('Hello!')

  passport.use('signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true, // allows us to pass back the entire request to the callback
  }, (req, email, password, done) => {
    const findOrCreateUser = () => {
      const emailLowercase = email.toLowerCase()

      // find a user in Mongo with provided email
      User.findOne({ email: emailLowercase }, (err, user) => {
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
          newUser.email = emailLowercase
          newUser.password = createHash(password)
          newUser.firstName = req.body.firstName
          newUser.lastName = req.body.lastName
          newUser.role = req.body.role || 'normal'

          // Verification Link
          newUser.verificationToken = uuidV4()
          newUser.verified = false

          // save the user
          newUser.save((err, user) => {
            if (err) {
              console.log(`Error in Saving user: ${err}`)
              throw err
            }

            const verificationLink = `https://videowikipedia.org/api/auth/verify/${user._id}/${user.verificationToken}`
            const { subject, text, html } = config.mail.verifyEmailConfig
            // Send verification link
            sendMail({
              to: emailLowercase,
              subject,
              text: `${text}${verificationLink}`,
              html: `${html}${verificationLink}`,
            })

            // Generate verification link and send email
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
