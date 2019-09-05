
const fs = require('fs');
const request = require('request');
const mp3Duration = require('mp3-duration');
const wavFileInfo = require('wav-file-info');

export function getRemoteFileDuration(url, callback) {
  const extension = url.split('.').pop().toLowerCase();
  const fileName = `/tmp/tmpaudio_${Date.now()}_${parseInt(Math.random() * 10000)}.${extension}`;
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
      if (extension === 'wav') {
        wavFileInfo.infoByFilename(fileName, (err, info) => {
          if (err) return callback(err);
          fs.unlink(fileName, () => { })
          return callback(null, info.duration)
        });
      } else {
        mp3Duration(fileName, (err, duration) => {
          if (err) throw (err)
          fs.unlink(fileName, () => { })
          callback(null, duration)
        })
      }
    })
}
