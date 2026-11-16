import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function QuizzesPage() {
  const [subjects, setSubjects] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [responses, setResponses] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [result, setResult] = useState(null);
  const [generating, setGenerating] = useState(false);

  const [cfg, setCfg] = useState({
    subjectId: '',
    documentId: '',
    topic: '',
    numQuestions: 5,
    difficulty: 'Medium',
    questionType: 'MCQ'
  });

  const loadData = async () => {
    const [sRes, dRes, qRes] = await Promise.all([
      api.get('/subjects'),
      api.get('/documents'),
      api.get('/quizzes')
    ]);
    setSubjects(sRes.data.data.subjects);
    setDocuments(dRes.data.data.documents.filter((d) => d.processingStatus === 'Completed'));
    setAttempts(qRes.data.data.attempts);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!activeQuiz || result || secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [activeQuiz, result, secondsLeft]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setResult(null);
    setResponses({});
    try {
      const { data } = await api.post('/quizzes', {
        subjectId: cfg.subjectId || undefined,
        documentIds: cfg.documentId ? [cfg.documentId] : [],
        topic: cfg.topic,
        numQuestions: cfg.numQuestions,
        difficulty: cfg.difficulty,
        questionType: cfg.questionType
      });
      const quiz = data.data.quiz;
      setActiveQuiz(quiz);
      setSecondsLeft(quiz.durationMinutes * 60);
    } catch (err) {
      alert(err.response?.data?.message || 'Quiz generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async () => {
    const elapsed = activeQuiz.durationMinutes * 60 - secondsLeft;
    const { data } = await api.post(`/quizzes/${activeQuiz._id}/submit`, {
      responses,
      timeSpentSeconds: Math.max(1, elapsed)
    });
    setResult(data.data.attempt);
    loadData();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleGenerate} className="p-5 rounded-xl border border-current/10 grid grid-cols-1 md:grid-cols-6 gap-3">
        <select
          value={cfg.subjectId}
          onChange={(e) => setCfg({ ...cfg, subjectId: e.target.value })}
          className="px-3 py-2 rounded-lg border border-current/20 bg-transparent text-sm"
        >
          <option value="">All Subjects</option>
          {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>

        <select
          value={cfg.documentId}
          onChange={(e) => setCfg({ ...cfg, documentId: e.target.value })}
          className="px-3 py-2 rounded-lg border border-current/20 bg-transparent text-sm"
        >
          <option value="">All Indexed Docs</option>
          {documents.map((d) => <option key={d._id} value={d._id}>{d.originalFileName}</option>)}
        </select>

        <input
          placeholder="Topic (Optional)"
          value={cfg.topic}
          onChange={(e) => setCfg({ ...cfg, topic: e.target.value })}
          className="px-3 py-2 rounded-lg border border-current/20 bg-transparent text-sm"
        />

        <select
          value={cfg.difficulty}
          onChange={(e) => setCfg({ ...cfg, difficulty: e.target.value })}
          className="px-3 py-2 rounded-lg border border-current/20 bg-transparent text-sm"
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <select
          value={cfg.questionType}
          onChange={(e) => setCfg({ ...cfg, questionType: e.target.value })}
          className="px-3 py-2 rounded-lg border border-current/20 bg-transparent text-sm"
        >
          <option value="MCQ">MCQ</option>
          <option value="TrueFalse">True / False</option>
          <option value="2-Mark">2-Mark Short</option>
          <option value="5-Mark">5-Mark Analytical</option>
          <option value="10-Mark">10-Mark Long</option>
        </select>

        <button disabled={generating} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold">
          {generating ? 'Building Test...' : 'Start Mock Test'}
        </button>
      </form>

      {activeQuiz && (
        <div className="p-6 rounded-xl border border-current/15 space-y-5">
          <div className="flex justify-between items-center border-b border-current/10 pb-3">
            <div>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 font-semibold">
                AI-Generated Assessment (Schema Verified)
              </span>
              <h2 className="text-lg font-bold mt-1">{activeQuiz.title}</h2>
            </div>
            {!result ? (
              <div className="text-sm font-mono font-bold text-emerald-600">
                Time Left: {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
              </div>
            ) : (
              <div className="text-lg font-bold text-emerald-600">
                Score: {result.score} / {result.totalQuestions} ({result.accuracyPct}%)
              </div>
            )}
          </div>

          {activeQuiz.questions.map((q, idx) => (
            <div key={q._id} className="p-4 rounded-lg border border-current/10 space-y-2">
              <p className="font-medium text-sm">
                Q{idx + 1}. {q.question} <span className="text-xs opacity-60">[{q.topic}]</span>
              </p>

              {q.options?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt) => (
                    <button
                      key={opt}
                      disabled={Boolean(result)}
                      onClick={() => setResponses({ ...responses, [q._id]: opt })}
                      className={`p-2.5 rounded-lg border text-left text-sm ${
                        responses[q._id] === opt ? 'border-emerald-600 bg-emerald-600/10 font-semibold' : 'border-current/15'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <textarea
                  rows={3}
                  disabled={Boolean(result)}
                  value={responses[q._id] || ''}
                  onChange={(e) => setResponses({ ...responses, [q._id]: e.target.value })}
                  placeholder="Write your exam answer..."
                  className="w-full p-2.5 rounded-lg border border-current/20 bg-transparent text-sm"
                />
              )}

              {result && (
                <div className="mt-2 p-3 rounded bg-emerald-600/10 text-xs space-y-1">
                  <p><strong>Reference Answer:</strong> {q.correctAnswer}</p>
                  <p className="opacity-80"><strong>Explanation:</strong> {q.explanation}</p>
                </div>
              )}
            </div>
          ))}

          {!result && (
            <button onClick={handleSubmit} className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm">
              Submit Answers & View Explanations
            </button>
          )}
        </div>
      )}

      <div className="p-5 rounded-xl border border-current/10 space-y-2">
        <h3 className="font-bold text-base">Previous Quiz Attempts</h3>
        {attempts.length === 0 ? (
          <p className="text-xs opacity-60">No quiz attempts recorded yet.</p>
        ) : (
          attempts.map((a) => (
            <div key={a._id} className="flex justify-between text-sm py-2 border-b border-current/10">
              <span>{a.quizId?.title || 'Assessment'}</span>
              <span className="font-semibold text-emerald-600">{a.score}/{a.totalQuestions} ({a.accuracyPct}%)</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}