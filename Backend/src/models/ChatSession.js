import mongoose from 'mongoose';

const citationSchema = new mongoose.Schema(
  {
    documentId: { type: String },
    documentName: { type: String },
    pageNumber: { type: Number },
    passage: { type: String }
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  mode: { type: String, enum: ['english', 'hinglish', 'exam'], default: 'english' },
  citations: [citationSchema],
  createdAt: { type: Date, default: Date.now }
});

const chatSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'New Study Conversation' },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null },
    documentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudyDocument' }],
    messages: [messageSchema]
  },
  { timestamps: true }
);

export const ChatSession = mongoose.model('ChatSession', chatSessionSchema);