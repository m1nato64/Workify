// server/models/profileModel.js
import { pool } from './database.js';
import bcrypt from 'bcrypt';

// Получить данные пользователя
export async function getUserData(id) {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
}

export async function getAdminUsers() {
  const result = await pool.query(
    "SELECT id, name, avatar FROM users WHERE role = 'Admin'"
  );
  return result.rows;
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

// Обновление скиллов юзера
export const updateUserSkills = async (userId, skills) => {
  const result = await pool.query(
    'UPDATE users SET skills = $1 WHERE id = $2 RETURNING *',
    [skills, userId]
  );
  return result.rows[0];
};

export async function getAllUsers() {
  const result = await pool.query('SELECT id, name, role, skills, rating, created_at, avatar FROM users ORDER BY name');
  return result.rows;
}

// Получить настройку показа обучения
export async function getShowTutorialSetting(userId) {
  const result = await pool.query(
    'SELECT show_tutorial_on_login FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0]?.show_tutorial_on_login ?? true; // по умолчанию true
}

// Обновить настройку показа обучения
export async function updateShowTutorialSetting(userId, showTutorial) {
  const result = await pool.query(
    'UPDATE users SET show_tutorial_on_login = $1 WHERE id = $2 RETURNING show_tutorial_on_login',
    [showTutorial, userId]
  );
  return result.rows[0];
}

// Получаем список фрилансеров
export const getFreelancers = async () => {
  const result = await pool.query(
    "SELECT id, name, avatar, skills, rating FROM users WHERE role = 'Freelancer'"
  );
  return result.rows;
};

export async function getUserRating(userId) {
  const result = await pool.query('SELECT rating FROM users WHERE id = $1', [userId]);
  if (result.rows.length === 0) {
    throw new Error('Пользователь не найден');
  }
  return result.rows[0].rating;
}

// Обновить рейтинг пользователя (пересчитать средний рейтинг из отзывов)
export async function updateUserRating(userId) {
  const avgResult = await pool.query(
    'SELECT AVG(rating) as avg_rating FROM reviews WHERE reviewed_user_id = $1',
    [userId]
  );
  const avgRating = avgResult.rows[0].avg_rating || 0;

  const updateResult = await pool.query(
    'UPDATE users SET rating = $1 WHERE id = $2 RETURNING *',  // возвращаем все поля пользователя
    [avgRating, userId]
  );
  return updateResult.rows[0];  // возвращаем объект пользователя
}