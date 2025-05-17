import express from 'express';
import {
  getProfileController,
  updateProfileController,
  deleteProfileController,
  updateUserAvatarController,
  changePasswordController,
  updateUserNameController,
  updateUserSkillsController,
  getAllUsersController,

} from '../controllers/profileController.js';

import upload from '../middlewares/upload.js';

const router = express.Router();

router.get('/all', getAllUsersController);
router.get('/:id', getProfileController);
router.put('/:id', updateProfileController);
router.post('/:id/delete', deleteProfileController);
router.put('/:id/update-avatar', upload.single('avatar'), updateUserAvatarController);
router.put('/:id/change-password', changePasswordController);
router.put('/:id/update-name', updateUserNameController);
router.put('/:id/update-skills', updateUserSkillsController);

export default router;
