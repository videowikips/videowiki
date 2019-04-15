import utils from '../utils';

const amqp = require('amqplib/callback_api');
const RABBITMQ_AUTH_EXCHANGE = 'RABBITMQ_AUTH_EXCHANGE';

const args = process.argv.slice(2);
const lang = args[1];

const RABBITMQ_AUTH_QUEUE = `RABBITMQ_AUTH_QUEUE_${lang}`;

function initRabbitMQ() {
  amqp.connect(process.env.RABBITMQ_SERVER, (err, conn) => {
    if (err) {
      return console.log('Error connecting to rabbit mq in auth ', err);
    }
    console.log('connected to rabbitmq for authentication')
    conn.createChannel((err, ch) => {
      if (err) {
        return console.log('Error creating channel in rabbitmq in auth ', err);
      }
      console.log('created a channel for ', RABBITMQ_AUTH_EXCHANGE)
      ch.assertExchange(RABBITMQ_AUTH_EXCHANGE, 'fanout', { durable: true });
      ch.assertQueue(RABBITMQ_AUTH_QUEUE, { durable: true }, (err) => {
        if (err) {
          return console.log('error asserting queue ', RABBITMQ_AUTH_QUEUE, err);
        }

        ch.bindQueue(RABBITMQ_AUTH_QUEUE, RABBITMQ_AUTH_EXCHANGE, '');
        ch.consume(RABBITMQ_AUTH_QUEUE, (msg) => {
          const userInfo = JSON.parse(msg.content.toString());
          utils.signupCrossWikiUser(userInfo);
          ch.ack(msg)
        })
      })
    })
  })
}

export default {
  initRabbitMQ,
};
