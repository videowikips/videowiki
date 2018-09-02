import fs from 'fs'
import path from 'path'
import uuidV4 from 'uuid/v4'
import mimetypes from 'mime-types'

export default (req, res, next) => {
  if (!req.files.file || req.files.file.length === 0) {
    console.log('no file uploaded')
    return next()
  }
  const file = req.files.file
  const targetPath = path.join(__dirname, '../../public/uploads/' + `${uuidV4()}.${file.path.split('.').pop()}`)
  const src = fs.createReadStream(file.path)
  const dest = fs.createWriteStream(targetPath)

  src.pipe(dest)
  src.on('end', () => {
    req.file = {
      path: targetPath,
      mimetype: mimetypes.lookup(targetPath),
    }
    console.log('file from mdidleware ', req.file)
    return next()
  })
  src.on('error', (err) => {
    console.log(err)
    return res.status(500).send('Error uploading file')
  })
}
