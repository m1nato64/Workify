// models/messageModel.js
import { pool } from './database.js';
import { findOrCreateChat } from './chatModel.js';

// Отправка сообщения
export const sendMessage = async (sender_id, receiver_id, content) => {
  const chat = await findOrCreateChat(sender_id, receiver_id);

  const query = `
    INSERT INTO messages (chat_id, sender_id, receiver_id, content, created_at)
    VALUES ($1, $2, $3, $4, NOW())
    RETURNING *`;
  const values = [chat.id, sender_id, receiver_id, content];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Получение всех сообщений между двумя пользователями
export const getMessagesBetweenUsers = async (user1, user2) => {
  const chat = await findOrCreateChat(user1, user2);

  const query = `
    SELECT * FROM messages
    WHERE chat_id = $1
    ORDER BY created_at ASC`;
  const result = await pool.query(query, [chat.id]);
  return result.rows;
};

// Получение всех сообщений пользователя
export const getMessagesForUser = async (user_id) => {
  const query = `SELECT * FROM messages WHERE sender_id = $1 OR receiver_id = $1 ORDER BY created_at DESC`;
  const result = await pool.query(query, [user_id]);
  return result.rows;
};
