const path = require('path');
const fs = require('fs');
const TEMP_DIR = path.join(__dirname, '../../../../tmp');
const PUBLIC_UPLOAD_DIR = path.join(__dirname, '../../../../build/uploads');
const PUBLIC_PATH = path.join(__dirname, '../../../../build');

if (!fs.existsSync(TEMP_DIR)) {
  console.log('TEMP_DIR Directory doesn\'t exists')
  fs.mkdirSync(TEMP_DIR);
}

if (!fs.existsSync(PUBLIC_UPLOAD_DIR)) {
  console.log('PUBLIC_UPLOAD_DIR Directory doesn\'t exists')
  fs.mkdirSync(PUBLIC_UPLOAD_DIR);
}

module.exports = {
  secret: process.env.APP_SECRET,
  db: process.env.DB_CONNECTION_URL,
  TEMP_DIR,
  PUBLIC_UPLOAD_DIR,
  PUBLIC_PATH,
  lang: 'en', // The lang of the videowiki instance, this will get changed by app.js
  mail: {
    transportOptions: {
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    },
    verifyEmailConfig: {
      subject: 'VideoWiki - Verify your email!',
      html: 'Click the following link to confirm your account: ',
      text: 'Please confirm your account by clicking the following link: ',
    },
    resetEmailConfig: {
      subject: 'VideoWiki - Reset Password!',
      html: 'Click the following link to reset your Password: ',
      text: 'Please reset your account by clicking the following link: ',
    },
  },
}
