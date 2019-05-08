const amqp = require('amqplib/callback_api');
let connection;
function createChannel(callback = () => {}) {
  if (!connection) {
    amqp.connect(process.env.RABBITMQ_SERVER, (err, conn) => {
      if (err) {
        return callback(err);
      }
      connection = conn;
      conn.createChannel((err, ch) => {
        if (err) {
          return callback(err);
        }
        // ch.sendToQueue(CONVERT_QUEUE, new Buffer(JSON.stringify({videoId: '5c98f40f3fe26b11ed1a50aa'})))
        return callback(null, ch)
      })
    })
  } else {
    connection.createChannel((err, ch) => {
      if (err) {
        return callback(err);
      }
      // ch.sendToQueue(CONVERT_QUEUE, new Buffer(JSON.stringify({videoId: '5c98f40f3fe26b11ed1a50aa'})))
      return callback(null, ch)
    })
  }
}

export default {
  createChannel,
}
