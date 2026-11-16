import express from 'express';
import { generateAndSaveNote, getNotes, updateNote, deleteNote } from '../controllers/notesController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);
router.route('/').get(getNotes).post(generateAndSaveNote);
router.route('/:id').put(updateNote).delete(deleteNote);
export default router;