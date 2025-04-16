// routes/messageRoutes.js
import express from 'express';
import { sendMessageController, getMessagesBetweenUsersController, getMessagesForUserController } from '../controllers/messageController.js';

const router = express.Router();

// Отправка сообщения
router.post('/', sendMessageController);

// Получение всех сообщений между двумя пользователями
router.get('/:user1/:user2', getMessagesBetweenUsersController);

// Получение всех сообщений пользователя
router.get('/:user_id', getMessagesForUserController);

export default router;
