import nodemailer from 'nodemailer'
import mg from 'nodemailer-mailgun-transport'

const auth = {
  auth: {
    api_key: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
  },
}

const transporter = nodemailer.createTransport(mg(auth))

// create reusable transporter object using the default SMTP transport
const mailOptions = {
  from: '"Info VideoWiki" <info@videowikipedia.org>',
}

// send mail with defined transport object
export function sendMail ({ to, subject, text, html }, callback) {
  mailOptions.to = to
  mailOptions.subject = subject
  mailOptions.text = text
  mailOptions.html = html

  transporter.sendMail(mailOptions, callback)
}
