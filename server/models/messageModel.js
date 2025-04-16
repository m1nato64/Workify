// models/messageModel.js
import { pool } from './database.js'; // Подключаем пул соединений

// Отправка сообщения
export const sendMessage = async (sender_id, receiver_id, content) => {
  const query = `INSERT INTO messages (sender_id, receiver_id, content, created_at)
                 VALUES ($1, $2, $3, NOW()) RETURNING *`;
  const values = [sender_id, receiver_id, content];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Получение всех сообщений между двумя пользователями
export const getMessagesBetweenUsers = async (user1, user2) => {
  const query = `SELECT * FROM messages
                 WHERE (sender_id = $1 AND receiver_id = $2)
                    OR (sender_id = $2 AND receiver_id = $1)
                 ORDER BY created_at ASC`;
  const result = await pool.query(query, [user1, user2]);
  return result.rows;
};

// Получение всех сообщений пользователя
export const getMessagesForUser = async (user_id) => {
  const query = `SELECT * FROM messages WHERE sender_id = $1 OR receiver_id = $1 ORDER BY created_at DESC`;
  const result = await pool.query(query, [user_id]);
  return result.rows;
};
