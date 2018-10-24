const console = process.console
const MediaWikiStrategy = require('passport-mediawiki-oauth').OAuthStrategy
const UserModel = require('../../models/User')

module.exports = (passport) => {

  // Use the MediaWikiStrategy within Passport.
  //   Strategies in passport require a `verify` function, which accept
  //   credentials (in this case, a token, tokenSecret, and MediaWiki profile),
  //   and invoke a callback with a user object.

  passport.use(new MediaWikiStrategy({
    baseURL: 'https://commons.wikimedia.org/',
    consumerKey: process.env.MEDIAWIKI_CONSUMER_KEY,
    consumerSecret: process.env.MEDIAWIKI_CONSUMER_SECRET,
  },
    (token, tokenSecret, profile, done) => {
      // asynchronous verification, for effect...
      process.nextTick(() => {

        // To keep the example simple, the user's MediaWiki profile is returned to
        // represent the logged-in user.  In a typical application, you would want
        // to associate the MediaWiki account with a user record in your database,
        // and return that user instead.
        UserModel.findOne({ mediawikiId: profile.id }, (err, userInfo) => {
          if (err) return done(err)
          if (userInfo) {
            // User already exists, update access token and secret
            console.log('user already exists', userInfo)
            UserModel.findByIdAndUpdate(userInfo._id, { $set: { mediawikiToken: token, mediawikiTokenSecret: tokenSecret } }, (err, userInfo) => {
              if (err) return done(err)
              return done(null, userInfo)
            })
          } else {
            // User dont exst, create one
            const newUser = new UserModel({ mediawikiId: profile.id, username: profile.displayName, mediawikiToken: token, mediawikiTokenSecret: tokenSecret })

            newUser.save((err) => {
              if (err) return done(err)
              console.log('created a new user', newUser)
              return done(null, newUser)
            })
          }
        })
      })
    },
  ))
}
