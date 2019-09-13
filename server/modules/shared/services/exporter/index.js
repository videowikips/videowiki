import mongoose from 'mongoose';
import { Video as VideoModel, UploadFormTemplate as UploadFormTemplateModel, Article } from '../../models';
import async from 'async';
import uuid from 'uuid/v4';
import { generateDerivativeTemplate } from '../wiki';
import md5 from 'md5';
import moment from 'moment';
import rabbitmqService from '../../vendors/rabbitmq';
import { SUPPORTED_TTS_LANGS } from '../../constants';

const console = process.console;
const fs = require('fs');
const request = require('request');
const wikiCommonsController = require('../wikiCommons')
// const wikiUpload = require('../../utils/wikiUploadUtils');
const wikiUpload = require('../../utils/wikiUploadUtils');
const sharedConfig = require('../../config');
const args = process.argv.slice(2);
const lang = args[1];

const DELETE_AWS_VIDEO = 'DELETE_AWS_VIDEO';
const CONVERT_QUEUE = `CONVERT_ARTICLE_QUEUE_${lang}`;
const UPDLOAD_CONVERTED_TO_COMMONS_QUEUE = `UPDLOAD_CONVERTED_TO_COMMONS_QUEUE_${lang}`;
const HUMAN_VOICE_QUEUE = 'HUMAN_VOICE_QUEUE';

const COMMONS_WIKISOURCE = 'https://commons.wikimedia.org';

let converterChannel;

export function convertArticle(content) {
  converterChannel.sendToQueue(CONVERT_QUEUE, new Buffer(JSON.stringify(content)), { persistent: true });
}

export function notifyHumanvoiceExport(content) {
  converterChannel.sendToQueue(HUMAN_VOICE_QUEUE, new Buffer(JSON.stringify(content)), { persistent: true });
}

export default {
  convertArticle,
  notifyHumanvoiceExport,
}

if (!converterChannel) {
  console.log('####### Starting exporter #######');
  rabbitmqService.createChannel((err, ch) => {
    if (err) {
      console.log('error creating channel for exporter', err);
    } else if (ch) {
      converterChannel = ch;
      ch.prefetch(1);
      ch.assertQueue(CONVERT_QUEUE, { durable: true })
      ch.assertQueue(UPDLOAD_CONVERTED_TO_COMMONS_QUEUE, { durable: true });
      ch.assertQueue(DELETE_AWS_VIDEO, { durable: true });
      // ch.sendToQueue(CONVERT_QUEUE, new Buffer(JSON.stringify({videoId: '5c98f40f3fe26b11ed1a50aa'})))
      console.log('Connected to rabbitmq server successfully');

      if (process.env.ENV === 'production') {
        ch.consume(UPDLOAD_CONVERTED_TO_COMMONS_QUEUE, onUploadConvertedToCommons, { noAck: false });
      } else {
        ch.consume(UPDLOAD_CONVERTED_TO_COMMONS_QUEUE, finalizeConvert, { noAck: false });
      }
    }
  })
}

function onUploadConvertedToCommons(msg) {
  const { videoId } = JSON.parse(msg.content.toString());
  console.log('received a request to upload ', videoId);

  VideoModel
  .findById(videoId)
  .populate('article')
  .populate('formTemplate')
  .populate('user')
  .exec((err, video) => {
    if (err) {
      converterChannel.ack(msg);
      console.log('error fetching video', err);
      VideoModel.findByIdAndUpdate(videoId, { $set: { status: 'failed' } }, () => {
      })
      return;
    }
    let fileTitle = video.formTemplate.form.fileTitle;
    if (fileTitle.indexOf('File:') === -1) {
      fileTitle = `File:${normalizeVideoFileTitle(fileTitle)}`;
    }
    if (fileTitle.indexOf('.webm') === -1) {
      fileTitle = `${fileTitle}.webm`;
    }

    wikiCommonsController.fetchLatestFileTitle(fileTitle, (err, result) => {
      if (err) {
        console.log('error fetching latest file title', err);
        return uploadConvertedToCommons(msg);
      }
      if (result && result.missing) {
        console.log('missing ', result);
        return uploadConvertedToCommons(msg);
      }
      if (result && result.changed) {
        console.log('changed', result)
        onExportedVideoFileTitleChange(result.fileTitle, video.title, video.wikiSource, (err) => {
          if (err) {
            console.log('error updating file titles after being changed', err);
          }
          uploadConvertedToCommons(msg);
        })
      } else {
        return uploadConvertedToCommons(msg);
      }
    })
  })
}
/* eslint-disable no-unused-vars */
function uploadConvertedToCommons(msg) {
  const { videoId } = JSON.parse(msg.content.toString());
  console.log('received a request to upload ', videoId);

  VideoModel
  .findById(videoId)
  .populate('article')
  .populate('formTemplate')
  .populate('user')
  .exec((err, video) => {
    if (err) {
      converterChannel.ack(msg);
      console.log('error fetching video', err);
      VideoModel.findByIdAndUpdate(videoId, { $set: { status: 'failed' } }, () => {
      })
      return;
    }

    // Update wrapup progress
    VideoModel.findByIdAndUpdate(videoId, { $set: { wrapupVideoProgress: 90 } }, () => {});

    const filePath = `${sharedConfig.TEMP_DIR}/${video.url.split('/').pop()}`;
    const fileExtension = filePath.split('.').pop();
    request
      .get(video.url)
      .on('error', (err) => {
        throw (err)
      })
      .pipe(fs.createWriteStream(filePath))
      .on('error', () => {
        VideoModel.findByIdAndUpdate(videoId, { $set: { status: 'failed' } }, () => {
          converterChannel.ack(msg);
        })
      })
      .on('finish', () => {
        const formFields = video.formTemplate.form;
        if (video.derivatives && video.derivatives.length > 0) {
          formFields.customLicence = true;
          formFields.licence = video.derivatives.sort((a, b) => a.position - b.position).map(generateDerivativeTemplate).join('\n\n');
          // console.log(formFields);
        }

        if (video.article && video.article.wikiRevisionId) {
          formFields.comment = `oldid = ${video.article.wikiRevisionId}`;
        }
        if (formFields.fileTitle.indexOf(`.${fileExtension}`) === -1) {
          formFields.fileTitle = `${formFields.fileTitle}.${fileExtension}`;
        }
        wikiCommonsController.uploadFileToCommons(filePath, video.user, formFields, (err, result) => {
          console.log('uploaded to commons ', err, result);
          if (result && result.success) {
            const uploadedFileName = getFileNameFromTitle(result.url.split('/').pop());

            const update = {
              $set: {
                status: 'uploaded',
                commonsUrl: result.url,
                commonsUploadUrl: result.url,
                conversionProgress: 100,
                wrapupVideoProgress: 100,
                commonsTimestamp: result.fileInfo.timestamp,
                commonsFileInfo: result.fileInfo,
                filename: result.filename,
              },
            }
            // Set version to the number of successfully uploaded videos
            VideoModel.count({ title: video.title, wikiSource: video.wikiSource, status: 'uploaded' }, (err, count) => {
              if (err) {
                console.log('error counting videos for version', err);
              }
              if (video.humanvoice) {
                onHumanVoiceExport(video._id);
              }
              if (count !== undefined && count !== null) {
                update.$set.version = count + 1;
                updateArchivedVideoUrl(video.title, video.wikiSource, video.lang, count);
              } else {
                update.$set.version = 1;
              }
              // If it's unsupported lang, upload audios to Commons
              if (
                  SUPPORTED_TTS_LANGS.indexOf(video.article.lang) === -1 ||
                  video.article.title.toLowerCase() === 'User:Hassan.m.amin/sandbox'.toLowerCase()
                ) {
                uploadArticleAudioSlides(video.article.title, video.article.wikiSource, video.user);
              }
              VideoModel.findByIdAndUpdate(videoId, update, (err, result) => {
                if (err) {
                  console.log('error updating video after upload ', err);
                } else {
                  // Delete video from AWS since it's now on commons
                  converterChannel.sendToQueue(DELETE_AWS_VIDEO, new Buffer(JSON.stringify({ videoId })));
                }
                if (uploadedFileName) {
                  if (decodeURIComponent(uploadedFileName) !== decodeURIComponent(video.formTemplate.form.fileTitle)) {
                    try {
                      onExportedVideoFileTitleChange(getFileTitleFromName(uploadedFileName), video.title, video.wikiSource, (err) => {
                        if (err) {
                          console.log('error updating exported file name', err);
                        }
                      })
                    } catch (e) {
                      console.log('error onExportedVideoFileTitleChange', err);
                    }
                  }
                }
                // Clone the associated article and set it to the video
                // So if the published article got updated by the  autoupdate bot,
                // integrity among the article and the video will be still valid
                // cloneVideoArticle(video._id, (err, result) => {
                //   if (err) {
                //     console.log('error cloning video article ', err);
                //   }
                // });
                // Upload video subtitles to commons
                uploadVideoSubtitlesToCommons(video._id, (err, result) => {
                  if (err) {
                    console.log('error uploading subtitles to commons', err);
                    return;
                  }
                  console.log('uploaded subtitles to commons', result);
                });
              })
            })
          } else {
            VideoModel.findByIdAndUpdate(videoId, { $set: { status: 'failed' } }, () => {
            })
          }

          fs.unlink(filePath, () => {});
          converterChannel.ack(msg);
        })
        // callback(null, filePath)
      })
    console.log('recieved a request to uplaod video', video, filePath);
  });
}

function uploadArticleAudioSlides(title, wikiSource, user) {
  Article.findOne({ title, wikiSource, published: true })
  .exec((err, article) => {
    if (err) {
      return console.log(err);
    }
    if (!article) {
      return console.log('invalid title or wikiSource', article);
    }
    const uploadAudioFuncArray = [];
    const tmpFiles = [];
    article.slides.forEach((slide) => {
      if (slide.audioUploadedToCommons) return;
      // Upload audio files that didn't get uploaded before
      uploadAudioFuncArray.push((cb) => {
        const filePath = `${sharedConfig.TEMP_DIR}/${uuid()}.${slide.audio.split('.').pop()}`;
        tmpFiles.push(filePath);

        request
          .get(`https:${slide.audio}`)
          .on('error', (err) => {
            throw (err)
          })
          .pipe(fs.createWriteStream(filePath))
          .on('error', () => cb())
          .on('finish', () => {
            const fileTitle = generateAudioSlideTitle(article.lang, article.title, parseInt(slide.position) + 1, slide.audio.split('.').pop());
            const description = `${article.title} audio for slide number ${slide.position}`;
            const licence = 'cc-by-sa-4.0';
            const categories = ['Videowiki'];
            const source = 'own';
            const sourceUrl = `${process.env.HOST_URL}/videowiki/${article.title}?wikiSource=${article.wikiSource}&viewerMode=editor`;
            const comment = `oldid = ${article.wikiRevisionId}`
            const formValues = {
              fileTitle,
              description,
              categories,
              licence,
              source,
              sourceUrl,
              comment,
              date: moment().format('DD MMMM YYYY'),
            }
            wikiCommonsController.uploadFileToCommons(filePath, user, formValues, (err, result) => {
              if (err) {
                console.log('error uploading audio', slide, err);
              }
              fs.unlink(filePath, (err) => {
                if (err) {
                  console.log('error unlinking file', err);
                }
              })
              console.log('uploaded', slide, result);
              return cb(null, { slide, uploadResult: result });
            })
          })
      })
    })

    async.parallelLimit(uploadAudioFuncArray, 3, (err) => {
      if (err) {
        return console.log('error while uploading audios', err);
      }
      // Mark all slides as audio uploaded
      Article.findByIdAndUpdate(article._id, { $set: { [`slides.audioUploadedToCommons`]: true } }, (err) => {
        if (err) {
          return console.log('error updating audioUploadedToCommons', err);
        }
        console.log('updated audioUploadedToCommons');
      })
    })
  })
}

function generateAudioSlideTitle(lang, title, index, extension) {
  return `${lang.toUpperCase()}: ${title} Slide Audio ${index}.${extension}`
}

// Used to finalize the convert process without uploading to commons
function finalizeConvert(msg) {
  // Set version to the number of successfully uploaded videos
  const { videoId } = JSON.parse(msg.content.toString());
  const update = {
    $set: { status: 'uploaded', conversionProgress: 100 },
  }
  VideoModel.findById(videoId, (err, video) => {
    if (err) {
      console.log(err);
      return converterChannel.ack(msg);
    }
    VideoModel.count({ title: video.title, wikiSource: video.wikiSource, status: 'uploaded' }, (err, count) => {
      if (err) {
        console.log('error counting videos for version', err);
      }
      if (count !== undefined && count !== null) {
        update.$set.version = count + 1;
      } else {
        update.$set.version = 1;
      }

      VideoModel.findByIdAndUpdate(videoId, update, () => {
        converterChannel.ack(msg);
      })
    })
  })
}

function onHumanVoiceExport(videoId) {
  VideoModel.findById(videoId)
  .populate('humanvoice')
  .populate('user')
  .populate('article')
  .exec((err, video) => {
    if (err) {
      return console.log('error getting human voice', err);
    }
    const message = createHuamnVoiceExportMessage(video);
    notifyHumanvoiceExport(message);
    // In case of update, mark the updated sections as uploaded
    // if (message.type === 'update') {
    //   const updatedSections = getUpdatedHumanvoiceSections(video);
    //   if (!updatedSections || updatedSections.length === 0) {
    //     return console.log('no updated slides');
    //   }

    // }
  })
}

function createHuamnVoiceExportMessage(video) {
  const message = {
    title: video.title,
    wikiSource: video.wikiSource,
    user: video.user.username,
    date: new Date(),
    type: 'create',
  };

  // if (!video.humanvoice.uploaded) {
  //   message.type = 'create';
  // } else {
  //   message.type = 'update';
  //   const updatedSections = getUpdatedHumanvoiceSections(video);
  //   message.sections = updatedSections.map((s) => s.title);
  // }

  return message;
}

function getUpdatedHumanvoiceSections(video) {
  return video.article.sections;
}

function cloneVideoArticle(videoId, callback = () => {}) {
  VideoModel.findById(videoId)
  .populate('article')
  .exec((err, video) => {
    if (err) return callback(err);
    const clonedArticle = video.article
    clonedArticle._id = mongoose.Types.ObjectId();
    clonedArticle.isNew = true;

    clonedArticle.published = false;
    clonedArticle.draft = false;
    clonedArticle.editor = 'videowiki-bot';
    clonedArticle.version = new Date().getTime();

    clonedArticle.save((err) => {
      if (err) {
        console.log('error cloning article', err);
        return callback(err);
      }

      VideoModel.findByIdAndUpdate(video._id, { $set: { article: clonedArticle._id } }, { new: true }, (err, updatedVideo) => {
        if (err) {
          return callback(err);
        }
        return callback(null, updatedVideo);
      })
    })
  })
}

function uploadVideoSubtitlesToCommons(videoId, callback = () => {}) {
  VideoModel
    .findById(videoId)
    .populate('article')
    .populate('user', 'mediawikiToken mediawikiTokenSecret')
    .exec((err, video) => {
      if (err) return callback(err);
      if (!video) return callback(new Error(`Invalid video id ${videoId}`));
      if (!video.commonsUrl) return callback(new Error('Video was not uploaded to commons'));
      if (!video.commonsSubtitles) return callback(new Error('No subtitles are available for this video'));

      const token = video.user.mediawikiToken;
      const tokenSecret = video.user.mediawikiTokenSecret;
      // The subtitle name consists of a prefix "TimedText:", the name of the file that got exported, a dot,
      //  the language of the subtitle and .srt postfix
      const subtitleName = `TimedText:${decodeURIComponent(video.commonsUrl.split('/').pop())}.${video.lang}.srt`;
      request.get(video.commonsSubtitles, (err, response) => {
        if (err) return callback(err);
        if (!response || !response.body) return callback(new Error('Error fetching subtitles: body empty'));
        const subtitelsText = response.body;

        console.log('uploading subtitles')
        wikiUpload.uploadCommonsSubtitles(token, tokenSecret, subtitleName, subtitelsText)
        .then((res) => callback(null, res))
        .catch((err) => callback(err))
      })
    })
}
/*
  since a new version of the file is uploaded to commons, the previous version
  now has been archived. so we need to update its url to direct
  to the archived version
*/
function updateArchivedVideoUrl(title, wikiSource, lang, version) {
  VideoModel.find({
    title,
    wikiSource,
    lang,
    archived: false,
    commonsUrl: { $exists: true },
    commonsTimestamp: { $exists: true },
    commonsFileInfo: { $exists: true },
  }, (err, videos) => {
    if (err) return console.log('error updateArchivedVideoUrl ', err);
    if (!videos || videos.length === 0) return console.log('updateArchivedVideoUrl didnt find matching video version');
    /* eslint-disable prefer-arrow-callback */
    videos.forEach(function (video) {
      if (video.commonsFileInfo && video.commonsFileInfo.canonicaltitle && video.commonsTimestamp) {
        wikiCommonsController.fetchFileArchiveName(video.commonsFileInfo.canonicaltitle, COMMONS_WIKISOURCE, video.commonsTimestamp, (err, videoInfo) => {
          if (err) return console.log('error fetching video archive name', err);
          if (videoInfo) {
            const update = {};
            if (videoInfo.archivename) {
              update.archivename = videoInfo.archivename;
              update.archived = true;
            }
            if (videoInfo.url) {
              update.commonsUrl = videoInfo.url;
              update.commonsUploadUrl = videoInfo.url;
            }
            VideoModel.findByIdAndUpdate(video._id, { $set: update }, (err, result) => {
              if (err) console.log('error updating file archive name', err);
            })
          }
        })
      }
    })
  })
}

// updateArchivedVideoUrl('Wikipedia:VideoWiki/Mark_Zuckerberg', 'https://en.wikipedia.org', 2);

// uploadVideoSubtitlesToCommons('asdadasd', () => {})

function onExportedVideoFileTitleChange(fileTitle, title, wikiSource, callback = () => {}) {
  const fileName = `${getFileNameFromTitle(fileTitle)}.webm`;
  const fileHash = md5(fileName);
  const newUploadPostfix = `${fileHash[0]}/${fileHash[0]}${fileHash[1]}/${fileName}`;
  VideoModel.find({ title, wikiSource, status: { $nin: ['failed'] } })
  .populate('formTemplate')
  .exec((err, videos) => {
    if (err) return console.log('onExportedVideoUpload find error', title, wikiSource, err);
    if (videos.length === 0) return;
    const videosUpdates = [];
    const updatesArray = [];
    videos.forEach((video) => {
      const oneUpdate = {};
      // Update the file title field in the upload form if the new file title is changed
      if (video.formTemplate && video.formTemplate.form && fileTitle.trim() !== video.formTemplate.form.fileTitle.trim()) {
        updatesArray.push((cb) => {
          UploadFormTemplateModel.findByIdAndUpdate(video.formTemplate._id, { $set: { form: { ...video.formTemplate.form, fileTitle: getFileNameFromTitle(fileTitle) } } }, (err) => {
            if (err) console.log('error updating upload form template', err);
            cb();
          })
        })
      }
      if (video.commonsUploadUrl && video.commonsUploadUrl.indexOf(fileTitle) === -1) {
        const uploadPrefix = video.commonsUploadUrl.split('/commons/')[0];
        oneUpdate.commonsUploadUrl = `${uploadPrefix}/commons/${newUploadPostfix}`;
      }

      if (video.commonsUrl && video.commonsUrl.indexOf(fileTitle) === -1) {
        const uploadPrefix = video.commonsUrl.split('/commons/')[0];
        oneUpdate.commonsUrl = `${uploadPrefix}/commons/${newUploadPostfix}`;
      }

      if (video.archived && video.archivename) {
        const oldFileName = video.archivename.split('!').pop();
        oneUpdate.archivename = video.archivename.replace(oldFileName, fileName);
      }

      if (Object.keys(oneUpdate).length > 0) {
        const query = {
          updateOne: {
            filter: { _id: video._id },
            update: {
              $set: oneUpdate,
            },
          },
        };
        videosUpdates.push(query);
      }
    })

    updatesArray.push((cb) => {
      VideoModel.bulkWrite(videosUpdates)
        .then((res) => cb())
        .catch((err) => cb(err));
    })

    async.series(updatesArray, (err, results) => {
      if (err) return callback(err);
      return callback();
    })
  })
}

function normalizeVideoFileTitle(title) {
  return title.replace(/:|\//g, '-').trim();
}

function getFileNameFromTitle(title) {
  const re = /^File:(.*)\..*$/;
  const match = title.trim().match(re);
  if (match && match.length > 1) {
    return match[1];
  }
  return false;
}

function getFileTitleFromName(name) {
  return `File:${name}.webm`;
}
