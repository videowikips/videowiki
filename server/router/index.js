const path = require('path')
const jwt = require('jsonwebtoken');
const PopupTools = require('popup-tools')
const { signRequest } = require('../controllers/auth')

module.exports = (app, passport) => {
  // server routes ===========================================================
  // handle things like api calls
  // authentication routes

  // Decodes the JWT token if it exists to be
  // available as req.user
  app.use(signRequest)

  app.use('/api/auth', require('./routes/auth')(passport));
  app.use('/api/wiki', require('./routes/wiki')());
  app.use('/api/upload', require('./routes/upload')());
  app.use('/api/articles', require('./routes/articles')());
  app.use('/api/users', require('./routes/users')());
  app.use('/api/slackEmail', require('./routes/slackEmail')());
  app.use('/api/files', require('./routes/files')());
  app.use('/api/videos', require('./routes/videos')());
  // app.use('/api/pages/', require('./routes/pages')())

  // Custom pages for SSR and SEO
  app.use(require('./routes/pages')())

  app.get('/auth/wiki', passport.authenticate('mediawiki'), () => {

  })

  app.get('/auth/wiki/callback', passport.authenticate('mediawiki', {
    failureRedirect: '/login',
  }), (req, res) => {
    console.log(req.session, 'is authenticated', req.user)
    const user = JSON.parse(JSON.stringify(req.user));

    jwt.sign(user, process.env.APP_SECRET, { expiresIn: 60 }, (err, token) => {
      let resData;
      if (err) {
        console.log('jwt error while sigining request ', err);
        resData = { user };
      } else {
        resData = { user, token };
      }
      // Logout the user from the mediawiki session
      req.logout()
      req.logOut()
      req.session.destroy(() => {
        req.session = null;
        console.log('res data is ', resData);
        res.end(PopupTools.popupResponse(resData));
      })
    })
  })

  // frontend routes =========================================================
  app.get('/*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../build', 'index.html'))
  })
}
