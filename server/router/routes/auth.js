import express from 'express'
// import request from 'request'
// import uuidV4 from 'uuid/v4'
// import User from '../../models/User'

// import { createHash, sendMail } from '../../utils'
// import config from '../../config'

const router = express.Router()

const isAuthenticated = (req, res, next) => {
  // if user is authenticated in the session, call the next() to call the next request handler
  // Passport adds this method to request object. A middleware is allowed to add properties to
  // request and response objects
  if (req.isAuthenticated()) {
    return next()
  }
  // if the user is not authenticated then redirect him to the login page
  res.send(401, 'Unauthorized!')
}

module.exports = (passport) => {
  router.get('/session', isAuthenticated, (req, res) => {
    res.json({ user: req.user })
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
