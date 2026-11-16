import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    unitTitle: { type: String, trim: true, default: 'General' },
    fileName: { type: String, required: true },
    originalFileName: { type: String, required: true },
    fileType: { type: String, enum: ['pdf', 'docx', 'txt'], required: true },
    mimeType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    storagePath: { type: String, required: true, select: false },
    documentStatus: { type: String, enum: ['active', 'archived'], default: 'active' },
    processingStatus: {
      type: String,
      enum: ['Pending', 'Processing', 'Completed', 'Failed'],
      default: 'Pending'
    },
    processingError: { type: String, default: '' },
    pageCount: { type: Number, default: 0 },
    chunkCount: { type: Number, default: 0 },
    extractedTopics: [{ type: String }],
    extractedKeywords: [{ type: String }]
  },
  { timestamps: true }
);

export const StudyDocument = mongoose.model('StudyDocument', documentSchema);