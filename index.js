
const { exec } = require('child_process');
const langs = ['en', 'hi'];
const ports = [4000, 4001, 4002, 4003];

langs.forEach((lang, index) => {
  console.log(`pm2 start ./server/index.js --name videowiki-${lang} -- ${ports[index]} ${lang}`);
  exec(`pm2 start ./server/index.js --name videowiki-${lang} -- ${ports[index]} ${lang}`, (err) => {
    if (err) {
      console.log('error initializing ', lang, ports[index], err);
    }
  });
})
