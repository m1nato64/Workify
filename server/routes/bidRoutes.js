// server/routes/bidRoutes.js
import express from 'express';
import { createBidController, getBidsForProjectController, getBidsForFreelancerController, updateBidStatusController } from '../controllers/bidController.js';

const router = express.Router();

// Создание нового отклика
router.post('/', createBidController);

// Получение откликов на проект
router.get('/project/:project_id', getBidsForProjectController);

// Получение откликов для фрилансера
router.get('/freelancer/:freelance_id', getBidsForFreelancerController);

// Обновление статуса отклика
router.put('/status/:bid_id', updateBidStatusController);

export default router;
