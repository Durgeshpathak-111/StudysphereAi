import express from 'express';
import { getKnowledgeGaps, createRevisionPlan, toggleRevisionTask } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);
router.get('/gaps', getKnowledgeGaps);
router.post('/revision-plan', createRevisionPlan);
router.patch('/revision-plan/:planId/tasks/:taskId', toggleRevisionTask);
export default router;