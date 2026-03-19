import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';
import { sendSuccess, sendError } from '../utils/response.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

// Use memory storage to avoid writing to disk
const storage = multer.memoryStorage();

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
      // Upload directly to Cloudinary using a stream
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'restaurant-pos',
          public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary Upload Error:', error);
            return sendError(res, 'Failed to upload to Cloudinary.', 500);
          }
          
          return sendSuccess(res, { url: result.secure_url }, 'File uploaded to Cloudinary successfully.', 201);
        }
      );

      uploadStream.end(req.file.buffer);
    } catch (e) {
      console.error('Upload Process Error:', e);
      next(e);
    }
  });
};
