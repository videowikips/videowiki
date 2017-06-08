import nodemailer from 'nodemailer'
import mg from 'nodemailer-mailgun-transport'

const auth = {
  auth: {
    api_key: process.env.MAILGUN_API_KEY,
    domain: 'sandbox4a6a86af961a4e54bde5d747f41a7ff0.mailgun.org',
  },
}

const transporter = nodemailer.createTransport(mg(auth))

// create reusable transporter object using the default SMTP transport
const mailOptions = {
  from: '"Info VideoWiki" <info.videoWiki@gmail.com>',
}

// send mail with defined transport object
export function sendMail ({ to, subject, text, html }, callback) {
  mailOptions.to = to
  mailOptions.subject = subject
  mailOptions.text = text
  mailOptions.html = html

  transporter.sendMail(mailOptions, callback)
}
