import express from 'express';
import {
  createReviewController,
  getProjectReviewsController,
  getUserReviewsController
} from '../controllers/reviewController.js';

const router = express.Router();

// Добавить отзыв
router.post('/', createReviewController);

// Получить отзывы по проекту
router.get('/project/:project_id', getProjectReviewsController);

// Получить отзывы пользователя
router.get('/user/:user_id', getUserReviewsController);

export default router;
