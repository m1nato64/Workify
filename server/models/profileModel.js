// server/models/profileModel.js
import { pool } from './database.js';
import bcrypt from 'bcrypt';

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

// Обновление имени пользователя
export const updateUserName = async (userId, name) => {
  const result = await pool.query(
    'UPDATE users SET name = $1 WHERE id = $2 RETURNING *',
    [name, userId]
  );
  return result.rows[0];
};

// Добавление, обновление аватарки
export const updateUserAvatar = async (userId, avatarUrl) => {
  const result = await pool.query( 
    'UPDATE users SET avatar = $1 WHERE id = $2 RETURNING avatar',
    [avatarUrl, userId]
  );
  return result.rows[0];  
};

// Функция для смены пароля
export const changePassword = async (userId, oldPassword, newPassword) => {
  try {
    // Получаем данные пользователя
    const result = await pool.query(
      `SELECT * FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error("Пользователь не найден");
    }

    const user = result.rows[0];
    
    // Проверяем, что старый пароль правильный
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) {
      throw new Error("Неверный старый пароль");
    }

    // Хешируем новый пароль
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Обновляем пароль в базе данных
    const updateResult = await pool.query(
      `UPDATE users SET password = $1 WHERE id = $2 RETURNING id, name, role`,
      [hashedPassword, userId]
    );

    return updateResult.rows[0];
  } catch (err) {
    console.error("Ошибка при смене пароля:", err);
    throw err;
  }
};