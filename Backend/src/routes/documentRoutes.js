import express from 'express';
import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  downloadDocument,
  deleteDocument
} from '../controllers/documentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadDocumentMiddleware } from '../middleware/uploadMiddleware.js';

const router = express.Router();
router.use(protect);
router.post('/upload', uploadDocumentMiddleware, uploadDocument);
router.get('/', getDocuments);
router.get('/:id', getDocumentById);
router.get('/:id/download', downloadDocument);
router.delete('/:id', deleteDocument);
export default router;