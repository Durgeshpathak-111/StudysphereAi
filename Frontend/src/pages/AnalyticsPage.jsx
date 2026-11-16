import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [dailyMinutes, setDailyMinutes] = useState(60);
  const [examDate, setExamDate] = useState('');
  const [generating, setGenerating] = useState(false);
  const [flippedIdx, setFlippedIdx] = useState(null);

  const loadAnalytics = async () => {
    const res = await api.get('/analytics/gaps');
    setData(res.data.data);
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const weak = data.topicStats.filter((t) => t.accuracy < 75);
      await api.post('/analytics/revision-plan', {
        subjectName: 'Semester Revision',
        weakTopics: weak,
        dailyMinutes,
        examDate
      });
      loadAnalytics();
    } finally {
      setGenerating(false);
    }
  };

  const toggleTask = async (planId, taskId) => {
    await api.patch(`/analytics/revision-plan/${planId}/tasks/${taskId}`);
    loadAnalytics();
  };

  if (!data) return <p className="text-sm opacity-60">Loading performance analytics...</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-current/10">
          <p className="text-xs opacity-60">Measured Quiz Accuracy</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{data.overallAccuracy}%</p>
        </div>
        <div className="p-5 rounded-xl border border-current/10">
          <p className="text-xs opacity-60">Total Quizzes Completed</p>
          <p className="text-3xl font-bold mt-1">{data.totalAttempts}</p>
        </div>
        <div className="p-5 rounded-xl border border-current/10">
          <p className="text-xs opacity-60">Weak / Revision Topics</p>
          <p className="text-3xl font-bold text-amber-500 mt-1">
            {data.topicStats.filter((t) => t.accuracy < 75).length}
          </p>
        </div>
      </div>

      <div className="p-5 rounded-xl border border-current/10 space-y-3">
        <h2 className="font-bold">Topic-Wise Quiz Performance</h2>
        {data.topicStats.length === 0 ? (
          <p className="text-xs opacity-60">Complete at least one quiz to measure topic strengths and gaps.</p>
        ) : (
          data.topicStats.map((t) => (
            <div key={t.topic} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{t.topic} ({t.status})</span>
                <span className="font-semibold">{t.accuracy}% ({t.correct}/{t.total})</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-current/10">
                <div
                  className={`h-full rounded-full ${t.accuracy < 75 ? 'bg-amber-500' : 'bg-emerald-600'}`}
                  style={{ width: `${t.accuracy}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleGeneratePlan} className="p-5 rounded-xl border border-current/10 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs opacity-70 mb-1">Daily Study Time (mins)</label>
          <input
            type="number"
            min={15}
            max={480}
            value={dailyMinutes}
            onChange={(e) => setDailyMinutes(Number(e.target.value))}
            className="px-3 py-2 rounded-lg border border-current/20 bg-transparent text-sm"
          />
        </div>
        <div>
          <label className="block text-xs opacity-70 mb-1">Target Exam Date</label>
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-current/20 bg-transparent text-sm"
          />
        </div>
        <button disabled={generating} className="px-5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold">
          {generating ? 'Building Plan...' : 'Generate Smart Revision Plan & Flashcards'}
        </button>
      </form>

      {data.revisionPlan && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl border border-current/10 space-y-3">
            <h3 className="font-bold">Daily Revision Checklist</h3>
            <p className="text-[11px] opacity-60">{data.revisionPlan.disclaimer}</p>
            {data.revisionPlan.dailyTasks?.map((task) => (
              <label key={task._id} className="flex items-start gap-3 p-3 rounded-lg border border-current/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(data.revisionPlan._id, task._id)}
                  className="mt-1"
                />
                <div className={task.completed ? 'line-through opacity-50' : ''}>
                  <p className="text-sm font-semibold">{task.day}: {task.topic} ({task.durationMins} mins)</p>
                  <p className="text-xs opacity-75">{task.action}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="p-5 rounded-xl border border-current/10 space-y-3">
            <h3 className="font-bold">Revision Flashcards (Click to Flip)</h3>
            {data.revisionPlan.flashcards?.map((card, idx) => (
              <div
                key={idx}
                onClick={() => setFlippedIdx(flippedIdx === idx ? null : idx)}
                className="p-4 rounded-xl border border-emerald-600/30 bg-emerald-600/5 cursor-pointer space-y-1"
              >
                <span className="text-[11px] font-bold uppercase text-emerald-600">{card.topic}</span>
                <p className="text-sm font-medium">
                  {flippedIdx === idx ? `Answer: ${card.back}` : `Q: ${card.front}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}