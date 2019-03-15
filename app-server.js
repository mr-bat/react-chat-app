import express from 'express';
const app = express();
// Set port
app.set('port', process.env.PORT || 3000);
// Static files
app.use(express.static('public'));
const http = require('http').Server(app);
const io = require('socket.io')(http);

// Models
import { createMessage, getMessages, removeMessage } from './models/Message';
import { onEnterUser, onExitUser } from './models/User';

// sendToUser(socket.id, 'event name', [data, [callback]]);
export const sendToUser = (userId, event, ...args) =>
  io.sockets.connected[userId].emit(event, ...args);

// Listen for a connection
io.on('connection', socket => {
  onEnterUser(socket.id);

  socket.on('chat message', message =>
    createMessage(message, socket.id).then(newMessage =>
      io.emit('chat message', newMessage)));

  socket.on('request messages', (date) =>
    socket.emit('receive messages', getMessages(socket.id, date)));
  socket.on('remove chat', (_id) => removeMessage(socket.id, _id));

  socket.on('disconnect', () => onExitUser(socket.id));
});

// Route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

http.listen(app.get('port'), () => {
  console.log('React Chat App listening on ' + app.get('port'));
});
