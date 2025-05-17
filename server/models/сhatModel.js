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