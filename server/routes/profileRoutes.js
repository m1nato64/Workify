import express from 'express';
import {
  getProfileController,
  updateProfileController,
  deleteProfileController,
  updateUserAvatarController,
  changePasswordController,
  updateUserNameController,
} from '../controllers/profileController.js';

import upload from '../middlewares/upload.js';

const router = express.Router();

router.get('/:id', getProfileController);
router.put('/:id', updateProfileController);
router.delete('/:id', deleteProfileController);
router.put('/:id/update-avatar', upload.single('avatar'), updateUserAvatarController);
router.put('/:id/change-password', changePasswordController);
router.put('/:id/update-name', updateUserNameController);

export default router;
