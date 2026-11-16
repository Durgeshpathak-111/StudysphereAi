import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import { StudyDocument } from '../models/Document.js';
import { Subject } from '../models/Subject.js';
import { ApiError, asyncHandler, sendSuccess } from '../utils/apiResponse.js';

const triggerAiIngestion = async (doc, absolutePath) => {
  try {
    await StudyDocument.findByIdAndUpdate(doc._id, { processingStatus: 'Processing' });

    const form = new FormData();
    form.append('file', fs.createReadStream(absolutePath), doc.originalFileName);
    form.append('user_id', String(doc.userId));
    form.append('document_id', String(doc._id));
    form.append('subject_id', String(doc.subjectId));
    form.append('document_name', doc.originalFileName);

    const { data } = await axios.post(`${process.env.AI_SERVICE_URL}/ai/process-document`, form, {
      headers: form.getHeaders(),
      timeout: 120000
    });

    await StudyDocument.findByIdAndUpdate(doc._id, {
      processingStatus: 'Completed',
      pageCount: data.page_count || 0,
      chunkCount: data.chunk_count || 0,
      extractedTopics: data.topics || [],
      extractedKeywords: data.keywords || []
    });
  } catch (err) {
    await StudyDocument.findByIdAndUpdate(doc._id, {
      processingStatus: 'Failed',
      processingError: err.response?.data?.detail || err.message
    });
  }
};

export const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Please attach a PDF, DOCX, or TXT file.');
  }

  const { subjectId, unitTitle } = req.body;
  if (!subjectId) {
    fs.unlinkSync(req.file.path);
    throw new ApiError(400, 'Subject selection is required.');
  }

  const subject = await Subject.findOne({ _id: subjectId, userId: req.user._id });
  if (!subject) {
    fs.unlinkSync(req.file.path);
    throw new ApiError(404, 'Selected subject does not exist.');
  }

  const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');
  const doc = await StudyDocument.create({
    userId: req.user._id,
    subjectId: subject._id,
    unitTitle: unitTitle || 'General',
    fileName: req.file.filename,
    originalFileName: req.file.originalname,
    fileType: ext,
    mimeType: req.file.mimetype,
    fileSize: req.file.size,
    storagePath: req.file.path,
    processingStatus: 'Pending'
  });

  triggerAiIngestion(doc, req.file.path);

  const safeDoc = doc.toObject();
  delete safeDoc.storagePath;

  sendSuccess(res, 201, 'Document uploaded and queued for AI indexing', { document: safeDoc });
});

export const getDocuments = asyncHandler(async (req, res) => {
  const filter = { userId: req.user._id };
  if (req.query.subjectId) filter.subjectId = req.query.subjectId;
  if (req.query.status) filter.processingStatus = req.query.status;
  if (req.query.search) {
    filter.$or = [
      { originalFileName: { $regex: req.query.search, $options: 'i' } },
      { extractedTopics: { $regex: req.query.search, $options: 'i' } },
      { extractedKeywords: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const documents = await StudyDocument.find(filter)
    .populate('subjectId', 'name code semester')
    .sort({ createdAt: -1 });

  sendSuccess(res, 200, 'Documents fetched', { documents });
});

export const getDocumentById = asyncHandler(async (req, res) => {
  const document = await StudyDocument.findOne({
    _id: req.params.id,
    userId: req.user._id
  }).populate('subjectId', 'name code semester');

  if (!document) throw new ApiError(404, 'Document not found.');
  sendSuccess(res, 200, 'Document fetched', { document });
});

export const downloadDocument = asyncHandler(async (req, res) => {
  const document = await StudyDocument.findOne({
    _id: req.params.id,
    userId: req.user._id
  }).select('+storagePath');

  if (!document) throw new ApiError(404, 'Document not found.');

  const resolvedPath = path.resolve(document.storagePath);
  const uploadsRoot = path.resolve('uploads');
  if (!resolvedPath.startsWith(uploadsRoot) || !fs.existsSync(resolvedPath)) {
    throw new ApiError(404, 'File missing on server storage.');
  }

  res.download(resolvedPath, document.originalFileName);
});

export const deleteDocument = asyncHandler(async (req, res) => {
  const document = await StudyDocument.findOne({
    _id: req.params.id,
    userId: req.user._id
  }).select('+storagePath');

  if (!document) throw new ApiError(404, 'Document not found.');

  try {
    await axios.delete(
      `${process.env.AI_SERVICE_URL}/ai/documents/${document._id}?user_id=${req.user._id}`
    );
  } catch (e) {
    console.warn('ChromaDB vector cleanup warning:', e.message);
  }

  if (document.storagePath && fs.existsSync(document.storagePath)) {
    fs.unlinkSync(document.storagePath);
  }

  await document.deleteOne();
  sendSuccess(res, 200, 'Document and vector embeddings deleted');
});