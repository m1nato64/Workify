import express from 'express';
import {
  getUsersController,
  getUserByIdController,
  createUserController,
  updateUserController,
  deleteUserController,
  getProjectsController,
  getProjectByIdController,
  createProjectController,
  updateProjectController,
  deleteProjectController,
  getAdminLogsController,
  createAdminLogController,
  getStatisticsController,
} from '../controllers/adminController.js';


const router = express.Router();

// Users
router.get('/users', getUsersController);
router.get('/users/:id', getUserByIdController);
router.post('/users', createUserController);
router.put('/users/:id', updateUserController);
router.delete('/users/:id', deleteUserController);

// Projects
router.get('/projects', getProjectsController);
router.get('/projects/:id', getProjectByIdController);
router.post('/projects', createProjectController);
router.put('/projects/:id', updateProjectController);
router.delete('/projects/:id', deleteProjectController);

// Admin logs
router.get("/logs", getAdminLogsController);
router.post("/logs", createAdminLogController);

// Statistics
router.get('/stats', getStatisticsController);

export default router;
