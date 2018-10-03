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

  // router.get('/verify/:id/:token', (req, res) => {
  //   const { id, token } = req.params

  //   User.findById(User.getObjectId(id), (err, user) => {
  //     if (err) {
  //       return res.send('Invalid link! Please signup again!')
  //     }

  //     if (user.verificationToken === token) {
  //       User.findOneAndUpdate({ '_id': User.getObjectId(id) }, { verified: true }, (err) => {
  //         if (err) {
  //           return res.send('Error while updating your status! Please signup again!')
  //         }

  //         return res.send('Successfully verified! You can now login!')
  //       })
  //     }
  //   })
  // })

  // router.get('/reset/:email/:token', (req, res) => {
  //   const { email, token } = req.params
  //   User.findOne({ email, resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
  //     if (err) {
  //       return res.status(401).send('Error while validating reset link! Please try again later!')
  //     }
  //     if (!user) {
  //       return res.status(401).send('Password reset token is invalid or has expired.')
  //     }
  //     res.send({ message: 'User verified successfully!', email })
  //   })
  // })

  // router.post('/signup', (req, res, next) => {
  //   console.log(req.body)
  //   const captchaResponse = req.body['captcha']
  //   if (captchaResponse === undefined ||
  //     captchaResponse === '' ||
  //     captchaResponse === null) {
  //     return res.status(400).send('Invalid Captcha!')
  //   }

  //   const captchSecretKey = process.env.CAPTCHA_SECRET_KEY
  //   const recaptchaUrl = 'https://www.google.com/recaptcha/api/siteverify'

  //   const postData = {
  //     url: recaptchaUrl,
  //     secret: captchSecretKey,
  //     response: captchaResponse,
  //   }

  //   request
  //     .post(postData, (err) => {
  //       if (err) {
  //         console.log(err)
  //         return res.status(400).send('Invalid Captcha!')
  //       }

  //       passport.authenticate('signup', (err, user, info) => {
  //         if (err) {
  //           console.log(err)
  //           return res.send('Error while creating user!')
  //         }

  //         if (!user) {
  //           return res.status(400).send(info)
  //         }

  //         res.send({ 'message': 'User created successfully!', user })
  //       })(req, res, next)
  //     })
  // })

  // router.post('/login', (req, res, next) => {
  //   passport.authenticate('login', (err, user, info) => {
  //     if (err) {
  //       return next(err)
  //     }

  //     if (!user) {
  //       return res.status(401).send(info)
  //     }

  //     req.logIn(user, (err) => {
  //       if (err) {
  //         return next(err)
  //       }

  //       if (req.body.remember) {
  //         req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000 // Cookie expires after 30 days
  //       } else {
  //         req.session.cookie.expires = false
  //       }

  //       res.json({ user: req.user })
  //     })
  //   })(req, res, next)
  // })

  // router.post('/reset/:email', (req, res) => {
  //   const { email } = req.params
  //   const password = createHash(req.body.password)

  //   User.findOneAndUpdate({ email }, { $set: { password } }, (err, user) => {
  //     if (err) {
  //       return res.send('Error while resetting password! Please try again later!')
  //     }

  //     if (!user) {
  //       return res.send('Invalid user!')
  //     }

  //     return res.send('Password is updated successfully!')
  //   })
  // })

  // router.post('/reset', (req, res) => {
  //   const { email } = req.body

  //   console.log(email)

  //   User.find({ email }, (err, user) => {
  //     if (err) {
  //       return res.send({ message: 'Error while resetting user! Please try again after sometime!' })
  //     }

  //     if (!user) {
  //       res.send({ message: 'Invalid user!' })
  //     }

  //     const resetToken = uuidV4()

  //     User.update({ email }, { $set: {
  //       resetPasswordToken: resetToken,
  //       resetPasswordExpires: (Date.now() + 3600000),
  //     } }, (err) => {
  //       if (err) {
  //         return res.send({ msg: 'Error while resetting user! Please try again after sometime!' })
  //       } else {
  //         const resetLink = `https://videowikipedia.org/reset/${email}/${resetToken}`
  //         const { subject, text, html } = config.mail.resetEmailConfig
  //         // Send verification link
  //         sendMail({
  //           to: email,
  //           subject,
  //           text: `${text}${resetLink}`,
  //           html: `${html}${resetLink}`,
  //         }, (err) => {
  //           if (err) {
  //             return console.log(err)
  //           }

  //           return res.send('An email with instructions have been sent to your mailbox!')
  //         })
  //       }
  //     })
  //   })
  // })

  router.get('/logout', (req, res) => {
    req.logout()
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
