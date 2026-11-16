import mongoose from 'mongoose';

const pyqReportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    unitDistribution: [{ unit: String, questionCount: Number, weightagePct: Number }],
    topicFrequency: [
      {
        topic: String,
        unit: String,
        frequency: Number,
        yearsAppeared: [String],
        hasNotes: Boolean
      }
    ],
    extractedQuestions: [
      {
        questionText: String,
        unit: String,
        topic: String,
        sourcePaper: String,
        page: Number
      }
    ],
    missingFromNotes: [String],
    unaskedSyllabusTopics: [String]
  },
  { timestamps: true }
);

export const PyqReport = mongoose.model('PyqReport', pyqReportSchema);