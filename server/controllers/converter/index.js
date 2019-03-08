const amqp = require('amqplib/callback_api');
const fs = require('fs');
const path = require('path');
const request = require('request');
const VideoModel = require('../../models/Video');
const wikiCommonsController = require('../wikiCommons')

const args = process.argv.slice(2);
const lang = args[1];

const DELETE_AWS_VIDEO = 'DELETE_AWS_VIDEO';
const CONVERT_QUEUE = `CONVERT_ARTICLE_QUEUE_${lang}`;
const UPDLOAD_CONVERTED_TO_COMMONS_QUEUE = `UPDLOAD_CONVERTED_TO_COMMONS_QUEUE_${lang}`;

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

        converterChannel = ch;
        retryCount = 0;
        console.log('Connected to rabbitmq server successfully');

        ch.consume(UPDLOAD_CONVERTED_TO_COMMONS_QUEUE, uploadConvertedToCommons, { noAck: false })
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
              $set: { status: 'uploaded', commonsUrl: result.url, conversionProgress: 100, wrapupVideoProgress: 100 },
            }
            // Set version to the number of successfully uploaded videos
            VideoModel.count({ title: video.title, wikiSource: video.wikiSource, status: 'uploaded' }, (err, count) => {
              if (err) {
                console.log('error counting videos for version', err);
              }
              if (count !== undefined && count !== null) {
                update.$set.version = count + 1;
              }
              VideoModel.findByIdAndUpdate(videoId, update, (err, result) => {
                if (err) {
                  console.log('error updating video after upload ', err);
                } else {
                  // Delete video from AWS since it's now on commons
                  converterChannel.sendToQueue(DELETE_AWS_VIDEO, new Buffer(JSON.stringify({ videoId })));
                }
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

init();
