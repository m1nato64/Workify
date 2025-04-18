//server/routes/bidRoutes.js
import express from 'express';
import {
  createBidController,
  getBidsForProjectController,
  getBidsForFreelancerController,
  updateBidStatusController,
  checkBidExistsController
} from '../controllers/bidController.js';

const router = express.Router();

router.post('/', createBidController);
router.get('/project/:project_id', getBidsForProjectController);
router.get('/freelancer/:freelancer_id', getBidsForFreelancerController);  
router.put('/status/:bid_id', updateBidStatusController);
router.get('/check', checkBidExistsController);

export default router;
