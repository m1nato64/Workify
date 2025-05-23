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
} from '../controllers/projectController.js';

const router = express.Router();

router.post('/', upload.single('media'), createProjectController);
router.get('/', getAllProjectsController);
router.get('/user/:id', getProjectsByUserIdController);
router.get('/:id', getProjectByIdController);
router.put('/bids-toggle/:projectId', toggleProjectBidsController);
router.delete('/:projectId', deleteProjectController);
router.put('/update-project/:projectId', upload.single('media'), updateProjectController);

export default router;
