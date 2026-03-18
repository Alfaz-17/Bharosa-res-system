import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { sendSuccess, sendError } from '../utils/response.js';

// Ensure the local uploads directory exists
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.restaurantId}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and WebP are allowed.'));
  }
};

export const uploadMw = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
}).single('file');

export const uploadMedia = (req, res, next) => {
  uploadMw(req, res, (err) => {
    if (err) {
      return sendError(res, err.message, 400);
    }
    if (!req.file) {
      return sendError(res, 'No file uploaded.', 400);
    }

    try {
      // Return absolute local URL assuming the app hosts 'public' statically
      const host = req.get('host');
      const protocol = req.protocol;
      const url = `${protocol}://${host}/uploads/${req.file.filename}`;
      
      return sendSuccess(res, { url }, 'File uploaded successfully.', 201);
    } catch (e) {
      next(e);
    }
  });
};
