// server/controllers/authController.js
import { registerUser, loginUser } from '../models/authModel.js';

// Обработка запроса на регистрацию
export async function handleRegister(req, res) {
    const { name, password, role, skills } = req.body;

    try {
        const user = await registerUser(name, password, role, skills);
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка регистрации', details: err.message });
    }
}

// Обработка запроса на вход
export async function handleLogin(req, res) {
    const { name, password } = req.body;
  
    try {
      const result = await loginUser(name, password);
      res.status(200).json(result);
    } catch (err) {
      console.error(err);
      res.status(401).json({ error: 'Ошибка авторизации', details: err.message });
    }
  }
