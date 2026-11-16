import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function DocumentsPage() {
  const [subjects, setSubjects] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [subjectId, setSubjectId] = useState('');
  const [unitTitle, setUnitTitle] = useState('');
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const loadAll = async () => {
    const [subRes, docRes] = await Promise.all([
      api.get('/subjects'),
      api.get('/documents', { params: search ? { search } : {} })
    ]);
    setSubjects(subRes.data.data.subjects);
    setDocuments(docRes.data.data.documents);
    if (!subjectId && subRes.data.data.subjects.length > 0) {
      setSubjectId(subRes.data.data.subjects[0]._id);
    }
  };

  useEffect(() => {
    loadAll();
  }, [search]);

  const handleFile = async (file) => {
    if (!file || !subjectId) return alert('Create and select a subject first.');
    const formData = new FormData();
    formData.append('document', file);
    formData.append('subjectId', subjectId);
    formData.append('unitTitle', unitTitle || 'General');

    setUploading(true);
    setProgress(0);
    try {
      await api.post('/documents/upload', formData, {
        onUploadProgress: (evt) => {
          if (evt.total) setProgress(Math.round((evt.loaded * 100) / evt.total));
        }
      });
      await loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc) => {
    const res = await api.get(`/documents/${doc._id}/download`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.originalFileName;
    a.click();
  };

  const handleDelete = async (id) => {
    await api.delete(`/documents/${id}`);
    if (selectedDoc?._id === id) setSelectedDoc(null);
    loadAll();
  };

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFile(e.dataTransfer.files[0]);
        }}
        className="p-6 rounded-xl border-2 border-dashed border-emerald-600/40 bg-emerald-600/5 space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="px-3 py-2 rounded-lg border border-current/20 bg-transparent text-sm"
          >
            <option value="">-- Select Subject --</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} (Sem {s.semester})
              </option>
            ))}
          </select>
          <input
            placeholder="Unit / Topic Label (Optional)"
            value={unitTitle}
            onChange={(e) => setUnitTitle(e.target.value)}
            className="px-3 py-2 rounded-lg border border-current/20 bg-transparent text-sm"
          />
          <label className="cursor-pointer px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold text-center">
            {uploading ? `Uploading ${progress}%...` : 'Choose PDF / DOCX / TXT'}
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={(e) => handleFile(e.target.files[0])}
              className="hidden"
            />
          </label>
        </div>
        <p className="text-xs opacity-60 text-center">
          Or drag & drop your study material here (Max 25 MB). Automatically extracts text, keywords, and ChromaDB embeddings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-3">
          <div className="flex gap-2">
            <input
              placeholder="Search documents, topics, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-lg border border-current/20 bg-transparent text-sm"
            />
            <button onClick={loadAll} className="px-3 py-2 rounded-lg border border-current/20 text-xs">
              Refresh Status
            </button>
          </div>

          {documents.map((doc) => (
            <div
              key={doc._id}
              onClick={() => setSelectedDoc(doc)}
              className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between ${
                selectedDoc?._id === doc._id ? 'border-emerald-600 bg-emerald-600/5' : 'border-current/10'
              }`}
            >
              <div>
                <p className="font-semibold text-sm">{doc.originalFileName}</p>
                <p className="text-xs opacity-60 mt-1">
                  {doc.subjectId?.name} • {(doc.fileSize / 1024).toFixed(1)} KB •{' '}
                  {new Date(doc.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                  doc.processingStatus === 'Completed'
                    ? 'bg-emerald-600/15 text-emerald-600'
                    : doc.processingStatus === 'Failed'
                    ? 'bg-red-600/15 text-red-500'
                    : 'bg-amber-500/15 text-amber-600'
                }`}
              >
                {doc.processingStatus}
              </span>
            </div>
          ))}
        </div>

        <div className="lg:col-span-5 p-5 rounded-xl border border-current/10 h-fit space-y-4">
          <h3 className="font-bold">Document Details & AI Metadata</h3>
          {selectedDoc ? (
            <>
              <div className="text-sm space-y-1">
                <p><strong>File:</strong> {selectedDoc.originalFileName}</p>
                <p><strong>Pages Extracted:</strong> {selectedDoc.pageCount}</p>
                <p><strong>Vector Chunks:</strong> {selectedDoc.chunkCount}</p>
              </div>
              {selectedDoc.extractedKeywords?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase opacity-60 mb-1.5">Extracted Keywords</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDoc.extractedKeywords.map((k) => (
                      <span key={k} className="px-2 py-0.5 rounded text-xs bg-emerald-600/15 text-emerald-600">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleDownload(selectedDoc)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
                >
                  Download File
                </button>
                <button
                  onClick={() => handleDelete(selectedDoc._id)}
                  className="px-3 py-1.5 rounded-lg bg-red-600/15 text-red-500 text-xs font-semibold"
                >
                  Delete
                </button>
              </div>
            </>
          ) : (
            <p className="text-xs opacity-60">Click any uploaded document to inspect its vector status and keywords.</p>
          )}
        </div>
      </div>
    </div>
  );
}