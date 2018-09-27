
const fs = require('fs');
const request = require('request');
const mp3Duration = require('mp3-duration');

export function getRemoteFileSize (url, callback) {
  request
    .get(url)
    .on('error', (err) => {
      throw (err)
    })
    .pipe(fs.createWriteStream('/tmp/audio.mp3'))
    .on('error', (err) => {
      callback(err)
    })
    .on('finish', () => {
      mp3Duration('/tmp/audio.mp3', (err, duration) => {
        if (err) throw (err)
        fs.unlink('/tmp/audio.mp3')
        callback(null, duration)
      })
    })
}