import uuidV4 from 'uuid/v4'
import AWS from 'aws-sdk'

import { bucketName, accessKeyId, secretAccessKey, url } from '../config/aws'

const s3 = new AWS.S3({
  signatureVersion: 'v4',
  region: 'us-east-1',
})

const Polly = new AWS.Polly({
  signatureVersion: 'v4',
  region: 'us-east-1',
})

export const textToSpeech = (text, callback) => {
  const filename = `${uuidV4()}.mp3`

  try {
    generatePollyAudio(text, (err, audio) => {
      if (err) {
        return callback(err)
      }
      writeAudioStreamToS3(audio.AudioStream, filename, (err) => {
        if (err) {
          return callback(err)
        }
        callback(null, `${url}/${filename}`)
      })
    })
  } catch (e) {
    callback(e)
  }
}

// Generate audio from Polly and check if output is a Buffer
const generatePollyAudio = (text, cb) => {
  const params = {
    Text: text,
    OutputFormat: 'mp3',
    VoiceId: 'Joanna',
  }

  AWS.config.update({
    accessKeyId: process.env.AWS_AUDIOS_BUCKET_ACCESS_KEY,
    secretAccessKey: process.env.AWS_AUDIOS_BUCKET_ACCESS_SECRET,
  })

  Polly.synthesizeSpeech(params).promise().then((audio) => {
    if (audio.AudioStream instanceof Buffer) {
      cb(null, audio)
    } else {
      cb('Audiostream is not a buffer')
    }
  })
}

const writeAudioStreamToS3 = (audioStream, filename, cb) => {
  AWS.config.update({
    accessKeyId,
    secretAccessKey,
  })

  putObject(bucketName, filename, audioStream, 'audio/mp3').then((res) => {
    if (!res.ETag) {
      cb('Error')
    } else {
      cb(null)
    }
  })
}

const putObject = (bucket, key, body, ContentType) =>
  s3.putObject({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType,
  }).promise()
