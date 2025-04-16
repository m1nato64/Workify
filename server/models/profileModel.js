// profileModel.js
import { pool } from './database.js';

// Получить данные пользователя
export async function getUserData(id) {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
}

// Обновить данные пользователя
export async function updateUserData(id, name, password, skills) {
  const result = await pool.query(
    `UPDATE users SET name = $1, password = $2, skills = $3 WHERE id = $4 RETURNING *`,
    [name, password, skills, id]
  );
  return result.rows[0];
}

// Удалить аккаунт пользователя
export async function deleteUserAccount(id) {
  const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
}


