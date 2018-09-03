import fs from 'fs'
import wikiUpload from '../utils/wikiUploadUtils'
import path from 'path'
import mimetypes from 'mime-types'
import async from 'async'
// Login to wikimedia commons ===============================================
// Login to wikimedia commons ===============================================
const COMMONS_BASE_URL = 'https://commons.wikimedia.org/w/api.php'
const username = process.env.WIKICOMMONS_BOT_USERNAME
const password = process.env.WIKICOMMONS_BOT_PASSWORD
const ALLOWED_FILE_FORMATS = [
  'tiff',
  'tif',
  'png',
  'gif',
  'jpg',
  'jpeg',
  'webp',
  'xcf',
  'pdf',
  'mid',
  'ogg',
  'ogv',
  'svg',
  'djvu',
  'stl',
  'oga',
  'flac',
  'opus',
  'wav',
  'webm',
  'mp3',
]
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
    duration,
  } = req.body
  let { file } = req.body
  let fileMime
  let errors = []

  file = fs.createReadStream(path.join(__dirname, '../../public', file))

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
    if ((fileMime.indexOf('video') > -1 || fileMime.indexOf('gif') > -1) && (!duration || duration == 0)) {
      errors.push('Duration field is required for videos and gifs')
    }
  }
  console.log('uploading to wiki', req.body)
  if (errors.length > 0) {
    console.log(errors)
    return res.status(500).send(errors.join(', '))
  }

  if (file) {
    const uploadFuncArray = []
    if (fileMime.indexOf('video') > -1 && ALLOWED_FILE_FORMATS.indexOf(path.extname(file.path).replace('.', '')) === -1) {
      // convert file
      uploadFuncArray.push((cb) => {
        wikiUpload.convertVideoToFormat(file.path, 'webm', (err, filepath) => {
          if (file.path !== filepath) {
            file = fs.createReadStream(filepath)
          }
          cb()
        })
      })
    }

    uploadFuncArray.push(() => {
      wikiUpload.loginToMediawiki(COMMONS_BASE_URL, username, password)
        .then(() => {
          console.log('logged in')
          // upload file to mediawiki
          wikiUpload.uploadFileToMediawiki(file, { filename: fileTitle, text: `${description} ${categories}` })
            .then((result) => {
              if (result.result === 'Success') {
                // update file licencing data
                req.file = {
                  location: fileMime.indexOf('video') > -1 ? result.imageinfo.url : wikiUpload.getImageThumbnail(result.imageinfo.url, '400px'),
                  mimetype: fileMime,
                }
                console.log('uploaded')

                const wikiFileName = `File:${result.filename}`
                const licenceInfo = licence === 'none' ? 'none' : `{{${licence}}}`
                wikiUpload.createWikiArticleSection(wikiFileName, '=={{int:license-header}}==', licenceInfo)
                  .then(() => {
                    // update file description
                    // TODO handle duration
                    const fileDescription = `
              {{Information
                |description=${description}
                |date=${date}
                |source=${source === 'own' ? `{{${source}}}` : sourceUrl}
                |author=${sourceAuthors}
                ${(fileMime.indexOf('video') > -1 || fileMime.indexOf('gif') > -1) ? `|duration=${duration}` : ''}
                }}
              `
                    wikiUpload.createWikiArticleSection(wikiFileName, '== {{int:filedesc}} ==', fileDescription)
                      .then(() => {
                        next()
                      })
                      .catch((err) => {
                        console.log('error updating desc', err)
                        res.status(500).send('Error')
                      })
                  })
                  .catch((err) => {
                    console.log('Error updating licence ', err)
                    res.status(500).send('Error')
                  })
              } else {
                return res.status(500).send('Something went wrong!')
              }
            })
            .catch((err) => {
              console.log('error uploading file ', err)
              return res.status(500).send('Something went wrong!')
            })
        })
        .catch((err) => {
          console.log(err)
          return res.status(500).send('Something went wrong, please try again')
        })
    })

    async.series(uploadFuncArray, (err, result) => {
      console.log(err, result)
    })
  } else {
    return res.status(500).send('Error while uploading file')
  }
}
