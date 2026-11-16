import axios from 'axios';
import { PyqReport } from '../models/PyqReport.js';
import { Subject } from '../models/Subject.js';
import { ApiError, asyncHandler, sendSuccess } from '../utils/apiResponse.js';

export const runPyqAnalysis = asyncHandler(async (req, res) => {
  const { subjectId, syllabusDocIds = [], pyqDocIds = [], notesDocIds = [] } = req.body;
  const subject = await Subject.findOne({ _id: subjectId, userId: req.user._id });
  if (!subject) throw new ApiError(404, 'Subject not found');

  const { data } = await axios.post(
    `${process.env.AI_SERVICE_URL}/ai/generate/pyq-analysis`,
    {
      user_id: String(req.user._id),
      subject_name: subject.name,
      syllabus_doc_ids: syllabusDocIds,
      pyq_doc_ids: pyqDocIds,
      notes_doc_ids: notesDocIds
    },
    { timeout: 120000 }
  );

  const report = await PyqReport.findOneAndUpdate(
    { userId: req.user._id, subjectId: subject._id },
    { ...data, userId: req.user._id, subjectId: subject._id },
    { upsert: true, new: true }
  );

  sendSuccess(res, 200, 'Syllabus & PYQ analysis completed', { report });
});

export const getPyqReport = asyncHandler(async (req, res) => {
  const report = await PyqReport.findOne({
    userId: req.user._id,
    subjectId: req.params.subjectId
  });
  sendSuccess(res, 200, 'PYQ report fetched', { report });
});

export const updateQuestionMapping = asyncHandler(async (req, res) => {
  const { questionIndex, unit, topic } = req.body;
  const report = await PyqReport.findOne({ _id: req.params.reportId, userId: req.user._id });
  if (!report || !report.extractedQuestions[questionIndex]) {
    throw new ApiError(404, 'Question mapping not found');
  }
  report.extractedQuestions[questionIndex].unit = unit;
  report.extractedQuestions[questionIndex].topic = topic;
  await report.save();
  sendSuccess(res, 200, 'Topic mapping updated manually', { report });
});