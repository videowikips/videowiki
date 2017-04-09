import nodemailer from 'nodemailer'
import config from '../config'

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport(config.mail.transportOptions)

const mailOptions = {
  from: '"Info VideoWiki" <info.VideoWiki@gmail.com>',
}

// send mail with defined transport object
export function sendMail ({ to, subject, text, html }, callback) {
  mailOptions.to = to
  mailOptions.subject = subject
  mailOptions.text = text
  mailOptions.html = html

  transporter.sendMail(mailOptions, callback)
}
