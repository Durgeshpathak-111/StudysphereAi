import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function NotesPage() {
  const [subjects, setSubjects] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    subjectId: '',
    documentId: '',
    topic: '',
    noteType: 'detailed',
    language: 'english'
  });
  const [generating, setGenerating] = useState(false);
  const [search, setSearch] = useState('');

  const loadAll = async () => {
    const [sRes, dRes, nRes] = await Promise.all([
      api.get('/subjects'),
      api.get('/documents'),
      api.get('/notes', { params: search ? { search } : {} })
    ]);
    setSubjects(sRes.data.data.subjects);
    setDocuments(dRes.data.data.documents.filter((d) => d.processingStatus === 'Completed'));
    setNotes(nRes.data.data.notes);
  };

  useEffect(() => {
    loadAll();
  }, [search]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const { data } = await api.post('/notes', {
        subjectId: form.subjectId || undefined,
        documentIds: form.documentId ? [form.documentId] : [],
        topic: form.topic,
        noteType: form.noteType,
        language: form.language
      });
      setSelectedNote(data.data.note);
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Notes generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveEdit = async () => {
    const { data } = await api.put(`/notes/${selectedNote._id}`, selectedNote);
    setSelectedNote(data.data.note);
    setEditMode(false);
    loadAll();
  };

  const handleDelete = async (id) => {
    await api.delete(`/notes/${id}`);
    if (selectedNote?._id === id) setSelectedNote(null);
    loadAll();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleGenerate} className="p-5 rounded-xl border border-current/10 grid grid-cols-1 md:grid-cols-6 gap-3">
        <select
          value={form.subjectId}
          onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
          className="px-3 py-2 rounded-lg border border-current/20 bg-transparent text-sm"
        >
          <option value="">All Subjects</option>
          {subjects.map((s) => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>

        <select
          value={form.documentId}
          onChange={(e) => setForm({ ...form, documentId: e.target.value })}
          className="px-3 py-2 rounded-lg border border-current/20 bg-transparent text-sm"
        >
          <option value="">All Indexed PDFs</option>
          {documents.map((d) => (
            <option key={d._id} value={d._id}>{d.originalFileName}</option>
          ))}
        </select>

        <input
          placeholder="Topic (Optional)"
          value={form.topic}
          onChange={(e) => setForm({ ...form, topic: e.target.value })}
          className="px-3 py-2 rounded-lg border border-current/20 bg-transparent text-sm"
        />

        <select
          value={form.noteType}
          onChange={(e) => setForm({ ...form, noteType: e.target.value })}
          className="px-3 py-2 rounded-lg border border-current/20 bg-transparent text-sm"
        >
          <option value="short">Short Summary</option>
          <option value="detailed">Detailed Summary</option>
          <option value="unit">Unit-Wise Summary</option>
          <option value="definitions">Important Definitions</option>
          <option value="exam">Exam-Oriented Notes</option>
        </select>

        <select
          value={form.language}
          onChange={(e) => setForm({ ...form, language: e.target.value })}
          className="px-3 py-2 rounded-lg border border-current/20 bg-transparent text-sm"
        >
          <option value="english">English</option>
          <option value="hinglish">Hinglish</option>
          <option value="hindi">Hindi</option>
        </select>

        <button disabled={generating} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold">
          {generating ? 'Generating...' : 'Generate Notes'}
        </button>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-3">
          <input
            placeholder="Search saved notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-current/20 bg-transparent text-sm"
          />
          {notes.map((n) => (
            <div
              key={n._id}
              onClick={() => { setSelectedNote(n); setEditMode(false); }}
              className={`p-3.5 rounded-xl border cursor-pointer ${
                selectedNote?._id === n._id ? 'border-emerald-600 bg-emerald-600/5' : 'border-current/10'
              }`}
            >
              <p className="font-semibold text-sm">{n.title}</p>
              <p className="text-xs opacity-60 mt-1">{n.suggestedUnit} • {n.language.toUpperCase()}</p>
            </div>
          ))}
        </div>

        <div className="lg:col-span-8 p-6 rounded-xl border border-current/10 space-y-4">
          {selectedNote ? (
            <>
              <div className="flex flex-wrap justify-between gap-2 border-b border-current/10 pb-3">
                <div>
                  <h2 className="text-xl font-bold">{selectedNote.title}</h2>
                  <p className="text-xs text-emerald-600 font-medium mt-1">
                    AI Organizer: {selectedNote.suggestedSubject} → {selectedNote.suggestedUnit} → {selectedNote.suggestedTopic}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditMode(!editMode)} className="px-3 py-1.5 rounded border border-current/20 text-xs">
                    {editMode ? 'Cancel' : 'Edit / Reclassify'}
                  </button>
                  <button onClick={() => window.print()} className="px-3 py-1.5 rounded bg-emerald-600 text-white text-xs">
                    Export PDF
                  </button>
                  <button onClick={() => handleDelete(selectedNote._id)} className="px-3 py-1.5 rounded bg-red-600/15 text-red-500 text-xs">
                    Delete
                  </button>
                </div>
              </div>

              {editMode ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      value={selectedNote.suggestedUnit}
                      onChange={(e) => setSelectedNote({ ...selectedNote, suggestedUnit: e.target.value })}
                      placeholder="Unit"
                      className="px-3 py-2 rounded border border-current/20 bg-transparent text-sm"
                    />
                    <input
                      value={selectedNote.suggestedTopic}
                      onChange={(e) => setSelectedNote({ ...selectedNote, suggestedTopic: e.target.value })}
                      placeholder="Topic"
                      className="px-3 py-2 rounded border border-current/20 bg-transparent text-sm"
                    />
                  </div>
                  <textarea
                    rows={12}
                    value={selectedNote.contentMarkdown}
                    onChange={(e) => setSelectedNote({ ...selectedNote, contentMarkdown: e.target.value })}
                    className="w-full p-3 rounded border border-current/20 bg-transparent text-sm font-mono"
                  />
                  <button onClick={handleSaveEdit} className="px-4 py-2 rounded bg-emerald-600 text-white text-xs font-semibold">
                    Save Changes
                  </button>
                </div>
              ) : (
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{selectedNote.contentMarkdown}</div>
              )}

              {selectedNote.sources?.length > 0 && (
                <div className="pt-3 border-t border-current/10 text-xs opacity-70">
                  <strong>Grounded Sources:</strong> {selectedNote.sources.join(', ')}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm opacity-60">Generate or select a saved note to view, edit, or export as PDF.</p>
          )}
        </div>
      </div>
    </div>
  );
}