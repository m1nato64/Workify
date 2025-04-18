// server.js
import express from 'express';
import cors from 'cors';
     

import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import bidRoutes from './routes/bidRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:5173', // Адрес вашего фронтенда
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  
}));
app.use(express.json());

// Маршруты для работы с проектами
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/upload', uploadRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден!' });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен! 🖥️ Порт: 🏳️ http://localhost:${PORT} 🏳️`);
});
