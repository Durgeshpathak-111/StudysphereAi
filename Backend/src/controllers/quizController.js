import axios from 'axios';
import { Quiz, QuizAttempt } from '../models/QuizModels.js';
import { Subject } from '../models/Subject.js';
import { ApiError, asyncHandler, sendSuccess } from '../utils/apiResponse.js';

export const generateQuiz = asyncHandler(async (req, res) => {
  const {
    subjectId,
    documentIds = [],
    topic,
    numQuestions = 5,
    difficulty = 'Medium',
    questionType = 'MCQ'
  } = req.body;

  const subject = subjectId ? await Subject.findOne({ _id: subjectId, userId: req.user._id }) : null;

  const { data } = await axios.post(
    `${process.env.AI_SERVICE_URL}/ai/generate/quiz`,
    {
      user_id: String(req.user._id),
      subject_name: subject?.name || 'Academic Subject',
      document_ids: documentIds,
      topic,
      num_questions: Number(numQuestions),
      difficulty,
      question_type: questionType
    },
    { timeout: 90000 }
  );

  const quiz = await Quiz.create({
    userId: req.user._id,
    subjectId: subject?._id || null,
    title: `${topic || subject?.name || 'Study'} - ${difficulty} ${questionType} Quiz`,
    difficulty,
    questionType,
    durationMinutes: Math.max(5, Number(numQuestions) * 2),
    questions: data.questions
  });

  sendSuccess(res, 201, 'Quiz generated', { quiz });
});

export const getQuizzes = asyncHandler(async (req, res) => {
  const quizzes = await Quiz.find({ userId: req.user._id }).sort({ createdAt: -1 });
  const attempts = await QuizAttempt.find({ userId: req.user._id })
    .populate('quizId', 'title difficulty')
    .sort({ createdAt: -1 })
    .limit(15);
  sendSuccess(res, 200, 'Quizzes and attempts fetched', { quizzes, attempts });
});

export const submitQuizAttempt = asyncHandler(async (req, res) => {
  const { responses = {}, timeSpentSeconds = 0 } = req.body;
  const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user._id });
  if (!quiz) throw new ApiError(404, 'Quiz not found');

  let score = 0;
  const gradedAnswers = quiz.questions.map((q) => {
    const selected = (responses[String(q._id)] || '').trim();
    const isCorrect = selected.toLowerCase() === q.correctAnswer.trim().toLowerCase();
    if (isCorrect) score += 1;

    return {
      questionId: String(q._id),
      topic: q.topic || 'General',
      selectedAnswer: selected,
      correctAnswer: q.correctAnswer,
      isCorrect
    };
  });

  const totalQuestions = quiz.questions.length;
  const accuracyPct = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  const attempt = await QuizAttempt.create({
    userId: req.user._id,
    quizId: quiz._id,
    subjectId: quiz.subjectId,
    score,
    totalQuestions,
    accuracyPct,
    timeSpentSeconds,
    answers: gradedAnswers
  });

  sendSuccess(res, 201, 'Quiz graded and recorded', { attempt, quiz });
});