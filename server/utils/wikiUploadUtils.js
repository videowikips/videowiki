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
  hash_function (baseString, key) {
    return crypto.createHmac('sha1', key).update(baseString).digest('base64')
  },
})

module.exports = (function () {
  const BASE_URL = 'https://commons.wikimedia.org/w/api.php'

  // function loginToMediawiki(mediawikiBaseUrl, username, password, callback) {
  //   BASE_URL = mediawikiBaseUrl
  //   username = username
  //   password = password

  //   if (!callback) {
  //     callback = () => { }
  //   }

  //   return new Promise((resolve, reject) => {
  //     // check if user is already logged in
  //     request.get({
  //       url: `${BASE_URL}?action=query&meta=tokens&type=login&format=json&assert=bot`,
  //     }, (err, response, body) => {
  //       if (err) {
  //         reject({ result: 'Failed', error: err })
  //         return callback({ result: 'Failed', error: err })
  //       }
  //       const parsedBody = JSON.parse(body)
  //       console.log(err, parsedBody)
  //       if (parsedBody.error && parsedBody.error.code == 'assertbotfailed') {
  //         // fetch a meta token for loggin in
  //         request.get({
  //           url: `${BASE_URL}?action=query&meta=tokens&type=login&format=json`,
  //         }, (err, response, body) => {
  //           if (err) {
  //             reject({ result: 'Failed', error: err })
  //             return callback({ result: 'Failed', error: err })
  //           }

  //           const parsedBody = JSON.parse(body)
  //           const token = parsedBody.query.tokens.logintoken

  //           // perform login
  //           request({
  //             method: 'post',
  //             url: `${BASE_URL}?action=login&format=json`,
  //             formData: {
  //               lgname: username,
  //               lgpassword: password,
  //               lgtoken: token,
  //             },

  //           }, (err, response, body) => {
  //             if (err) {
  //               reject(err)
  //               return callback(err);
  //             }
  //             const parsedBody = JSON.parse(body);
  //             console.log(parsedBody)
  //             if (parsedBody && parsedBody.login && parsedBody.login.result && parsedBody.login.result.toLowerCase() == 'success') {
  //               /**
  //                * parseBody.login Contains login response
  //                * {
  //                *  result: 'Success',
  //                *  lguserid: LoggedInUserId,
  //                *  lgusername: 'LoggedInUserName'
  //                * }
  //                **/
  //               resolve(parsedBody.login);
  //               return callback(null, parsedBody.login)
  //             } else {
  //               reject(parsedBody.login)
  //               return callback(parsedBody.login);
  //             }
  //           })
  //         })
  //       } else {
  //         // User is already logged in
  //         console.log('already logged in');
  //         callback()
  //         return resolve()
  //       }
  //     })
  //   })
  // }

  // get the token to perform login
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
  }
})()
