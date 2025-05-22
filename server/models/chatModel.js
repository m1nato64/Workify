//server/models/chatModel.js
import { pool } from './database.js';

export const findOrCreateChat = async (user1_id, user2_id) => {
  const [u1, u2] = user1_id < user2_id ? [user1_id, user2_id] : [user2_id, user1_id];

  const findQuery = `SELECT * FROM chats WHERE user1_id = $1 AND user2_id = $2`;
  const findResult = await pool.query(findQuery, [u1, u2]);

  if (findResult.rows.length > 0) {
    return findResult.rows[0];
  }

  const insertQuery = `INSERT INTO chats (user1_id, user2_id) VALUES ($1, $2) RETURNING *`;
  const insertResult = await pool.query(insertQuery, [u1, u2]);
  return insertResult.rows[0];
};

export const getChatUsersForUser = async (user_id) => {
  // Получаем все id чатов, где user_id участвует (как user1 или user2)
  const chatQuery = `
    SELECT id FROM chats WHERE user1_id = $1 OR user2_id = $1
  `;
  const chatResult = await pool.query(chatQuery, [user_id]);
  const chatIds = chatResult.rows.map(row => row.id);

  if (chatIds.length === 0) {
    return [];
  }

  // Отфильтровываем только те чаты, в которых есть сообщения
  const chatsWithMessagesQuery = `
    SELECT DISTINCT chat_id FROM messages WHERE chat_id = ANY($1::int[])
  `;
  const chatsWithMessagesResult = await pool.query(chatsWithMessagesQuery, [chatIds]);
  const chatIdsWithMessages = chatsWithMessagesResult.rows.map(row => row.chat_id);

  if (chatIdsWithMessages.length === 0) {
    return [];
  }

  // Получаем собеседников из этих чатов
  const usersQuery = `
    SELECT DISTINCT
      CASE
        WHEN user1_id = $1 THEN user2_id
        ELSE user1_id
      END AS user_id
    FROM chats
    WHERE id = ANY($2::int[])
  `;

  const usersResult = await pool.query(usersQuery, [user_id, chatIdsWithMessages]);
  const userIds = usersResult.rows.map(row => row.user_id);

  if (userIds.length === 0) return [];

  // Получаем данные пользователей (id и name)
  const usersDataQuery = `
    SELECT id, name FROM users WHERE id = ANY($1::int[])
  `;
  const usersDataResult = await pool.query(usersDataQuery, [userIds]);

  return usersDataResult.rows;
};
