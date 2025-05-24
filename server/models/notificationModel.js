// models/notificationModel.js
import { pool } from './database.js';

// Создание уведомления
export const createNotification = async (user_id, type, data) => {
  const query = `
    INSERT INTO notifications (user_id, type, data, read, created_at)
    VALUES ($1, $2, $3, false, NOW())
    RETURNING *`;
  const values = [user_id, type, JSON.stringify(data)];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Получение уведомлений пользователя
export const getNotificationsByUser = async (user_id) => {
  const query = `
    SELECT id, type, data, read, created_at
    FROM notifications
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT 50`;
  const { rows } = await pool.query(query, [user_id]);
  return rows;
};

// Обновление статуса уведомления (например, пометить как прочитанное)
export const markNotificationAsRead = async (notification_id) => {
  const query = `
    UPDATE notifications
    SET read = true
    WHERE id = $1
    RETURNING *`;
  const { rows } = await pool.query(query, [notification_id]);
  return rows[0];
};

// Можно добавить метод для массового обновления всех уведомлений пользователя
export const markAllNotificationsAsRead = async (user_id) => {
  const query = `
    UPDATE notifications
    SET read = true
    WHERE user_id = $1 AND read = false
    RETURNING *`;
  const { rows } = await pool.query(query, [user_id]);
  return rows;
};

// Получить только непрочитанные уведомления
export const getUnreadNotifications = async (user_id) => {
  const query = `
    SELECT id, type, data, read, created_at
    FROM notifications
    WHERE user_id = $1 AND read = false
    ORDER BY created_at DESC
  `;
  const { rows } = await pool.query(query, [user_id]);
  return rows;
};