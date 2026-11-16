import express from 'express';
import {
  askStudyChatbot,
  getChatHistory,
  getChatSession,
  deleteChatSession
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);
router.post('/', askStudyChatbot);
router.get('/history', getChatHistory);
router.get('/:id', getChatSession);
router.delete('/:id', deleteChatSession);
export default router;