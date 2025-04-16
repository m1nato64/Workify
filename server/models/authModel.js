import { pool } from './database.js' // Подключаем пул для работы с БД
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Регистрация
export const registerUser = async (name, password, role, skills) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Хешируем пароль
    const result = await pool.query(
      `INSERT INTO users (name, password, role, skills) VALUES ($1, $2, $3, $4) RETURNING id, name, role`,
      [name, hashedPassword, role, skills]
    );
    return result.rows[0]; // Возвращаем данные пользователя
  } catch (err) {
    console.error("Ошибка при регистрации:", err);
    throw err;
  }
};

// Авторизация
export const loginUser = async (name, password) => {
  try {
    const result = await pool.query(
      `SELECT * FROM users WHERE name = $1`,
      [name]
    );

    if (result.rows.length === 0) {
      throw new Error("Пользователь не найден");
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new Error("Неверный пароль");
    }

    // JWT токен
    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      "secret_key",
      { expiresIn: "1h" }
    );

    return { token, user: { id: user.id, name: user.name, role: user.role } };
  } catch (err) {
    console.error("Ошибка при авторизации:", err);
    throw err;
  }
};
