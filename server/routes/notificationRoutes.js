// routes/notificationRoutes.js
import express from 'express';
import {
  createNotificationController,
  getNotificationsController,
  markNotificationAsReadController,
  markAllNotificationsAsReadController,
  getUnreadNotificationsController,
} from '../controllers/notificationController.js';

const router = express.Router();

// Создать уведомление (можно и через сокеты, но API пригодится)
router.post('/', createNotificationController);

// Получить уведомления пользователя
router.get('/:user_id', getNotificationsController);

// Получить только непрочитанные уведомления
router.get('/unread/:user_id', getUnreadNotificationsController);

// Пометить уведомление как прочитанное
router.put('/read/:notification_id', markNotificationAsReadController);

// Пометить все уведомления пользователя как прочитанные
router.put('/read/all/:user_id', markAllNotificationsAsReadController);



export default router;