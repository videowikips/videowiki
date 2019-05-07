import { AUTHENTICATE, AUTHENTICATE_FAILED, AUTHENTICATE_SUCCESS } from '../shared/vendors/websockets/events';
import { SocketConnection as SocketConnectionModel } from '../shared/models';
const jwt = require('jsonwebtoken');

export const handlers = [
  {
    event: AUTHENTICATE,
    handler: (socket) => (data) => {
      const { token } = data;
      if (token) {
        jwt.verify(token, process.env.APP_SECRET, (err, user) => {
          if (err) {
            console.log('decodeApiToken - error ', err);
            return socket.emit(AUTHENTICATE_FAILED);
          }

          const { mediawikiId } = user;
          SocketConnectionModel.findOneAndUpdate({ mediawikiId }, { $set: { mediawikiId, socketId: socket.id } }, { upsert: true, new: true }, (err, socketConnection) => {
            if (err) {
              console.log('error authenticating user', err);
              return socket.emit(AUTHENTICATE_FAILED);
            }
            return socket.emit(AUTHENTICATE_SUCCESS, socketConnection);
          })
        });
      } else {
        return socket.emit(AUTHENTICATE_FAILED);
      }
    },
  },
];
