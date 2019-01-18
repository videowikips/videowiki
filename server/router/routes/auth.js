import express from 'express';
import { isAuthenticated } from '../../controllers/auth';
const MONTH_TIME = 60 * 60 * 24 * 30;
const jwt = require('jsonwebtoken');

const router = express.Router()

module.exports = (passport) => {
  router.get('/session', isAuthenticated, (req, res) => {
    // Refresh the token
    jwt.sign(req.user, process.env.APP_SECRET, { expiresIn: MONTH_TIME }, (err, token) => {
      if (err) {
        console.log('jwt error while refreshing token request ', err);
        res.send(401, 'Unauthorized!')
      }
      return res.json({ user: req.user, token });
    })
  })

  router.get('/logout', (req, res) => {
    req.logout()
    req.logOut()
    req.session.destroy(() => {
      req.session = null
      res.send('Logout successfull!')
    })
  })

  router.get('/wikiCommons/callback', passport.authenticate('wikiCommons'), (req, res) => {
    // console.log(req.session)
    res.json({ query: req.query, user: req.user, session: req.session })
  })

  router.get('/wikiCommons', passport.authenticate('wikiCommons'))
  return router
}
