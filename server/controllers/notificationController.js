// controllers/notificationController.js
import {
  createNotification,
  getNotificationsByUser,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotifications,
} from '../models/notificationModel.js';

export const createNotificationController = async (req, res) => {
  try {
    const { user_id, type, data } = req.body;
    if (!user_id || !type) {
      return res.status(400).json({ error: 'user_id и type обязательны' });
    }
    const notification = await createNotification(user_id, type, data || {});
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getNotificationsController = async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const notifications = await getNotificationsByUser(user_id);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const markNotificationAsReadController = async (req, res) => {
  try {
    const notification_id = req.params.notification_id;
    const updated = await markNotificationAsRead(notification_id);
    if (!updated) {
      return res.status(404).json({ error: 'Уведомление не найдено' });
    }
    res.json({ message: 'Уведомление помечено как прочитанное', notification: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const markAllNotificationsAsReadController = async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const updated = await markAllNotificationsAsRead(user_id);
    res.json({ message: 'Все уведомления помечены как прочитанные', notifications: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUnreadNotificationsController = async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const unread = await getUnreadNotifications(user_id);
    res.json(unread);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};