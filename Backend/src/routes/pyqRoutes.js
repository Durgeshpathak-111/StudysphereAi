import express from 'express';
import { runPyqAnalysis, getPyqReport, updateQuestionMapping } from '../controllers/pyqController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);
router.post('/analyze', runPyqAnalysis);
router.get('/:subjectId', getPyqReport);
router.put('/mapping/:reportId', updateQuestionMapping);
export default router;