const { exec } = require('child_process');
const langs = [
  'en',
  'hi',
  'es',
  'ar',
  'ja',
  'uk',
  'fr',
  'or',
  'te',
  'gu',
  'bn',
  'pa',
  'sat',
  'sv',
  'it',
  'kn',
  'ml',
  'ta',
];
const ports = [
  4000,
  4001,
  4002,
  4003,
  4004,
  4005,
  4006,
  4007,
  4008,
  4009,
  4010,
  4011,
  4012,
  4013,
  4014,
  4015,
  4016,
  4017,
];

langs.forEach((lang, index) => {
  console.log(
    `pm2 start ./server/index.js --name videowiki-app-${lang} -- ${ports[index]} ${lang}`,
  );
  exec(
    `pm2 start ./server/index.js --name videowiki-app-${lang} -- ${ports[index]} ${lang}`,
    (err) => {
      if (err) {
        console.log('error initializing ', lang, ports[index], err);
      }
    },
  );
});
