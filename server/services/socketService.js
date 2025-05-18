// services/socketService.js
import { Server } from 'socket.io';
import { sendMessage } from '../models/messageModel.js';

const connectedUsers = new Map();

export function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.on('register', (userId) => {
      connectedUsers.set(userId, socket.id);
    });

    socket.on('send_message', async ({ sender_id, receiver_id, content }) => {
      try {
        const message = await sendMessage(sender_id, receiver_id, content);
        const receiverSocketId = connectedUsers.get(receiver_id);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receive_message', message);
        }
        socket.emit('message_sent', message);
      } catch (err) {
        console.error('Ошибка при отправке сообщения:', err);
      }
    });

    socket.on('disconnect', () => {
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
          break;
        }
      }
    });
  });

  return io;
}
