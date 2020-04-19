
const fs = require('fs');
const request = require('request');
const mm = require('music-metadata');

export function getRemoteFileDuration(url, callback) {
  const extension = url.split('.').pop().toLowerCase();
  const fileName = `/tmp/tmpaudio_${Date.now()}_${parseInt(Math.random() * 10000)}.${extension}`;
  const targetUrl = url.indexOf('http') === -1 && url.indexOf('https') === -1 ? `https:${url}` : url;
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

      mm.parseFile(fileName)
        .then(metadata => {
          return callback(null, metadata.format.duration)
        })
        .catch(callback)
    })
}
