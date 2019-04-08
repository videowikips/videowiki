import nodemailer from 'nodemailer'
import mg from 'nodemailer-mailgun-transport'

const auth = {
  auth: {
    api_key: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
  },
}


// create reusable transporter object using the default SMTP transport
const mailOptions = {
  from: '"Info VideoWiki" <info@videowikipedia.org>',
}

let transporter;

if (process.env.ENV == 'production' || process.env.MAILGUN_API_KEY) {
  transporter = nodemailer.createTransport(mg(auth));  
} else {
  console.warn('No api key is specified for Mail Gun');
}

// send mail with defined transport object
export function sendMail ({ to, subject, text, html }, callback) {
  mailOptions.to = to
  mailOptions.subject = subject
  mailOptions.text = text
  mailOptions.html = html

  transporter.sendMail(mailOptions, callback)
}
