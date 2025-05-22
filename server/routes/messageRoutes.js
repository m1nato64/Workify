// routes/messageRoutes.js
import express from 'express';
import { 
    sendMessageController, 
    getMessagesBetweenUsersController, 
    getMessagesForUserController,
    
 } from '../controllers/messageController.js';

const router = express.Router();

router.post('/', sendMessageController);
router.get('/:user1/:user2', getMessagesBetweenUsersController);
router.get('/:user_id', getMessagesForUserController);

export default router;
