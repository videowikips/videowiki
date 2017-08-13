import express from 'express'
import request from 'request'

const router = express.Router()

const console = process.console

module.exports = () => {
 
  router.post('/', (req, res) => {
    const { email } = req.body
    const token = process.env.SLACK_TOKEN
    const url = `https://slack.com/api/users.admin.invite?token=${token}&email=${email}`
    request
      .post(url, (err) => {
        if (err) {
          console.log(err)
          return res.status(400).send('Invalid')
        }
          res.send('Check your email!')
        })
      })
  return router
}
