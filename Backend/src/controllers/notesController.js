import axios from 'axios';
import { StudyNote } from '../models/StudyNote.js';
import { Subject } from '../models/Subject.js';
import { ApiError, asyncHandler, sendSuccess } from '../utils/apiResponse.js';

export const generateAndSaveNote = asyncHandler(async (req, res) => {
  const { subjectId, documentIds = [], topic, noteType = 'detailed', language = 'english' } = req.body;
  const subject = subjectId ? await Subject.findOne({ _id: subjectId, userId: req.user._id }) : null;

  const { data } = await axios.post(
    `${process.env.AI_SERVICE_URL}/ai/generate/notes`,
    {
      user_id: String(req.user._id),
      subject_name: subject?.name || 'General Studies',
      document_ids: documentIds,
      topic,
      note_type: noteType,
      language
    },
    { timeout: 90000 }
  );

  const note = await StudyNote.create({
    userId: req.user._id,
    subjectId: subject?._id || null,
    title: data.title,
    noteType,
    language,
    suggestedSubject: data.suggestedSubject,
    suggestedUnit: data.suggestedUnit,
    suggestedTopic: data.suggestedTopic,
    suggestedSubtopics: data.suggestedSubtopics || [],
    keywords: data.keywords || [],
    contentMarkdown: data.contentMarkdown,
    sources: data.sources || []
  });

  sendSuccess(res, 201, 'Smart notes generated and saved', { note });
});

export const getNotes = asyncHandler(async (req, res) => {
  const filter = { userId: req.user._id };
  if (req.query.search) {
    filter.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { suggestedTopic: { $regex: req.query.search, $options: 'i' } },
      { contentMarkdown: { $regex: req.query.search, $options: 'i' } }
    ];
  }
  const notes = await StudyNote.find(filter).sort({ createdAt: -1 });
  sendSuccess(res, 200, 'Notes fetched', { notes });
});

export const updateNote = asyncHandler(async (req, res) => {
  const note = await StudyNote.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    req.body,
    { new: true }
  );
  if (!note) throw new ApiError(404, 'Note not found');
  sendSuccess(res, 200, 'Note updated', { note });
});

export const deleteNote = asyncHandler(async (req, res) => {
  const deleted = await StudyNote.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!deleted) throw new ApiError(404, 'Note not found');
  sendSuccess(res, 200, 'Note deleted');
});