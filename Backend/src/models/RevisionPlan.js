import mongoose from 'mongoose';

const revisionPlanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subjectName: { type: String, required: true },
    dailyMinutes: { type: Number, default: 60 },
    examDate: { type: String, default: '' },
    disclaimer: { type: String, default: '' },
    dailyTasks: [
      {
        day: String,
        topic: String,
        durationMins: Number,
        action: String,
        completed: { type: Boolean, default: false }
      }
    ],
    flashcards: [
      {
        topic: String,
        front: String,
        back: String,
        revised: { type: Boolean, default: false }
      }
    ]
  },
  { timestamps: true }
);

export const RevisionPlan = mongoose.model('RevisionPlan', revisionPlanSchema);