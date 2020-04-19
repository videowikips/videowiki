import authModule from '../modules/auth';
import wikiModule from '../modules/wiki';
import articleModule from '../modules/article';
import userModule from '../modules/user';
import videoModule from '../modules/video';
import humanvoiceModule from '../modules/humanvoice';
import pagesModule from '../modules/pages';

import signRequest from '../modules/shared/middlewares/signRequest';
const path = require('path')
const jwt = require('jsonwebtoken');
const PopupTools = require('popup-tools')
const MONTH_TIME = 60 * 60 * 24 * 30;
const express = require('express');

module.exports = (app, passport) => {
  // server routes ===========================================================
  // handle things like api calls
  // authentication routes

  // Decodes the JWT token if it exists to be
  // available as req.user
  authModule.passport.init(passport)
  app.use(passport.initialize())
  app.use(passport.session());

  app.all('/*', [signRequest])

  // Decode uri component for all params in get requests
  app.get('*', (req, res, next) => {
    if (req.query) {
      Object.keys(req.query).forEach((key) => {
        req.query[key] = decodeURIComponent(req.query[key]);
      })
    }
    return next();
  })

  app.use('/api/auth', authModule.routes(passport).mount(createRouter()));
  app.use('/api/wiki', wikiModule.routes.mount(createRouter()));
  app.use('/api/articles', articleModule.routes.mount(createRouter()));
  app.use('/api/users', userModule.routes.mount(createRouter()));
  app.use('/api/videos', videoModule.routes.mount((createRouter())));
  app.use('/api/humanvoice', humanvoiceModule.routes.mount((createRouter())));
  app.use('/api/pages/', pagesModule.routes.mount(createRouter()));

  // app.use('/api/auth', require('./routes/auth')(passport));
  // app.use('/api/wiki', require('./routes/wiki')());
  // app.use('/api/upload', require('./routes/upload')());
  // app.use('/api/articles', require('./routes/articles')());
  // app.use('/api/users', require('./routes/users')());
  // app.use('/api/slackEmail', require('./routes/slackEmail')());
  // app.use('/api/files', require('./routes/files')());
  // app.use('/api/videos', require('./routes/videos')());
  // app.use('/api/humanvoice', require('./routes/humanvoice')());
  // // app.use('/api/pages/', require('./routes/pages')())

  // Custom pages for SSR and SEO
  // app.use(require('./routes/pages')())

  app.get('/auth/wiki', passport.authenticate('mediawiki'), () => {

  })

  app.get('/auth/wiki/callback', passport.authenticate('mediawiki', {
    failureRedirect: '/login',
  }), (req, res) => {
    const user = JSON.parse(JSON.stringify(req.user));

    jwt.sign(user, process.env.APP_SECRET, { expiresIn: MONTH_TIME }, (err, token) => {
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
        res.end(PopupTools.popupResponse(resData));
      })
    })
  })

  // frontend routes =========================================================
  app.get('/*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../build', 'index.html'))
  })
}

function createRouter() {
  return express.Router()
}
