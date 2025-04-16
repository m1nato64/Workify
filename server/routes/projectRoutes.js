// routes/projectRoutes.js
import express from 'express';
import { createProjectController, getAllProjectsController, getProjectsByUserIdController, getProjectByIdController } from '../controllers/projectController.js';

const router = express.Router();

// Создание нового проекта
router.post('/', createProjectController);
router.get('/', getAllProjectsController);
router.get('/user/:id', getProjectsByUserIdController);
router.get('/:id', getProjectByIdController);

export default router;
