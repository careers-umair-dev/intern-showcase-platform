import multer from 'multer'; import path from 'path'; import crypto from 'crypto'; import { fileURLToPath } from 'url'; import fs from 'fs';
export const uploadDir = process.env.VERCEL
  ? path.join('/tmp', 'intern-showcase-uploads')
  : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../uploads');
fs.mkdirSync(uploadDir, { recursive: true });
export const upload = multer({ storage: multer.diskStorage({ destination: uploadDir, filename: (q, f, cb) => cb(null, crypto.randomUUID() + path.extname(f.originalname).toLowerCase()) }),
  limits: { fileSize: 3 * 1024 * 1024 }, fileFilter: (q, f, cb) => {
    if (!/^image\/(png|jpe?g|webp|gif)$/.test(f.mimetype)) return cb(Object.assign(new Error('Only PNG, JPG, WEBP or GIF images'), { status: 400 }));
    cb(null, true);
  } });
