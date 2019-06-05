
const fs = require('fs');
const request = require('request');
const mp3Duration = require('mp3-duration');

export function getRemoteFileDuration (url, callback) {
  const fileName = `/tmp/tmpaudio_${Date.now()}_${parseInt(Math.random() * 10000)}.${url.split('.').pop().toLowerCase()}`;
  const targetUrl = url.indexOf('http') === -1 ? `https:${url}` : url;
  request
    .get(targetUrl)
    .on('error', (err) => {
      throw (err)
    })
    .pipe(fs.createWriteStream(fileName))
    .on('error', (err) => {
      callback(err)
    })
    .on('finish', () => {
      mp3Duration(fileName, (err, duration) => {
        if (err) throw (err)
        fs.unlink(fileName, () => {})
        callback(null, duration)
      })
    })
}
