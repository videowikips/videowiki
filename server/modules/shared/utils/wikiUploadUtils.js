const request = require('request')
const OAuth = require('oauth-1.0a')
const crypto = require('crypto')
const { exec } = require('child_process')

const oauth = OAuth({
  consumer: {
    key: process.env.MEDIAWIKI_CONSUMER_KEY,
    secret: process.env.MEDIAWIKI_CONSUMER_SECRET,
  },
  signature_method: 'HMAC-SHA1',
  hash_function(baseString, key) {
    return crypto.createHmac('sha1', key).update(baseString).digest('base64')
  },
})

module.exports = (function () {
  const BASE_URL = 'https://commons.wikimedia.org/w/api.php'

  function uploadFileToMediawiki(key, secret, file, options, callback) {
    if (!callback) {
      callback = () => { }
    }

    const token = {
      key,
      secret,
    }
    return new Promise((resolve, reject) => {
      // fetch an update csrf token

      const requestData = {
        url: `${BASE_URL}?action=query&meta=tokens&type=csrf&format=json`,
        method: 'POST',
      }
      request({
        url: requestData.url,
        method: requestData.method,
        headers: oauth.toHeader(oauth.authorize(requestData, token)),
      }, (err, response, body) => {
        if (err) {
          reject(err)
          return callback(err)
        }
        const parsedBody = JSON.parse(body)
        const csrfToken = parsedBody.query.tokens.csrftoken

        const requestData = {
          url: `${BASE_URL}?action=upload&ignorewarnings=true&format=json`,
          method: 'POST',
          formData: {
            file,
            token: csrfToken,
            ...options,
          },
        }
        // perform upload
        request({
          url: requestData.url,
          method: requestData.method,
          formData: requestData.formData,
          headers: oauth.toHeader(oauth.authorize(requestData, token)),
        }, (err, response, body) => {
          const parsedBody = JSON.parse(body)

          if (parsedBody.error) {
            reject(parsedBody.error)
            return callback(parsedBody.error)
          }

          if (parsedBody.upload && parsedBody.upload.result.toLowerCase() === 'success') {
            resolve(parsedBody.upload)
            return callback(null, parsedBody.upload)
          } else {
            reject(parsedBody.upload)
            return callback(parsedBody.upload)
          }
        })
      })
    })
  };

  function fetchCSRFToken(wikiSource, tokenData, callback = () => { }) {
    return new Promise((resolve, reject) => {
      const requestData = {
        url: `${wikiSource}/w/api.php?action=query&meta=tokens&type=csrf&format=json`,
        method: 'POST',
      }
      console.log(wikiSource, tokenData, requestData)
      request({
        url: requestData.url,
        method: requestData.method,
        headers: oauth.toHeader(oauth.authorize(requestData, tokenData)),
      }, (err, response, body) => {
        if (err) {
          reject(err)
          return callback(err)
        }
        const parsedBody = JSON.parse(body);
        console.log(parsedBody)
        const csrfToken = parsedBody.query.tokens.csrftoken;
        resolve(csrfToken);
        return callback(null, csrfToken)
      })
    });
  };

  function prependArticleText(title, wikiSource, key, secret, prependtext, callback = () => { }) {
    const tokenData = {
      key,
      secret,
    }

    return new Promise((resolve, reject) => {
      fetchCSRFToken(wikiSource, tokenData)
        .then((csrfToken) => {
          const requestData = {
            url: `${wikiSource}/w/api.php?action=edit&nocreate=true&format=json`,
            method: 'POST',
            formData: {
              title,
              prependtext,
              contentformat: 'text/x-wiki',
              token: csrfToken,
              minor: 'true',
            },
          }
          console.log(requestData)
          // perform upload
          request({
            url: requestData.url,
            method: requestData.method,
            formData: requestData.formData,
            headers: oauth.toHeader(oauth.authorize(requestData, tokenData)),
          }, (err, response, body) => {
            console.log('bpdy', body);
            const parsedBody = JSON.parse(body);
            if (err) {
              reject(err);
              return callback(err);
            }
            if (parsedBody.error) {
              reject(parsedBody.error);
              return callback(parsedBody.error);
            }

            if (parsedBody.edit && parsedBody.edit.result.toLowerCase() === 'success') {
              resolve(parsedBody.edit);
              return callback(null, parsedBody.edit);
            } else {
              reject(parsedBody.edit);
              return callback(parsedBody.edit);
            }
          })
        })
        .catch((err) => reject(err) && callback(err));
    })
  }

  function updateWikiArticleText(key, secret, title, text, callback) {
    if (!callback) {
      callback = () => { }
    }
    const token = {
      key,
      secret,
    }

    return new Promise((resolve, reject) => {
      // fetch an update csrf token
      const requestData = {
        url: `${BASE_URL}?action=query&meta=tokens&type=csrf&format=json`,
        method: 'POST',
      }
      request({
        url: requestData.url,
        method: requestData.method,
        headers: oauth.toHeader(oauth.authorize(requestData, token)),
      }, (err, response, body) => {
        if (err) {
          reject(err)
          return callback(err)
        }
        const parsedBody = JSON.parse(body)
        console.log(parsedBody)
        const csrfToken = parsedBody.query.tokens.csrftoken
        const requestData = {
          url: `${BASE_URL}?action=edit&format=json`,
          method: 'POST',
          formData: {
            title,
            text,
            contentformat: 'text/x-wiki',
            token: csrfToken,
          },
        }
        // perform upload
        request({
          url: requestData.url,
          method: requestData.method,
          formData: requestData.formData,
          headers: oauth.toHeader(oauth.authorize(requestData, token)),
        }, (err, response, body) => {
          const parsedBody = JSON.parse(body)
          if (err) {
            reject(err);
            return callback(err);
          }
          if (parsedBody.error) {
            reject(parsedBody.error)
            return callback(parsedBody.error);
          }

          if (parsedBody.edit && parsedBody.edit.result.toLowerCase() === 'success') {
            resolve(parsedBody.edit);
            return callback(null, parsedBody.edit);
          } else {
            reject(parsedBody.edit)
            return callback(parsedBody.edit);
          }
        })
      })
    })
  }

  function createWikiArticleSection(key, secret, title, sectiontitle, text, callback) {
    if (!callback) {
      callback = () => { }
    }
    const token = {
      key,
      secret,
    }

    return new Promise((resolve, reject) => {
      // fetch an update csrf token
      const requestData = {
        url: `${BASE_URL}?action=query&meta=tokens&type=csrf&format=json`,
        method: 'POST',
      }
      request({
        url: requestData.url,
        method: requestData.method,
        headers: oauth.toHeader(oauth.authorize(requestData, token)),
      }, (err, response, body) => {
        if (err) {
          reject(err)
          return callback(err)
        }
        const parsedBody = JSON.parse(body)
        const csrfToken = parsedBody.query.tokens.csrftoken
        const requestData = {
          url: `${BASE_URL}?action=edit&format=json`,
          method: 'POST',
          formData: {
            title,
            section: 'new',
            sectiontitle,
            text,
            contentformat: 'text/x-wiki',
            token: csrfToken,
          },
        }
        // perform upload
        request({
          url: requestData.url,
          method: requestData.method,
          formData: requestData.formData,
          headers: oauth.toHeader(oauth.authorize(requestData, token)),
        }, (err, response, body) => {
          const parsedBody = JSON.parse(body)
          console.log(err, body, parsedBody)
          if (parsedBody.error) {
            reject(parsedBody.error)
            return callback(parsedBody.error);
          }

          if (parsedBody.edit && parsedBody.edit.result.toLowerCase() === 'success') {
            resolve(parsedBody.edit)
            return callback(null, parsedBody.edit);
          } else {
            reject(parsedBody.edit)
            return callback(parsedBody.edit)
          }
        })
      })
    })
  }

  function uploadCommonsSubtitles(key, secret, title, subtitles, callback = () => { }) {
    const token = {
      key,
      secret,
    }
    console.log({
      consumer: {
        key: process.env.MEDIAWIKI_CONSUMER_KEY,
        secret: process.env.MEDIAWIKI_CONSUMER_SECRET,
      }
    }, token)
    return new Promise((resolve, reject) => {
      // fetch an update csrf token
      const requestData = {
        url: `${BASE_URL}?action=query&meta=tokens&type=csrf&format=json`,
        method: 'POST',
      }
      request({
        url: requestData.url,
        method: requestData.method,
        headers: oauth.toHeader(oauth.authorize(requestData, token)),
      }, (err, response, body) => {
        if (err) {
          reject(err)
          return callback(err)
        }
        const parsedBody = JSON.parse(body)
        if (!parsedBody.query || !parsedBody.query.tokens) {
          reject(parsedBody)
          return callback(parsedBody)
        }
        const csrfToken = parsedBody.query.tokens.csrftoken
        const requestData = {
          url: `${BASE_URL}?action=edit&format=json`,
          method: 'POST',
          formData: {
            title,
            section: 0,
            text: subtitles,
            contentformat: 'text/x-wiki',
            token: csrfToken,
          },
        }
        // perform upload
        request({
          url: requestData.url,
          method: requestData.method,
          formData: requestData.formData,
          headers: oauth.toHeader(oauth.authorize(requestData, token)),
        }, (err, response, body) => {
          const parsedBody = JSON.parse(body)
          console.log(err, body, parsedBody)
          if (parsedBody.error) {
            reject(parsedBody.error)
          }

          if (parsedBody.edit && parsedBody.edit.result.toLowerCase() === 'success') {
            resolve(parsedBody.edit)
          } else {
            reject(parsedBody.edit)
          }
        })
      })
    })
  }

  function getImageThumbnail(imageUrl, thumbnailSize) {
    const urlParts = imageUrl.split('/commons/')
    const imageName = urlParts[1].split('/').pop()

    return `https://upload.wikimedia.org/wikipedia/commons/thumb/${urlParts[1]}/${thumbnailSize}-${imageName}`
  }

  function convertVideoToFormat(filepath, format, callback) {
    const pathParts = filepath.split('.')
    pathParts.pop()
    pathParts.push(format)
    const newPath = pathParts.join('.')

    exec(`ffmpeg -i ${filepath} ${newPath}`, (err) => {
      if (err) {
        // fail gracefully
        console.log('error converting file: ', err)
        return callback(filepath)
      }
      return callback(null, newPath)
    })
  }

  return {
    // loginToMediawiki,
    uploadFileToMediawiki,
    createWikiArticleSection,
    getImageThumbnail,
    convertVideoToFormat,
    uploadCommonsSubtitles,
    updateWikiArticleText,
    prependArticleText,
  }
})()
