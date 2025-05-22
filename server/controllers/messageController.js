// controllers/messageController.js
import { 
  sendMessage, 
  getMessagesBetweenUsers, 
  getMessagesForUser,
 } from '../models/messageModel.js';

// Отправка сообщения
export const sendMessageController = async (req, res) => {
  try {
    const { sender_id, receiver_id, content } = req.body;
    const message = await sendMessage(sender_id, receiver_id, content);
    res.status(201).json({ message: 'Сообщение отправлено', data: message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Получение всех сообщений между двумя пользователями
export const getMessagesBetweenUsersController = async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    const messages = await getMessagesBetweenUsers(user1, user2);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Получение всех сообщений пользователя
export const getMessagesForUserController = async (req, res) => {
  try {
    const { user_id } = req.params;
    const messages = await getMessagesForUser(user_id);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
