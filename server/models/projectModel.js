// models/projectModel.js
import { pool } from './database.js';

// Создание проекта
export const createProject = async (title, description, status, client_id, media) => {
  try {
    const result = await pool.query(
      'INSERT INTO projects (title, description, status, media, client_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, status, client_id, media]
    );
    return result.rows[0];
  } catch (err) {
    console.error('Error inserting project into DB:', err.message);  // Логируем ошибку
    throw err;  // Пробрасываем ошибку дальше
  }
};

// Получение всех проектов
export const getAllProjects = async () => {
  try {
    const result = await pool.query(`SELECT * FROM projects`);
    return result.rows;
  } catch (err) {
    console.error("Ошибка при получении списка проектов:", err);
    throw err;
  }
};

// Получение проектов, созданных пользователем по client_id
export const getProjectsByUserId = async (client_id) => {
  try {
    const result = await pool.query(`SELECT * FROM projects WHERE client_id = $1`, [client_id]);
    return result.rows;
  } catch (err) {
    console.error("Ошибка при получении проектов пользователя:", err);
    throw err;
  }
};

// Получение проекта по ID
export const getProjectById = async (id) => {
  try {
    const result = await pool.query(`SELECT * FROM projects WHERE id = $1`, [id]);
    return result.rows[0];
  } catch (err) {
    console.error("Ошибка при получении проекта:", err);
    throw err;
  }
};
