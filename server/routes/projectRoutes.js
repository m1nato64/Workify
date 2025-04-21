// routes/projectRoutes.js
import express from 'express';
import upload from '../config/multerConfig.js'; 
import { createProjectController, getAllProjectsController, 
    getProjectsByUserIdController, getProjectByIdController,
    toggleProjectBidsController, deleteProjectController,
} from '../controllers/projectController.js';

const router = express.Router();

router.post('/', upload.single('media'), createProjectController);
router.get('/', getAllProjectsController);
router.get('/user/:id', getProjectsByUserIdController);
router.get('/:id', getProjectByIdController);
router.put('/bids-toggle/:projectId', toggleProjectBidsController);
router.delete('/:projectId', deleteProjectController);

export default router;
