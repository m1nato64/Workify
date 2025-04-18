// routes/profileRoutes.js
import express from 'express';
import { getProfileController, updateProfileController, deleteProfileController } from '../controllers/profileController.js';

const router = express.Router();

router.get('/:id', getProfileController);
router.put('/:id', updateProfileController);
router.delete('/:id', deleteProfileController);

export default router;
