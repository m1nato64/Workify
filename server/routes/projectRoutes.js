import express from 'express';
import upload from '../middlewares/upload.js';  
import { 
  createProjectController, 
  getAllProjectsController, 
  getProjectsByUserIdController, 
  getProjectByIdController,
  toggleProjectBidsController, 
  deleteProjectController,
  updateProjectController, 
  getFilteredProjectsController,
  viewProjectController,
  getProjectViewsController,
} from '../controllers/projectController.js';

const router = express.Router();

router.post('/', upload.single('media'), createProjectController);
router.get('/', getAllProjectsController);
router.get('/search', getFilteredProjectsController);
router.get('/user/:id', getProjectsByUserIdController);
router.get('/:id', getProjectByIdController);
router.put('/bids-toggle/:projectId', toggleProjectBidsController);
router.delete('/:projectId', deleteProjectController);
router.put('/update-project/:projectId', upload.single('media'), updateProjectController);
router.post('/:id/create-view', viewProjectController);
router.get('/:id/get-view', getProjectViewsController);

export default router;
