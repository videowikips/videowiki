import fs from 'fs'
import wikiUpload from '../utils/wikiUploadUtils'
import User from '../models/User'
import path from 'path'
import mimetypes from 'mime-types'
import async from 'async'
const COMMONS_BASE_URL = 'https://commons.wikimedia.org/w/api.php'
const username = process.env.WIKICOMMONS_BOT_USERNAME
const password = process.env.WIKICOMMONS_BOT_PASSWORD

export const uploadFileToWikiCommons = (req, res, next) => {
  const {
    fileTitle,
    description,
    categories,
    licence,
    source,
    sourceUrl,
    sourceAuthors,
    date,
  } = req.body
  let { file } = req.body
  let fileMime
  let errors = []

  if (file) {
    file = fs.createReadStream(path.join(__dirname, '../../build', file))
  } else {
    errors.push('File is required')
  }

  if (!fileTitle) {
    errors.push('File title is required')
  }
  if (!description) {
    errors.push('Description is required')
  }
  if (!categories || categories.length === 0) {
    errors.push('At least one category is required')
  }
  if (!source) {
    errors.push('Source field is required')
  }
  if (!date) {
    errors.push('Date field is required')
  }
  if (!licence) {
    errors.push('Licence field is required')
  }
  if (source && source === 'others' && !sourceUrl) {
    errors.push('Please specify the source of the file')
  }
  if (file) {
    fileMime = mimetypes.lookup(file.path)
  }
  console.log('uploading to wiki', req.body)
  if (errors.length > 0) {
    console.log(errors)
    return res.status(400).send(errors.join(', '))
  }

  if (file) {
    const uploadFuncArray = []
    let token, tokenSecret
    // convert file
    uploadFuncArray.push((cb) => {
      console.log('Logging in wikimedia')
      console.log('user from request', req.user);
      User
        .findOne({ mediawikiId: req.user.mediawikiId })
        .select('mediawikiToken mediawikiTokenSecret')
        .exec((err, userInfo) => {
          console.log('user is ', err, userInfo)
          
          if (err) {
            return res.status(400).send('Something went wrong, please try again')
          }
          if (!userInfo || !userInfo.mediawikiToken || !userInfo.mediawikiTokenSecret) {
            return res.redirect('/login')
          }
          token = userInfo.mediawikiToken
          tokenSecret = userInfo.mediawikiTokenSecret
          cb()
        })
    })

    uploadFuncArray.push((cb) => {
      console.log(' starting upload, the file is ')
      // upload file to mediawiki
      wikiUpload.uploadFileToMediawiki(token, tokenSecret, file, { filename: fileTitle, text: `${description} ${categories.split(',').map((category) => `[[${category}]]`).join(' ')}` })
        .then((result) => {
          if (result.result === 'Success') {
            // update file licencing data
            req.file = {
              location: fileMime.indexOf('video') > -1 ? result.imageinfo.url : wikiUpload.getImageThumbnail(result.imageinfo.url, '400px'),
              mimetype: fileMime,
            }
            console.log('uploaded')

            const wikiFileName = `File:${result.filename}`
            const licenceInfo = licence === 'none' ? 'none' : `{{${source === 'own' ? 'self|' : ''}${licence}}}`
            wikiUpload.createWikiArticleSection(token, tokenSecret, wikiFileName, '=={{int:license-header}}==', licenceInfo)
              .then(() => {
                // update file description
                const fileDescription = `{{Information|description=${description}|date=${date}|source=${source === 'own' ? `{{${source}}}` : sourceUrl}|author=${source === 'own' ? `[[User:${req.user.username}]]` : sourceAuthors}}}`

                wikiUpload.createWikiArticleSection(token, tokenSecret, wikiFileName, '== {{int:filedesc}} ==', fileDescription)
                  .then(() => {
                    next()
                    cb()
                  })
                  .catch((err) => {
                    const reason = err && err.code ? `Error [${err.code}]${!err.info ? '' : `: ${err.info}`}` : 'Something went wrong'
                    console.log('error updating desc', err)
                    res.status(400).send(reason)
                    cb()
                  })
              })
              .catch((err) => {
                const reason = err && err.code ? `Error [${err.code}]${!err.info ? '' : `: ${err.info}`}` : 'Something went wrong'
                console.log('Error updating licence ', err)
                res.status(400).send(reason)
                cb()
              })
          } else {
            return res.status(400).send('Something went wrong!')
          }
        })
        .catch((err) => {
          console.log('error uploading file ', err)
          const reason = err && err.code ? `Error [${err.code}]${!err.info ? '' : `: ${err.info}`}` : 'Something went wrong'
          cb()
          return res.status(400).send(reason)
        })
    })

    async.series(uploadFuncArray, (err, result) => {
      console.log(err, result)
    })
  } else {
    return res.status(400).send('Error while uploading file')
  }
}
