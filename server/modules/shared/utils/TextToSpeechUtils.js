import uuidV4 from 'uuid/v4'
import AWS from 'aws-sdk'

import { bucketName, url } from '../config/aws'

const GCTextToSpeech = require('@google-cloud/text-to-speech')
const GCTTSClient = new GCTextToSpeech.TextToSpeechClient();

const s3 = new AWS.S3({
  signatureVersion: 'v4',
  region: 'us-east-1',
  accessKeyId: process.env.AWS_AUDIOS_BUCKET_ACCESS_KEY,
  secretAccessKey: process.env.AWS_AUDIOS_BUCKET_ACCESS_SECRET,
})

const Polly = new AWS.Polly({
  signatureVersion: 'v4',
  region: 'us-east-1',
});

export const GOOGLE_VOICES = {
  'en-US': 'en-US-Wavenet-D',
  'id-ID': 'id-ID-Wavenet-A',
  'uk-UA': 'uk-UA-Wavenet-A',
}

export const LANG_VOICES = {
  'en-US': 'Joanna',
  'hi-IN': 'Aditi',
  'fr-CA': 'Chantal',
  'es-US': 'Penelope',
  'arb': 'Zeina',
  'ja-JP': 'Mizuki',
};

export const LANG_CODES = {
  'en': 'en-US',
  'hi': 'hi-IN',
  'fr': 'fr-CA',
  'es': 'es-US',
  'ar': 'arb',
  'in': 'id-ID',
  'ja': 'ja-JP',
  'uk': 'uk-UA',
};

export const AWS_LANGS = [
  'hi-IN',
  'fr-CA',
  'es-US',
  'arb',
  'ja-JP',
];

export const GOOGLE_LANGS = [
  'en-US',
  'id-ID',
  'uk-UA',
]

export const textToSpeech = ({ text, langCode }, callback) => {
  const filename = `${uuidV4()}.mp3`;

  // if we're in production, use aws polly
  // otherwise, set dummy audio
  if (process.env.ENV === 'production') {
    try {
      let generateAudioFunc;
      if (AWS_LANGS.indexOf(langCode) !== -1) {
        generateAudioFunc = generatePollyAudio;
      } else if (GOOGLE_LANGS.indexOf(langCode) !== -1) {
        generateAudioFunc = generateGoogleAudio;
      } else {
        return callback(new Error('Language is not supported'))
      }
      generateAudioFunc({ text, langCode }, (err, audio) => {
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
      callback(null, '//s3.eu-central-1.amazonaws.com/vwpmedia/statics/sample_audio.mp3');
    });
  }
}
// Generate audio from Polly and check if output is a Buffer
const generatePollyAudio = ({ text, langCode }, cb) => {
  console.log('Lang code', langCode, formatAWSPollyTextToSSML(text))
  const params = {
    Text: formatAWSPollyTextToSSML(text),
    TextType: 'ssml',
    OutputFormat: 'mp3',
    LanguageCode: langCode,
    VoiceId: LANG_VOICES[langCode],
  }

  Polly.synthesizeSpeech(params).promise().then((audio) => {
    if (audio.AudioStream instanceof Buffer) {
      cb(null, audio)
    } else {
      cb('Audiostream is not a buffer')
    }
  })
}

const generateGoogleAudio = ({ text, langCode }, cb) => {
  console.log(formatGoogleCloudTextToSSML(text))
  const request = {
    input: { ssml: formatGoogleCloudTextToSSML(text) },
    voice: {
      languageCode: langCode,
      name: GOOGLE_VOICES[langCode],
    },
    audioConfig: {
      audioEncoding: 'MP3',
      pitch: 0,
      speakingRate: 1,
    },
  }

  GCTTSClient.synthesizeSpeech(request)
  .then((response) => {
    if (response && response.length > 0) {
      if (response[0].audioContent instanceof Buffer) {
        cb(null, { AudioStream: response[0].audioContent })
      } else {
        cb('Audiostream is not a buffer')
      }
    } else {
      return cb('Something went wrong synthetizing speech');
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

function formatGoogleCloudTextToSSML(text) {
  const formattedText = converPauseToBreak(convertCommaToBreak(convertDotToBreak(text, '800ms'), '400ms'), '400ms');
  return `<speak>${formattedText}</speak>`;
}

function formatAWSPollyTextToSSML(text) {
  const formattedText = converPauseToBreak(convertCommaToBreak(convertDotToBreak(text, '800ms'), '400ms'), '400ms');
  return `<speak>${formattedText}</speak>`;
}

function converPauseToBreak(text, interval) {
  return text;
  // return text.replace(/\{\{pause\}\}/g, `<break time="${interval}" />`);
}

function convertCommaToBreak(text, interval) {
  return text.replace(/\,/g, `,<break time="${interval}" />`);
}

function convertDotToBreak(text, interval) {
  return text.replace(/\./g, `.<break time="${interval}" />`);
}
// export const textToSpeech = ({ text, langCode }, callback) => {
//   const filename = `${uuidV4()}.mp3`;

//   // if we're in production, use aws polly
//   // otherwise, set dummy audio
//   if (process.env.ENV === 'production') {
//     try {
//       generatePollyAudio({ text, langCode }, (err, audio) => {
//         if (err) {
//           return callback(err)
//         }
//         writeAudioStreamToS3(audio, filename, (err) => {
//           if (err) {
//             return callback(err)
//           }
//           callback(null, `${url}/${filename}`)
//         })
//       })
//     } catch (e) {
//       callback(e)
//     }
//   } else {
//     setTimeout(() => {
//       callback(null, 'https://s3.eu-central-1.amazonaws.com/vwpmedia/statics/sample_audio.mp3');
//     });
//   }
// }

// // Generate audio from Polly and check if output is a Buffer
// const generatePollyAudio = ({ text, langCode }, cb) => {
//   const request = {
//     input: { text },
//     voice: { languageCode: langCode, ssmlGender: 'NEUTRAL' },
//     audioConfig: { audioEncoding: 'MP3' },
//   }
//   GCTTSClient.synthesizeSpeech(request)
//   .then((response) => {
//     if (response && response.length > 0) {
//       if (response[0].audioContent instanceof Buffer) {
//         cb(null, response[0].audioContent)
//       } else {
//         cb('Audiostream is not a buffer')
//       }
//     } else {
//       return cb('Something went wrong synthetising speech');
//     }
//   })
//   .catch((e) => cb(e));
//   // const params = {
//   //   Text: text,
//   //   OutputFormat: 'mp3',
//   //   LanguageCode: langCode,
//   //   VoiceId: LANG_VOICES[langCode],
//   // }

//   // Polly.synthesizeSpeech(params).promise().then((audio) => {
//   //   if (audio.AudioStream instanceof Buffer) {
//   //     cb(null, audio)
//   //   } else {
//   //     cb('Audiostream is not a buffer')
//   //   }
//   // })
// }
