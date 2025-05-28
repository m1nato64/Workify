//server/routes/reviewRoutes.js
import express from 'express';
import {
  createReviewController,
  getProjectReviewsController,
  getUserReviewsController
} from '../controllers/reviewController.js';

const router = express.Router();

router.post('/', createReviewController);
router.get('/project/:project_id', getProjectReviewsController);
router.get('/user/:user_id', getUserReviewsController);

export default router;
