import { User as UserModel } from '../../../shared/models';

const console = process.console
const MediaWikiStrategy = require('passport-mediawiki-oauth').OAuthStrategy

const amqp = require('amqplib/callback_api');
const RABBITMQ_AUTH_EXCHANGE = 'RABBITMQ_AUTH_EXCHANGE';

const args = process.argv.slice(2);
const lang = args[1];

const RABBITMQ_AUTH_QUEUE = `RABBITMQ_AUTH_QUEUE_${lang}`;
let authExchangeChannel;

amqp.connect(process.env.RABBITMQ_SERVER, (err, conn) => {
  if (err) {
    return console.log('Error connecting to rabbit mq in auth ', err);
  }
  console.log('connected to rabbitmq for authentication')
  conn.createChannel((err, ch) => {
    if (err) {
      return console.log('Error creating channel in rabbitmq in auth ', err);
    }
    console.log('created a channel for ', RABBITMQ_AUTH_EXCHANGE)
    ch.assertExchange(RABBITMQ_AUTH_EXCHANGE, 'fanout', { durable: true });
    authExchangeChannel = ch;
    ch.assertQueue(RABBITMQ_AUTH_QUEUE, { durable: true }, (err, q) => {
      if (err) {
        return console.log('error asserting queue ', RABBITMQ_AUTH_QUEUE, err );
      }
      ch.bindQueue(RABBITMQ_AUTH_QUEUE, RABBITMQ_AUTH_EXCHANGE, '');
    })
  })
})

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
            const userData = {
              mediawikiId: profile.id,
              username: profile.displayName,
              mediawikiToken: token,
              mediawikiTokenSecret: tokenSecret,
            };

            UserModel.findByIdAndUpdate(userInfo._id, { $set: { mediawikiToken: token, mediawikiTokenSecret: tokenSecret } }, { new: true }, (err, userInfo) => {
              if (err) return done(err);
              authExchangeChannel.publish(RABBITMQ_AUTH_EXCHANGE, '', new Buffer(JSON.stringify(userData)));
              return done(null, {
                _id: userInfo._id,
                mediawikiId: profile.id,
                username: profile.displayName,
                mediawikiToken: token,
              })
            })
          } else {
            // User dont exst, create one
            const newUserData = { mediawikiId: profile.id, username: profile.displayName, mediawikiToken: token, mediawikiTokenSecret: tokenSecret };
            const newUser = new UserModel(newUserData)

            newUser.save((err) => {
              if (err) return done(err)
              authExchangeChannel.publish(RABBITMQ_AUTH_EXCHANGE, '', new Buffer(JSON.stringify(newUserData)));
              console.log('created a new user', newUser)
              return done(null, newUser)
            })
          }
        })
      })
    },
  ))
}

