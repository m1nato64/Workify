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
    console.error('Ошибка при создании проекта:', err.message);  // Логируем ошибку
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

// Обновление статуса проекта
export const updateProjectStatus = async (projectId, status) => {
  try {
    const query = 'UPDATE projects SET status = $1 WHERE id = $2 RETURNING *';
    const values = [status, projectId];
    const result = await pool.query(query, values);
    return result.rows[0]; 
  } catch (err) {
    console.error('Ошибка при обновлении статуса проекта:', err.message);
    throw err;
  }
};

// Тогл на принятие откликов
export const toggleBids = async (projectId, accepting) => {
  const query = 'UPDATE projects SET accepting_bids = $1 WHERE id = $2 RETURNING *';
  const values = [accepting, projectId];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Удаление проекта
export const deleteProject = async (projectId) => {
  const query = 'DELETE FROM projects WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [projectId]);
  return result.rows[0];
};

// Обновление данных проекта
export const updateProject = async (projectId, title, description, status, media) => {
  try {
    const query = `
      UPDATE projects 
      SET title = $1, description = $2, status = $3, media = $4 
      WHERE id = $5 
      RETURNING *`;
    const values = [title, description, status, media, projectId];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    console.error('Ошибка при обновлении проекта:', err.message);
    throw err;
  }
};