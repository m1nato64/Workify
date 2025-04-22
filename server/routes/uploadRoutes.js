// server/routes/uploadRoutes.js
import express from 'express';
import upload from '../middlewares/upload.js'; // Импортируем middleware

const router = express.Router();

router.post('/', upload.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Файл не был загружен' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  console.log('Загружен файл:', req.file.filename);

  res.json({ message: 'Файл успешно загружен', url: fileUrl });
});

export default router;
