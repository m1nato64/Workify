import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js'; 

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'workify_files', 
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'txt'],
  },
});

const upload = multer({ storage });

export default upload;