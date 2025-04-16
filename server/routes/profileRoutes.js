// routes/profileRoutes.js
import express from 'express';
import { getProfileController, updateProfileController, deleteProfileController } from '../controllers/profileController.js';

const router = express.Router();

// Получение данных пользователя по id
router.get('/:id', getProfileController);

// Обновление данных пользователя
router.put('/:id', updateProfileController);

// Удаление аккаунта пользователя
router.delete('/:id', deleteProfileController);

export default router;
