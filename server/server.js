// server.js
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import bidRoutes from './routes/bidRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { sendMessage } from './models/messageModel.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app); 

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const connectedUsers = new Map();

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

// Middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/upload-avatar', uploadRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден!' });
});

// Запуск сервера
server.listen(PORT, () => {
  console.log(`🚀 Сервер и WebSocket запущены на http://localhost:${PORT}`);
});
