// server/routes/authRoutes.js
import express from 'express';
import { handleRegister, handleLogin } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', handleRegister);
router.post('/login', handleLogin);

export default router;