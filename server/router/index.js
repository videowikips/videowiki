const request = require('superagent');
const path = require('path')
import { getLatestData } from '../bots/autoupdate/index'
module.exports = (app, passport) => {
  // server routes ===========================================================
  // handle things like api calls
  // authentication routes
  app.use((req, res, next) => {
    // console.log(req.session, 'users session ', req.user, 'user obj')
    next()
  })
  app.use('/api/auth', require('./routes/auth')(passport))
  app.use('/api/wiki', require('./routes/wiki')())
  app.use('/api/upload', require('./routes/upload')())
  app.use('/api/articles', require('./routes/articles')())
  app.use('/api/users', require('./routes/users')())
  app.use('/api/slackEmail', require('./routes/slackEmail')())

  app.get('/auth/wiki', passport.authenticate('mediawiki'), (req, res) => {

  })

  app.get('/auth/wiki/callback', passport.authenticate('mediawiki', {
    failureRedirect: '/login',
  }), (req, res) => {
    console.log(req.session, 'is authenticated', req.isAuthenticated(), req.user)
    res.redirect('/')
  })

  // frontend routes =========================================================
  app.get('/*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../public', 'index.html'))
  })
}
