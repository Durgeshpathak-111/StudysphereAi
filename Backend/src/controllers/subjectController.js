import { Subject } from '../models/Subject.js';
import { StudyDocument } from '../models/Document.js';
import { ApiError, asyncHandler, sendSuccess } from '../utils/apiResponse.js';

export const createSubject = asyncHandler(async (req, res) => {
  const { name, code, semester, description, units } = req.body;
  if (!name || !semester) {
    throw new ApiError(400, 'Subject name and semester are required.');
  }

  const subject = await Subject.create({
    userId: req.user._id,
    name,
    code,
    semester: Number(semester),
    description,
    units: Array.isArray(units) ? units : []
  });

  sendSuccess(res, 201, 'Subject created', { subject });
});

export const getSubjects = asyncHandler(async (req, res) => {
  const filter = { userId: req.user._id };
  if (req.query.semester) filter.semester = Number(req.query.semester);

  const subjects = await Subject.find(filter).sort({ semester: 1, name: 1 });
  sendSuccess(res, 200, 'Subjects fetched', { subjects });
});

export const updateSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!subject) throw new ApiError(404, 'Subject not found.');
  sendSuccess(res, 200, 'Subject updated', { subject });
});

export const deleteSubject = asyncHandler(async (req, res) => {
  const docCount = await StudyDocument.countDocuments({
    subjectId: req.params.id,
    userId: req.user._id
  });
  if (docCount > 0) {
    throw new ApiError(400, 'Delete or reassign documents in this subject before deleting it.');
  }

  const deleted = await Subject.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!deleted) throw new ApiError(404, 'Subject not found.');
  sendSuccess(res, 200, 'Subject deleted');
});