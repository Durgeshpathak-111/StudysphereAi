import express from 'express';
import { generateQuiz, getQuizzes, submitQuizAttempt } from '../controllers/quizController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);
router.route('/').get(getQuizzes).post(generateQuiz);
router.post('/:id/submit', submitQuizAttempt);
export default router;