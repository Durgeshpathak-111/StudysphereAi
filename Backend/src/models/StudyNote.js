import mongoose from 'mongoose';

const studyNoteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null },
    title: { type: String, required: true, trim: true },
    noteType: { type: String, default: 'detailed' },
    language: { type: String, enum: ['english', 'hindi', 'hinglish'], default: 'english' },
    suggestedSubject: { type: String, default: '' },
    suggestedUnit: { type: String, default: '' },
    suggestedTopic: { type: String, default: '' },
    suggestedSubtopics: [{ type: String }],
    keywords: [{ type: String }],
    contentMarkdown: { type: String, required: true },
    sources: [{ type: String }]
  },
  { timestamps: true }
);

export const StudyNote = mongoose.model('StudyNote', studyNoteSchema);