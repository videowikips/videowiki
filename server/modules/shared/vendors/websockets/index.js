const io = require('socket.io');

export let socketConnection;
export const createSocketConnection = function(server, options = {}) {
  socketConnection = io(server, options);
  return socketConnection;
}
