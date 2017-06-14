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

export const textToSpeech = async (text, callback) => {
  const filename = `${uuidV4()}.mp3`

  try {
    const audio = await generatePollyAudio(text)
    await writeAudioStreamToS3(audio.AudioStream, filename)

    callback(null, `${url}/${filename}`)
  } catch (e) {
    callback(e)
  }
}

// Generate audio from Polly and check if output is a Buffer
const generatePollyAudio = (text) => {
  const params = {
    Text: text,
    OutputFormat: 'mp3',
    VoiceId: 'Joanna',
  }

  AWS.config.update({
    accessKeyId: process.env.AWS_AUDIOS_BUCKET_ACCESS_KEY,
    secretAccessKey: process.env.AWS_AUDIOS_BUCKET_ACCESS_SECRET,
  })

  return Polly.synthesizeSpeech(params).promise().then((audio) => {
    if (audio.AudioStream instanceof Buffer) return audio
    else throw 'AudioStream is not a Buffer.'
  })
}

const writeAudioStreamToS3 = (audioStream, filename) => {
  AWS.config.update({
    accessKeyId,
    secretAccessKey,
  })

  putObject(bucketName, filename, audioStream, 'audio/mp3').then((res) => {
    if (!res.ETag) {
      throw res
    } else {
      return {
        msg: 'File successfully generated.',
        ETag: res.ETag,
        url: `${url}/${filename}`,
      }
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
