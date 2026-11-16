import mongoose from 'mongoose';

const questionItemSchema = new mongoose.Schema({
  question: { type: String, required: true },
  questionType: { type: String, default: 'MCQ' },
  options: [{ type: String }],
  correctAnswer: { type: String, required: true },
  explanation: { type: String, default: '' },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  topic: { type: String, default: 'General' },
  sourceRef: { type: String, default: '' }
});

const quizSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null },
    title: { type: String, required: true },
    difficulty: { type: String, default: 'Medium' },
    questionType: { type: String, default: 'MCQ' },
    durationMinutes: { type: Number, default: 10 },
    isAiGenerated: { type: Boolean, default: true },
    questions: [questionItemSchema]
  },
  { timestamps: true }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    accuracyPct: { type: Number, required: true },
    timeSpentSeconds: { type: Number, default: 0 },
    answers: [
      {
        questionId: String,
        topic: String,
        selectedAnswer: String,
        correctAnswer: String,
        isCorrect: Boolean
      }
    ]
  },
  { timestamps: true }
);

export const Quiz = mongoose.model('Quiz', quizSchema);
export const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);