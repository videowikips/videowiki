import Article from '../../models/Article';
import mongoose from 'mongoose';

const amqp = require('amqplib/callback_api');
const fs = require('fs');
const path = require('path');
const request = require('request');
const VideoModel = require('../../models/Video');
const wikiCommonsController = require('../wikiCommons')
const wikiUpload = require('../../utils/wikiUploadUtils');

const args = process.argv.slice(2);
const lang = args[1];

const DELETE_AWS_VIDEO = 'DELETE_AWS_VIDEO';
const CONVERT_QUEUE = `CONVERT_ARTICLE_QUEUE_${lang}`;
const UPDLOAD_CONVERTED_TO_COMMONS_QUEUE = `UPDLOAD_CONVERTED_TO_COMMONS_QUEUE_${lang}`;

const COMMONS_WIKISOURCE = 'https://commons.wikimedia.org';

let retryCount = 0;
let converterChannel;

module.exports = {
  convertArticle(identifier) {
    converterChannel.sendToQueue(CONVERT_QUEUE, new Buffer(JSON.stringify(identifier)), { persistent: true });
  },
}

function init() {
  retryCount++;

  if (retryCount <= 10) {
    amqp.connect(process.env.RABBITMQ_SERVER, (err, conn) => {
      if (err) {
        console.log(err);
        // Retry connection
        setTimeout(() => {
          init();
        }, 1000 * 60);
        return;
      }
      conn.createChannel((err, ch) => {
        if (err) {
          console.log(err);
          setTimeout(() => {
            init();
          }, 1000 * 60);
          return;
        }
        ch.assertQueue(CONVERT_QUEUE, { durable: true })
        ch.assertQueue(UPDLOAD_CONVERTED_TO_COMMONS_QUEUE, { durable: true });
        ch.assertQueue(DELETE_AWS_VIDEO, { durable: true });
        // ch.sendToQueue(CONVERT_QUEUE, new Buffer(JSON.stringify({videoId: '5c98f40f3fe26b11ed1a50aa'})))
        converterChannel = ch;
        retryCount = 0;
        console.log('Connected to rabbitmq server successfully');

        if (process.env.ENV === 'production') {
          ch.consume(UPDLOAD_CONVERTED_TO_COMMONS_QUEUE, uploadConvertedToCommons, { noAck: false });
        } else {
          ch.consume(UPDLOAD_CONVERTED_TO_COMMONS_QUEUE, finalizeConvert, { noAck: false });
        }
      })
    })
  }
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

    const filePath = `${path.resolve(__dirname, '../../../tmp')}/${video.url.split('/').pop()}`;
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
        wikiCommonsController.uploadFileToCommons(filePath, video.user, video.formTemplate.form, (err, result) => {
          console.log('uploaded to commons ', err, result);
          if (result && result.success) {
            const update = {
              $set: {
                status: 'uploaded',
                commonsUrl: result.url,
                commonsUploadUrl: result.url,
                conversionProgress: 100,
                wrapupVideoProgress: 100,
                commonsTimestamp: result.fileInfo.timestamp,
                commonsFileInfo: result.fileInfo,
              },
            }
            // Set version to the number of successfully uploaded videos
            VideoModel.count({ title: video.title, wikiSource: video.wikiSource, status: 'uploaded' }, (err, count) => {
              if (err) {
                console.log('error counting videos for version', err);
              }
              if (count !== undefined && count !== null) {
                update.$set.version = count + 1;
                updateArchivedVideoUrl(video.title, video.wikiSource, count);
              } else {
                update.$set.version = 1;
              }
              VideoModel.findByIdAndUpdate(videoId, update, (err, result) => {
                if (err) {
                  console.log('error updating video after upload ', err);
                } else {
                  // Delete video from AWS since it's now on commons
                  converterChannel.sendToQueue(DELETE_AWS_VIDEO, new Buffer(JSON.stringify({ videoId })));
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
function updateArchivedVideoUrl(title, wikiSource, version) {
  VideoModel.find({
    title,
    wikiSource,
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
          if (videoInfo && videoInfo.archivename) {
            const update = {
              archived: true,
              archivename: videoInfo.archivename,
            };
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
init();
