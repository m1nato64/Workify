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

router.post('/', createNotificationController);
router.get('/:user_id', getNotificationsController);
router.get('/unread/:user_id', getUnreadNotificationsController);
router.put('/read/:notification_id', markNotificationAsReadController);
router.put('/read/all/:user_id', markAllNotificationsAsReadController);

export default router;