// routes/chatRoutes.js
import express from 'express';
import { 
    findOrCreateChatController,
    getChatUsersForUserController,
    getChatByIdController,
 } from '../controllers/chatController.js';

const router = express.Router();

router.post('/find-or-create', findOrCreateChatController);
router.get('/chatusers/:user_id', getChatUsersForUserController);
router.get('/:chatId', getChatByIdController);

export default router;