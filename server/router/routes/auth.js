const express = require('express')
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
    res.send(req.user)
  })

  router.post('/signup', (req, res, next) => {
    passport.authenticate('signup', (err, user, info) => {
      if (err) {
        console.log(err)
        return res.send('Error while creating user!')
      }

      if (!user) {
        return res.status(400).send(info)
      }

      res.send({ 'message': 'User created successfully!', user })
    })(req, res, next)
  })

  router.post('/login', (req, res, next) => {
    passport.authenticate('login', (err, user, info) => {
      if (err) {
        return next(err)
      }

      if (!user) {
        return res.status(401).send(info)
      }

      req.logIn(user, (err) => {
        if (err) {
          return next(err)
        }

        res.send({ 'message': 'User authenticated' })
      })
    })(req, res, next)
  })

  router.get('/logout', (req, res) => {
    req.logout()
    res.send('Logout successfull!')
  })

  return router
}
