// models/reviewModel.js
import { pool } from "./database.js";

export const addReview = async (
  project_id,
  author_id,
  target_user_id,
  rating,
  content
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const insertReviewQuery = `
      INSERT INTO reviews (project_id, author_id, target_user_id, rating, created_at, content)
      VALUES ($1, $2, $3, $4, NOW(), $5)
      RETURNING *`;
    const reviewResult = await client.query(insertReviewQuery, [
      project_id,
      author_id,
      target_user_id,
      rating,
      content,
    ]);
    const newReview = reviewResult.rows[0];

    // Подсчёт нового среднего рейтинга для target_user_id
    const avgRatingQuery = `
      SELECT AVG(r.rating)::numeric(3,2) as average
      FROM reviews r
      WHERE r.target_user_id = $1
    `;
    const avgResult = await client.query(avgRatingQuery, [target_user_id]);
    const averageRating = avgResult.rows[0]?.average || 0;

    // Обновление рейтинга пользователя
    const updateUserRatingQuery = `UPDATE users SET rating = $1 WHERE id = $2`;
    await client.query(updateUserRatingQuery, [averageRating, target_user_id]);

    await client.query("COMMIT");
    return newReview;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
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
