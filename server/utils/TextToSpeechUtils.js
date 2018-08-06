import uuidV4 from 'uuid/v4'
import AWS from 'aws-sdk'

import { bucketName, url } from '../config/aws'

const s3 = new AWS.S3({
  signatureVersion: 'v4',
  region: 'us-east-1',
  accessKeyId: process.env.AWS_AUDIOS_BUCKET_ACCESS_KEY, 
  secretAccessKey: process.env.AWS_AUDIOS_BUCKET_ACCESS_SECRET
})

const Polly = new AWS.Polly({
  signatureVersion: 'v4',
  region: 'us-east-1',
})

export const textToSpeech = (text, callback) => {
  const filename = `${uuidV4()}.mp3`;

  // if we're in production, use aws polly
  // otherwise, set dummy audio 
  if (process.env.ENV == 'production') {
    
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

  } else {

    setTimeout(() => {
      callback(null, '/audio/sample_audio.mp3');
    });

  }
}

// Generate audio from Polly and check if output is a Buffer
const generatePollyAudio = (text, cb) => {
  const params = {
    Text: text,
    OutputFormat: 'mp3',
    VoiceId: 'Joanna',
  }

  Polly.synthesizeSpeech(params).promise().then((audio) => {
    if (audio.AudioStream instanceof Buffer) {
      cb(null, audio)
    } else {
      cb('Audiostream is not a buffer')
    }
  })
}

const writeAudioStreamToS3 = (audioStream, filename, cb) => {
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

export const deleteAudios = (keys, callback) => {
  if(keys && keys.length > 0) {
    var objects = [] ;
    keys.forEach( (key) => {
      objects.push({Key: key}) 
    });

    const params = {
      Bucket: bucketName,
      Delete: {
        Objects: objects,
        Quiet: false
      }
    };

    s3.deleteObjects(params, (err, data) => {
      return callback(err, data);
    });

  } else {
    return callback('No keys specified!');
  }

}