import express from 'express';
import upload from '../middlewares/upload.js';  
import {
  getProfileController,
  updateProfileController,
  deleteProfileController,
  updateUserAvatarController,
  changePasswordController,
  updateUserNameController,
  updateUserSkillsController,
  getAllUsersController,
  getShowTutorialSettingController,
  updateShowTutorialSettingController,
  getFreelancersController,
  getUserRatingController,
  updateUserRatingController,
  getAdminsController,
} from '../controllers/profileController.js';

const router = express.Router();

router.get('/all', getAllUsersController);
router.get('/admins', getAdminsController);
router.get('/freelancers', getFreelancersController);
router.get('/:id', getProfileController);
router.put('/:id', updateProfileController);
router.get('/:id/tutorial-setting', getShowTutorialSettingController);
router.put('/:id/tutorial-setting', updateShowTutorialSettingController);
router.post('/:id/delete', deleteProfileController);
router.put('/:id/update-avatar', upload.single('avatar'), updateUserAvatarController);
router.put('/:id/change-password', changePasswordController);
router.put('/:id/update-name', updateUserNameController);
router.put('/:id/update-skills', updateUserSkillsController);
router.get('/:id/rating', getUserRatingController);
router.put('/:id/rating', updateUserRatingController);

export default router;
