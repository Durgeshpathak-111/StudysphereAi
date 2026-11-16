import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/dashboard/stats')
      .then((res) => setData(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-sm opacity-70">Loading academic metrics...</div>;
  if (error) return <div className="p-4 rounded-lg bg-red-500/10 text-red-500 text-sm">{error}</div>;

  const { metrics, recentActivity } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Student Dashboard</h1>
          <p className="text-sm opacity-70">Live overview from your MongoDB study repository</p>
        </div>
        <div className="flex gap-2">
          <Link to="/subjects" className="px-4 py-2 rounded-lg border border-current/20 text-sm font-medium">
            + Add Subject
          </Link>
          <Link to="/documents" className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium">
            Upload Notes
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Subjects', value: metrics.totalSubjects },
          { label: 'Uploaded Documents', value: metrics.totalDocuments },
          { label: 'Quizzes Taken', value: metrics.totalQuizzes },
          { label: 'Average Quiz Score', value: `${metrics.averageQuizScore}%` }
        ].map((card) => (
          <div key={card.label} className="p-5 rounded-xl border border-current/10 bg-[rgba(255,255,255,0.02)]">
            <p className="text-xs uppercase tracking-wider opacity-60">{card.label}</p>
            <p className="text-3xl font-bold mt-2 text-emerald-600">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="p-5 rounded-xl border border-current/10 space-y-2">
        <div className="flex justify-between text-sm font-medium">
          <span>Document AI Vector Indexing Progress</span>
          <span>{metrics.learningProgress}%</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-current/10 overflow-hidden">
          <div
            className="h-full bg-emerald-600 transition-all"
            style={{ width: `${metrics.learningProgress}%` }}
          />
        </div>
      </div>

      <div className="p-5 rounded-xl border border-current/10 space-y-3">
        <h2 className="font-bold text-base">Recent Uploaded Materials</h2>
        {recentActivity.length === 0 ? (
          <p className="text-sm opacity-60">
            No study materials uploaded yet. Create a subject and upload your first PDF, DOCX, or TXT file.
          </p>
        ) : (
          <div className="divide-y divide-current/10">
            {recentActivity.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs opacity-60">
                    {item.subject} • {new Date(item.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-emerald-600/15 text-emerald-600">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}