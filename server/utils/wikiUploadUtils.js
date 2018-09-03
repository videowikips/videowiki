// Persist cookies
const request = require('request').defaults({ jar: true })
const converter = require('video-converter')

module.exports = (function () {
  let BASE_URL, username, password

  function loginToMediawiki (mediawikiBaseUrl, username, password, callback) {
    BASE_URL = mediawikiBaseUrl
    username = username
    password = password

    if (!callback) {
      callback = () => { }
    }

    return new Promise((resolve, reject) => {
      // fetch a meta token for loggin in
      request.get({
        url: `${BASE_URL}?action=query&meta=tokens&type=login&format=json`,
      }, (err, response, body) => {
        if (err) {
          reject({ result: 'Failed', error: err })
          return callback({ result: 'Failed', error: err })
        }

        const parsedBody = JSON.parse(body)
        const token = parsedBody.query.tokens.logintoken

        // perform login
        request({
          method: 'post',
          url: `${BASE_URL}?action=login&format=json`,
          formData: {
            lgname: username,
            lgpassword: password,
            lgtoken: token,
          },

        }, (err, response, body) => {
          if (err) {
            reject({ result: 'Failed', error: err })
            return callback({ reasult: 'Failed', error: err });
          }
          const parsedBody = JSON.parse(body);
          if (parsedBody && parsedBody.login && parsedBody.login.result && parsedBody.login.result.toLowerCase() == 'success') {
            /**
             * parseBody.login Contains login response
             * {
             *  result: 'Success',
             *  lguserid: LoggedInUserId,
             *  lgusername: 'LoggedInUserName'
             * }
             **/
            resolve(parsedBody.login);
            return callback(null, parsedBody.login)
          } else {
            reject(parsedBody.login)
            return callback(parsedBody.login);
          }

        })
      })
    });
  }

  // get the token to perform login
  function uploadFileToMediawiki (file, options, callback) {
    if (!callback) {
      callback = () => { }
    }

    return new Promise((resolve, reject) => {

      // fetch an update csrf token
      request.post({
        url: `${BASE_URL}?action=query&meta=tokens&type=csrf&format=json`,
      }, (err, response, body) => {
        if (err) {
          reject(err)
          return callback(err)
        }
        const parsedBody = JSON.parse(body)
        const csrfToken = parsedBody.query.tokens.csrftoken
        // perform upload
        request.post({
          url: `${BASE_URL}?action=upload&ignorewarnings=true&format=json`,
          formData: {
            file,
            token: csrfToken,
            ...options,
          },
        }, function (err, response, body) {
          const parsedBody = JSON.parse(body)

          /**
           * Response can be either:
           *
           *   Success Response:
           *       {
           *           upload: {
           *               result: "Success",
           *               filename: "Filename.extension"
           *           }
           *       }
           *
           *   Error Response:
           *       {
           *           error: {
           *               code: "fileexists-no-change",
           *               info: "Error Message"
           *           }
           *       }
           *
          **/

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

  function createWikiArticleSection (title, sectiontitle, text, callback) {
    if (!callback) {
      callback = () => {}
    }

    return new Promise((resolve, reject) => {
      // fetch an update csrf token
      request.post({
        url: `${BASE_URL}?action=query&meta=tokens&type=csrf&format=json`,
      }, (err, response, body) => {
        if (err) {
          reject(err)
          return callback(err)
        }
        const parsedBody = JSON.parse(body)
        const csrfToken = parsedBody.query.tokens.csrftoken
        // perform upload
        request.post({
          url: `${BASE_URL}?action=edit&format=json`,
          formData: {
            title,
            section: 'new',
            sectiontitle,
            text,
            contentformat: 'text/x-wiki',
            token: csrfToken,
          },
        }, (err, response, body) => {
          const parsedBody = JSON.parse(body)
          console.log(err, body, parsedBody)
          /**
           * Response can be either:
           *
           *   Success Response:
           *       {
           *           edit: {
           *               result: "Success",
           *               filename: "Filename.extension"
           *           }
           *       }
           *
           *   Error Response:
           *       {
           *           error: {
           *               code: "fileexists-no-change",
           *               info: "Error Message"
           *           }
           *       }
           *
          **/

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

  function getImageThumbnail (imageUrl, thumbnailSize) {
    const urlParts = imageUrl.split('/commons/')
    const imageName = urlParts[1].split('/').pop()

    return `https://upload.wikimedia.org/wikipedia/commons/thumb/${urlParts[1]}/${thumbnailSize}-${imageName}` 
  }

  function convertVideoToFormat (filepath, format, callback) {
    const pathParts = filepath.split('.')
    pathParts.pop()
    pathParts.push(format)
    const newPath = pathParts.join('.')

    converter.convert(filepath, newPath, (err) => {
      // fail gracefully
      if (err) {
        console.log('Error converting file ', err)
        return callback(null, filepath)
      }
      return callback(null, newPath)      
    })
  }

  return {
    loginToMediawiki,
    uploadFileToMediawiki,
    createWikiArticleSection,
    getImageThumbnail,
    convertVideoToFormat,
  }
})()
