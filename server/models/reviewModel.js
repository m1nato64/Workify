// models/reviewModel.js
import { pool } from './database.js';

// Добавление отзыва
export const addReview = async (project_id, author_id, rating, content) => {
  const query = `
    INSERT INTO reviews (project_id, author_id, rating, created_at, content)
    VALUES ($1, $2, $3, NOW(), $4)
    RETURNING *`;
  const values = [project_id, author_id, rating, content];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Получение отзывов по проекту
export const getReviewsForProject = async (project_id) => {
  const query = `
    SELECT * FROM reviews 
    WHERE project_id = $1 
    ORDER BY created_at DESC`;
  const result = await pool.query(query, [project_id]);
  return result.rows;
};

// Получение всех отзывов пользователя
export const getReviewsForUser = async (user_id) => {
  const query = `
    SELECT * FROM reviews 
    WHERE author_id = $1 
    ORDER BY created_at DESC`;
  const result = await pool.query(query, [user_id]);
  return result.rows;
};
