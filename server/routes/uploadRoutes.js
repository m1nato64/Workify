// server/routes/uploadRoutes.js
import express from 'express';
import multer from 'multer';

const router = express.Router();

// Настройка multer
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('media'), (req, res) => {
  const data = Object.fromEntries(Object.entries(req.body));
  console.log('Request Body:', data);
  console.log('Uploaded File:', req.file);

  res.json({ message: 'Upload successful' });
});

export default router;
