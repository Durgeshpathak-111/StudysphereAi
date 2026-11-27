// import axios from 'axios';
// import { ChatSession } from '../models/ChatSession.js';
// import { StudyDocument } from '../models/Document.js';
// import { ApiError, asyncHandler, sendSuccess } from '../utils/apiResponse.js';

// export const askStudyChatbot = asyncHandler(async (req, res) => {
//   const { sessionId, question, subjectId, documentIds = [], mode = 'english' } = req.body;

//   if (!question || !question.trim()) {
//     throw new ApiError(400, 'Question cannot be empty.');
//   }

//   let validDocIds = [];
//   if (Array.isArray(documentIds) && documentIds.length > 0) {
//     const ownedDocs = await StudyDocument.find({
//       _id: { $in: documentIds },
//       userId: req.user._id
//     }).select('_id');
//     validDocIds = ownedDocs.map((d) => String(d._id));
//   }

//   let session;
//   if (sessionId) {
//     session = await ChatSession.findOne({ _id: sessionId, userId: req.user._id });
//     if (!session) throw new ApiError(404, 'Chat session not found.');
//   } else {
//     session = await ChatSession.create({
//       userId: req.user._id,
//       title: question.trim().slice(0, 60),
//       subjectId: subjectId || null,
//       documentIds: validDocIds,
//       messages: []
//     });
//   }

//   session.messages.push({ role: 'user', content: question.trim(), mode });

//   const { data: ragResponse } = await axios.post(
//     `${process.env.AI_SERVICE_URL}/ai/rag/chat`,
//     {
//       user_id: String(req.user._id),
//       question: question.trim(),
//       subject_id: subjectId ? String(subjectId) : null,
//       document_ids: validDocIds,
//       mode,
//       history: session.messages.slice(-6).map((m) => ({ role: m.role, content: m.content }))
//     },
//     { timeout: 60000 }
//   );

//   const assistantMsg = {
//     role: 'assistant',
//     content: ragResponse.answer,
//     mode,
//     citations: (ragResponse.citations || []).map((c) => ({
//       documentId: c.document_id,
//       documentName: c.document_name,
//       pageNumber: c.page_number,
//       passage: c.passage
//     }))
//   };

//   session.messages.push(assistantMsg);
//   await session.save();

//   sendSuccess(res, 200, 'Response generated', {
//     sessionId: session._id,
//     title: session.title,
//     message: session.messages[session.messages.length - 1]
//   });
// });

// export const getChatHistory = asyncHandler(async (req, res) => {
//   const sessions = await ChatSession.find({ userId: req.user._id })
//     .select('title subjectId updatedAt createdAt')
//     .sort({ updatedAt: -1 });
//   sendSuccess(res, 200, 'Chat history fetched', { sessions });
// });

// export const getChatSession = asyncHandler(async (req, res) => {
//   const session = await ChatSession.findOne({ _id: req.params.id, userId: req.user._id });
//   if (!session) throw new ApiError(404, 'Chat session not found.');
//   sendSuccess(res, 200, 'Chat session fetched', { session });
// });

// export const deleteChatSession = asyncHandler(async (req, res) => {
//   const deleted = await ChatSession.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
//   if (!deleted) throw new ApiError(404, 'Chat session not found.');
//   sendSuccess(res, 200, 'Chat session deleted');
// });


import axios from 'axios';
import { ChatSession } from '../models/ChatSession.js';
import { StudyDocument } from '../models/Document.js';
import { ApiError, asyncHandler, sendSuccess } from '../utils/apiResponse.js';

export const askStudyChatbot = asyncHandler(async (req, res) => {
  const {
    sessionId,
    question,
    subjectId,
    documentIds = [],
    mode = 'english',
    allowGeneralAi = true
  } = req.body;

  if (!question || !question.trim()) {
    throw new ApiError(400, 'Question cannot be empty.');
  }

  let validDocIds = [];
  if (Array.isArray(documentIds) && documentIds.length > 0) {
    const ownedDocs = await StudyDocument.find({
      _id: { $in: documentIds },
      userId: req.user._id
    }).select('_id');
    validDocIds = ownedDocs.map((d) => String(d._id));
  }

  let session;
  if (sessionId) {
    session = await ChatSession.findOne({ _id: sessionId, userId: req.user._id });
    if (!session) throw new ApiError(404, 'Chat session not found.');
  } else {
    session = await ChatSession.create({
      userId: req.user._id,
      title: question.trim().slice(0, 60),
      subjectId: subjectId || null,
      documentIds: validDocIds,
      messages: []
    });
  }

  session.messages.push({ role: 'user', content: question.trim(), mode });

  const { data: ragResponse } = await axios.post(
    `${process.env.AI_SERVICE_URL}/ai/rag/chat`,
    {
      user_id: String(req.user._id),
      question: question.trim(),
      subject_id: subjectId ? String(subjectId) : null,
      document_ids: validDocIds,
      mode,
      allow_general_ai: Boolean(allowGeneralAi),
      history: session.messages.slice(-6).map((m) => ({ role: m.role, content: m.content }))
    },
    { timeout: 60000 }
  );

  const assistantMsg = {
    role: 'assistant',
    content: ragResponse.answer,
    mode,
    sourceType: ragResponse.source_type || (ragResponse.citations?.length ? 'pdf_rag' : 'general_ai'),
    citations: (ragResponse.citations || []).map((c) => ({
      documentId: c.document_id,
      documentName: c.document_name,
      pageNumber: c.page_number,
      passage: c.passage
    }))
  };

  session.messages.push(assistantMsg);
  await session.save();

  const savedMessage = session.messages[session.messages.length - 1];

  sendSuccess(res, 200, 'Response generated', {
    sessionId: session._id,
    title: session.title,
    message: {
      ...savedMessage.toObject(),
      sourceType: assistantMsg.sourceType
    }
  });
});

export const getChatHistory = asyncHandler(async (req, res) => {
  const sessions = await ChatSession.find({ userId: req.user._id })
    .select('title subjectId updatedAt createdAt')
    .sort({ updatedAt: -1 });
  sendSuccess(res, 200, 'Chat history fetched', { sessions });
});

export const getChatSession = asyncHandler(async (req, res) => {
  const session = await ChatSession.findOne({ _id: req.params.id, userId: req.user._id });
  if (!session) throw new ApiError(404, 'Chat session not found.');
  sendSuccess(res, 200, 'Chat session fetched', { session });
});

export const deleteChatSession = asyncHandler(async (req, res) => {
  const deleted = await ChatSession.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!deleted) throw new ApiError(404, 'Chat session not found.');
  sendSuccess(res, 200, 'Chat session deleted');
});