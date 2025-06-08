import { io } from '../config/instances.js';
import UserController from '../controllers/userController.js';

const sockets = {}
io.on('connection', (socket) => {
  const userController = UserController();

  io.emit("nova mensagem", socket.id)
  socket.on('disconnect', () => {
    io.emit('user disconnected');
    const id = sockets[socket.id];
    
    userController.logoffUser(id, () => {
      io.emit('user-logoff', id);
    });
  })

  socket.on('logoff', (id) => {
    userController.logoffUser(id, () => {
      io.emit('user-logoff', id);
    });
  })

  socket.on("join-rooms", (chatIds) => {
    chatIds.forEach(chatID => socket.join(`chat${chatID}`))
  })
  socket.on('add-user-id', (id) => {
    userController.logonUser(id, socket, () => {
      io.emit('user-logged', id);
    });
  })

  socket.on('save-id', (id) => {
    sockets[socket.id] = id
  })
})