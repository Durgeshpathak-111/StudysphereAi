import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function PyqPage() {
  const [subjects, setSubjects] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [subjectId, setSubjectId] = useState('');
  const [syllabusDocId, setSyllabusDocId] = useState('');
  const [pyqDocId, setPyqDocId] = useState('');
  const [report, setReport] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/subjects'), api.get('/documents')]).then(([sRes, dRes]) => {
      const subs = sRes.data.data.subjects;
      setSubjects(subs);
      setDocuments(dRes.data.data.documents.filter((d) => d.processingStatus === 'Completed'));
      if (subs.length > 0) {
        setSubjectId(subs[0]._id);
        api.get(`/pyq/${subs[0]._id}`).then((r) => setReport(r.data.data.report));
      }
    });
  }, []);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!subjectId) return;
    setAnalyzing(true);
    try {
      const notesIds = documents
        .filter((d) => d._id !== syllabusDocId && d._id !== pyqDocId)
        .map((d) => d._id);

      const { data } = await api.post('/pyq/analyze', {
        subjectId,
        syllabusDocIds: syllabusDocId ? [syllabusDocId] : [],
        pyqDocIds: pyqDocId ? [pyqDocId] : [],
        notesDocIds: notesIds
      });
      setReport(data.data.report);
    } catch (err) {
      alert(err.response?.data?.message || 'PYQ analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAnalyze} className="p-5 rounded-xl border border-current/10 grid grid-cols-1 md:grid-cols-4 gap-3">
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="px-3 py-2 rounded-lg border border-current/20 bg-transparent text-sm"
        >
          {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>

        <select
          value={syllabusDocId}
          onChange={(e) => setSyllabusDocId(e.target.value)}
          className="px-3 py-2 rounded-lg border border-current/20 bg-transparent text-sm"
        >
          <option value="">-- Select Syllabus PDF --</option>
          {documents.map((d) => <option key={d._id} value={d._id}>{d.originalFileName}</option>)}
        </select>

        <select
          value={pyqDocId}
          onChange={(e) => setPyqDocId(e.target.value)}
          className="px-3 py-2 rounded-lg border border-current/20 bg-transparent text-sm"
        >
          <option value="">-- Select PYQ Paper PDF --</option>
          {documents.map((d) => <option key={d._id} value={d._id}>{d.originalFileName}</option>)}
        </select>

        <button disabled={analyzing} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold">
          {analyzing ? 'Mapping Syllabus & PYQs...' : 'Run PYQ Intelligence'}
        </button>
      </form>

      {report && (
        <div className="space-y-6">
          <p className="text-xs opacity-70">
            Note: Historical frequency shows past exam patterns only and does not guarantee future exam questions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl border border-current/10 space-y-3">
              <h3 className="font-bold">Historical Topic Frequency</h3>
              {report.topicFrequency?.map((t, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span>{t.topic} ({t.unit})</span>
                    <span>Asked {t.frequency}x</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-current/10">
                    <div className="h-full rounded-full bg-emerald-600" style={{ width: `${Math.min(100, t.frequency * 20)}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 rounded-xl border border-current/10 space-y-3">
              <h3 className="font-bold text-amber-500">Syllabus Topics Missing From Your Notes</h3>
              {report.missingFromNotes?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {report.missingFromNotes.map((topic) => (
                    <span key={topic} className="px-3 py-1 rounded-full text-xs bg-amber-500/15 text-amber-600 font-medium">
                      {topic}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs opacity-60">All detected syllabus topics are covered in your notes.</p>
              )}
            </div>
          </div>

          <div className="p-5 rounded-xl border border-current/10 space-y-2">
            <h3 className="font-bold">Extracted PYQ Questions & Syllabus Mapping</h3>
            {report.extractedQuestions?.map((q, i) => (
              <div key={i} className="p-3 rounded-lg border border-current/10 text-sm">
                <div className="flex justify-between text-xs text-emerald-600 font-semibold mb-1">
                  <span>{q.unit} • {q.topic}</span>
                  <span>{q.sourcePaper} (p.{q.page})</span>
                </div>
                <p>{q.questionText}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}