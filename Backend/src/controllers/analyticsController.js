import axios from 'axios';
import { QuizAttempt } from '../models/QuizModels.js';
import { RevisionPlan } from '../models/RevisionPlan.js';
import { asyncHandler, sendSuccess } from '../utils/apiResponse.js';

export const getKnowledgeGaps = asyncHandler(async (req, res) => {
  const attempts = await QuizAttempt.find({ userId: req.user._id }).sort({ createdAt: 1 });

  const topicMap = {};
  let totalCorrect = 0;
  let totalAnswered = 0;

  attempts.forEach((att) => {
    att.answers.forEach((ans) => {
      const t = ans.topic || 'General';
      if (!topicMap[t]) topicMap[t] = { topic: t, correct: 0, total: 0 };
      topicMap[t].total += 1;
      totalAnswered += 1;
      if (ans.isCorrect) {
        topicMap[t].correct += 1;
        totalCorrect += 1;
      }
    });
  });

  const topicStats = Object.values(topicMap).map((item) => {
    const accuracy = Math.round((item.correct / item.total) * 100);
    let status = 'Insufficient Data';
    if (item.total >= 2) {
      status = accuracy >= 75 ? 'Strong' : accuracy >= 50 ? 'Needs Revision' : 'Weak';
    }
    return { ...item, accuracy, status };
  });

  const progressTimeline = attempts.map((a, idx) => ({
    attempt: `Quiz ${idx + 1}`,
    accuracy: a.accuracyPct,
    date: new Date(a.createdAt).toLocaleDateString()
  }));

  const latestPlan = await RevisionPlan.findOne({ userId: req.user._id }).sort({ createdAt: -1 });

  sendSuccess(res, 200, 'Knowledge gap analytics fetched', {
    overallAccuracy: totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0,
    totalAttempts: attempts.length,
    topicStats,
    progressTimeline,
    revisionPlan: latestPlan
  });
});

export const createRevisionPlan = asyncHandler(async (req, res) => {
  const { subjectName = 'Core Subjects', weakTopics = [], dailyMinutes = 60, examDate = '' } = req.body;

  const { data } = await axios.post(
    `${process.env.AI_SERVICE_URL}/ai/generate/revision-plan`,
    {
      subject_name: subjectName,
      weak_topics: weakTopics,
      daily_minutes: Number(dailyMinutes),
      exam_date: examDate
    },
    { timeout: 60000 }
  );

  const plan = await RevisionPlan.create({
    userId: req.user._id,
    subjectName,
    dailyMinutes,
    examDate,
    disclaimer: data.disclaimer,
    dailyTasks: data.dailyTasks || [],
    flashcards: data.flashcards || []
  });

  sendSuccess(res, 201, 'Revision plan generated', { plan });
});

export const toggleRevisionTask = asyncHandler(async (req, res) => {
  const plan = await RevisionPlan.findOne({ _id: req.params.planId, userId: req.user._id });
  if (!plan) return sendSuccess(res, 404, 'Plan not found');

  const task = plan.dailyTasks.id(req.params.taskId);
  if (task) task.completed = !task.completed;
  await plan.save();
  sendSuccess(res, 200, 'Task updated', { plan });
});