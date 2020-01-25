import { Humanvoice as HumanvoiceModel, SocketConnection as SocketConnectionModel } from '../../models';
import rabbitmqService from '../../vendors/rabbitmq';
import { HUMANVOICE_AUDIO_PROCESSING } from '../../vendors/websockets/events';

import * as websocketsService from '../../vendors/websockets';

const console = process.console;
const args = process.argv.slice(2);
const lang = args[1];

const PROCESS_HUMANVOICE_AUDIO_QUEUE = `PROCESS_HUMANVOICE_AUDIO_QUEUE_${lang}`;
const PROCESS_HUMANVOICE_AUDIO_FINISHED_QUEUE = `PROCESS_HUMANVOICE_AUDIO_FINISHED_QUEUE_${lang}`;
const PROCESS_ARTICLE_AUDIO_QUEUE = `PROCESS_ARTICLE_AUDIO_QUEUE_${lang}`;

let audioProcessorChannel;

if (!audioProcessorChannel) {
  console.log('####### Starting audio processor channel #######');
  rabbitmqService.createChannel((err, ch) => {
    if (err) {
      console.log('error creating channel for exporter', err);
    } else if (ch) {
      audioProcessorChannel = ch;
      ch.assertQueue(PROCESS_HUMANVOICE_AUDIO_QUEUE, { durable: true })
      ch.assertQueue(PROCESS_HUMANVOICE_AUDIO_FINISHED_QUEUE, { durable: true });
      console.log('Connected to rabbitmq audio processor server successfully');
      ch.consume(PROCESS_HUMANVOICE_AUDIO_FINISHED_QUEUE, onProcessHumanvoiceAudioFinish, { noAck: false });
    }
  })
}

export function processHumanVoiceAudio(identifier) {
  audioProcessorChannel.sendToQueue(PROCESS_HUMANVOICE_AUDIO_QUEUE, new Buffer(JSON.stringify(identifier)), { persistent: true });
}

export function processArticleAudio(identifier) {
  audioProcessorChannel.sendToQueue(PROCESS_ARTICLE_AUDIO_QUEUE, new Buffer(JSON.stringify(identifier)), { persistent: true });
}

export default {
  processHumanVoiceAudio,
  processArticleAudio
}
/*
  Respnse on finish queue consists of
    success: flag of success.
    humanvoiceId,
    audioPosition
  Just forward to the user if he's online
*/
function onProcessHumanvoiceAudioFinish(msg) {
  const { success, humanvoiceId, audioPosition } = JSON.parse(msg.content.toString());
  audioProcessorChannel.ack(msg);

  HumanvoiceModel.findById(humanvoiceId).populate('user')
  .exec((err, humanvoice) => {
    if (err) {
      return console.log('processing human voice retrieve error ', err);
    }
    if (!humanvoice) {
      return console.log('Invalid human voice id', humanvoiceId);
    }
    console.log('on process done')
    SocketConnectionModel.findOne({ mediawikiId: humanvoice.user.mediawikiId }, (err, socketConnection) => {
      if (err) {
        return console.log('error retrieve socket connection model', err);
      }
      if (!socketConnection) {
        return console.log('user offline');
      }
      const audioItem = humanvoice.audios.find((audio) => parseInt(audio.position) === parseInt(audioPosition));
      if (audioItem) {
        console.log('sending a done request to the user via socket')
        websocketsService.socketConnection.to(socketConnection.socketId).emit(HUMANVOICE_AUDIO_PROCESSING, { success, humanvoiceId, slideAudioInfo: audioItem });
      }
    })
  })
}
