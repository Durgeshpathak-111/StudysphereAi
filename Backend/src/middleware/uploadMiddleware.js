import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { ApiError } from '../utils/apiResponse.js';

const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const ALLOWED_TYPES = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'text/plain': '.txt'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userFolder = path.join(uploadDir, String(req.user._id));
    fs.mkdirSync(userFolder, { recursive: true });
    cb(null, userFolder);
  },
  filename: (req, file, cb) => {
    const ext = ALLOWED_TYPES[file.mimetype] || path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}_${crypto.randomBytes(12).toString('hex')}${ext}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const validExt = ['.pdf', '.docx', '.txt'].includes(ext);
  const validMime = Boolean(ALLOWED_TYPES[file.mimetype]);

  if (!validExt || !validMime) {
    return cb(new ApiError(400, 'Invalid file format. Only PDF, DOCX, and TXT files are allowed.'), false);
  }
  cb(null, true);
};

export const uploadDocumentMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }
}).single('document');


