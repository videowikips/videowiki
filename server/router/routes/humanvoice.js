import express from 'express';
import ArticleModel from '../../models/Article';
import HumanVoiceModel from '../../models/HumanVoice';
// import VideoModel from '../../models/Video';
// import UploadFormTemplateModel from '../../models/UploadFormTemplate';
import fs from 'fs';
import uuidV4 from 'uuid/v4';
import AWS from 'aws-sdk'
import { bucketName, url } from '../../config/aws';
import { isAuthenticated } from '../../controllers/auth';

// const args = process.argv.slice(2);
// const lang = args[1];

const S3 = new AWS.S3({
  signatureVersion: 'v4',
  region: 'us-east-1',
  accessKeyId: process.env.AWS_AUDIOS_BUCKET_ACCESS_KEY,
  secretAccessKey: process.env.AWS_AUDIOS_BUCKET_ACCESS_SECRET,
})

const router = express.Router()

module.exports = () => {
  router.get('/', isAuthenticated, (req, res) => {
    const { title, wikiSource, lang } = req.query;
    if (!title || !wikiSource || !lang) {
      return res.status(400).send('title, wikiSource and lang are required');
    }
    HumanVoiceModel.findOne({ title: decodeURIComponent(title), wikiSource, lang, user: req.user._id }, (err, humanvoice) => {
      if (err) {
        console.log('error retrieving human voice', err);
        return res.status(400).send('Something went wrong');
      }
      return res.json({ humanvoice });
    })
  })

  router.post('/audios', isAuthenticated, (req, res) => {
    if (!req.files || !req.files.file) return res.status(400).end('File is required');
    const file = req.files.file;
    const { title, wikiSource, position, lang } = req.body;
    ArticleModel.findOne({ title, wikiSource, published: true }, (err, article) => {
      if (err) {
        console.log('error fetching article ', err);
        return res.status(400).end('Something went wrong');
      }
      if (!article) {
        return res.status(400).end('Invalid article');
      }
      const filename = `humanvoice/humanvoice-${uuidV4()}.webm`;
      S3.upload({
        Key: filename,
        Bucket: bucketName,
        Body: file,
        ContentType: 'audio/webm',
      }).promise()
      .then((result) => {
        console.log(result)
        console.log();
        const audioURL = `${url}/${filename}`;

        HumanVoiceModel.findOne({ title, wikiSource, lang, user: req.user._id }, (err, humanvoice) => {
          if (err) {
            console.log('error finding human voice', err);
            return res.status(400).end('Something went wrong');
          }

          if (!humanvoice) {
            const newHumanVoice = new HumanVoiceModel({
              title,
              wikiSource,
              lang,
              user: req.user._id,
              audios: [{
                position,
                audioURL,
                Key: filename,
              }],
              translatedSlides: [],
            })

            newHumanVoice.save((err) => {
              if (err) {
                console.log('error saving new human voice', err);
                return res.status(400).end('Something went wrong');
              }
              return res.json({ humanvoice: newHumanVoice, slideAudioInfo: { position, audioURL } });
            })
          } else {
            // If the position of the new audio was set before, delete the old audio from s3
            const replacedAudios = humanvoice.audios.filter((a) => Number(a.position) === Number(position));
            if (replacedAudios && replacedAudios.length > 0) {
              replacedAudios.forEach((audio) => deleteAudioFromS3(audio.Key));
            }
            const audios = humanvoice.audios.filter((a) => Number(a.position) !== Number(position));
            audios.push({ position, audioURL, Key: filename });
            HumanVoiceModel.findByIdAndUpdate(humanvoice._id, { $set: { audios } }, { new: true }, (err, newHumanVoice) => {
              if (err) {
                console.log('error updating human voice', err);
                return res.status(400).end('Something went wrong');
              }
              return res.json({ humanvoice: newHumanVoice, slideAudioInfo: { position, audioURL } });
            })
          }
        })
      })
      .catch((err) => {
        console.log('error uploading file', err);
        return res.status(400).end('Something went wrong');
      })
    })
  })

  router.delete('/audios', isAuthenticated, (req, res) => {
    const { title, wikiSource, lang, position } = req.body;
    const userId = req.user._id;
    HumanVoiceModel.findOne({ title, wikiSource, lang, user: userId }, (err, humanvoice) => {
      if (err) {
        console.log(err);
        return res.status(400).send('Something went wrong');
      }
      if (!humanvoice) return res.status(400).send('Invalid custom human voice');

      const deletedAudios = humanvoice.audios.filter((audio) => Number(audio.position) === Number(position));
      if (!deletedAudios || deletedAudios.length === 0) {
        return res.status(400).send('Invalid audio position');
      }
      HumanVoiceModel.findByIdAndUpdate(humanvoice._id, { $pull: { audios: { position } } }, { new: true }, (err) => {
        if (err) {
          console.log(err);
          return res.status(400).send('Something went wrong')
        }
        deletedAudios.forEach((audio) => deleteAudioFromS3(audio.Key));
        return res.json({ deletedAudio: deletedAudios[0] });
      })
    })
  })

  router.post('/translated_text', isAuthenticated, (req, res) => {
    const { title, wikiSource, lang, position, text } = req.body;
    const userId = req.user._id;
    const newSlide = { text, position: Number(position) };

    HumanVoiceModel.findOne({ title, wikiSource, lang, user: userId }, (err, humanvoice) => {
      if (err) {
        console.log('error fethcing human voice', err);
        return res.status(400).send('Something went wrong');
      }

      if (humanvoice) {
        const filteredTranslatedSlides = humanvoice.translatedSlides ? humanvoice.translatedSlides.filter((slide) => Number(slide.position) !== Number(newSlide.position)) : [];
        filteredTranslatedSlides.push(newSlide);
        HumanVoiceModel.findByIdAndUpdate(humanvoice._id, { $set: { translatedSlides: filteredTranslatedSlides } }, { new: true }, (err, newHumanVoice) => {
          if (err) {
            console.log('error saving updated translated slides', err);
            return res.status(400).send('Something went wrong');
          }
          return res.json({ humanvoice: newHumanVoice, translatedTextInfo: newSlide })
        })
      } else {
        // Create a new human voice for the user
        const newHumanVoice = new HumanVoiceModel({
          title,
          wikiSource,
          lang,
          user: req.user._id,
          translatedSlides: [newSlide],
          audios: [],
        });

        newHumanVoice.save((err) => {
          if (err) {
            console.log('error saving new human voice', err);
            return res.status(400).send('Something went wrong');
          }
          return res.json({ humanvoice: newHumanVoice, translatedTextInfo: newSlide });
        })
      }
    })
  })

  return router
}

function deleteAudioFromS3(Key) {
  S3.deleteObject({
    Key,
    Bucket: bucketName,
  }).promise()
  .then((res) => {
    console.log('deleted audio successfully ', res, Key);
  })
  .catch((err) => {
    console.log('error deleting audio', err);
  })
}
