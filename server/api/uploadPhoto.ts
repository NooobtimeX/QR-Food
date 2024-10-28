// server/api/uploadPhoto.ts

import multer from 'multer';
import { defineEventHandler } from 'h3';
import path from 'path';
import fs from 'fs';

// Configure Multer storage to save files to /app/public/photos in Docker
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = '/app/public/photos';
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

export default defineEventHandler(async (event) => {
  return new Promise((resolve, reject) => {
    upload.single('file')(event.req as any, event.res as any, (err) => {
      if (err) {
        reject({ statusCode: 500, body: { message: 'Upload failed' } });
      } else {
        const photoUrl = `/photos/${(event.req as any).file.filename}`;
        resolve({ statusCode: 200, body: { message: 'Upload successful', photoUrl } });
      }
    });
  });
});
