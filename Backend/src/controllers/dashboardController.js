import { Subject } from '../models/Subject.js';
import { StudyDocument } from '../models/Document.js';
import { ChatSession } from '../models/ChatSession.js';
import { QuizAttempt } from '../models/QuizModels.js';
import { asyncHandler, sendSuccess } from '../utils/apiResponse.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [totalSubjects, totalDocuments, completedDocs, recentDocuments, totalChatSessions, attempts] =
    await Promise.all([
      Subject.countDocuments({ userId }),
      StudyDocument.countDocuments({ userId }),
      StudyDocument.countDocuments({ userId, processingStatus: 'Completed' }),
      StudyDocument.find({ userId })
        .populate('subjectId', 'name code')
        .sort({ createdAt: -1 })
        .limit(5),
      ChatSession.countDocuments({ userId }),
      QuizAttempt.find({ userId })
    ]);

  const totalQuizzes = attempts.length;
  const averageQuizScore =
    totalQuizzes > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.accuracyPct, 0) / totalQuizzes)
      : 0;
  const learningProgress =
    totalDocuments > 0 ? Math.round((completedDocs / totalDocuments) * 100) : 0;

  sendSuccess(res, 200, 'Dashboard stats fetched', {
    metrics: {
      totalDocuments,
      totalSubjects,
      totalQuizzes,
      averageQuizScore,
      totalChatSessions,
      learningProgress
    },
    recentActivity: recentDocuments.map((doc) => ({
      id: doc._id,
      title: doc.originalFileName,
      subject: doc.subjectId?.name || 'General',
      status: doc.processingStatus,
      uploadedAt: doc.createdAt
    }))
  });
});