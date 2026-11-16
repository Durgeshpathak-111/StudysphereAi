// import React, { useEffect, useState } from 'react';
// import api from '../services/api';

// export default function ChatPage() {
//   const [sessions, setSessions] = useState([]);
//   const [documents, setDocuments] = useState([]);
//   const [activeSessionId, setActiveSessionId] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [selectedDocId, setSelectedDocId] = useState('');
//   const [mode, setMode] = useState('english');
//   const [question, setQuestion] = useState('');
//   const [sending, setSending] = useState(false);

//   const loadSidebar = async () => {
//     const [histRes, docRes] = await Promise.all([api.get('/chat/history'), api.get('/documents')]);
//     setSessions(histRes.data.data.sessions);
//     setDocuments(docRes.data.data.documents.filter((d) => d.processingStatus === 'Completed'));
//   };

//   useEffect(() => {
//     loadSidebar();
//   }, []);

//   const openSession = async (id) => {
//     const { data } = await api.get(`/chat/${id}`);
//     setActiveSessionId(id);
//     setMessages(data.data.session.messages);
//   };

//   const startNewChat = () => {
//     setActiveSessionId(null);
//     setMessages([]);
//   };

//   const deleteSession = async (id) => {
//     await api.delete(`/chat/${id}`);
//     if (activeSessionId === id) startNewChat();
//     loadSidebar();
//   };

//   const handleAsk = async (e) => {
//     e.preventDefault();
//     if (!question.trim() || sending) return;

//     const q = question.trim();
//     setQuestion('');
//     setMessages((prev) => [...prev, { role: 'user', content: q }]);
//     setSending(true);

//     try {
//       const { data } = await api.post('/chat', {
//         sessionId: activeSessionId,
//         question: q,
//         documentIds: selectedDocId ? [selectedDocId] : [],
//         mode
//       });
//       setActiveSessionId(data.data.sessionId);
//       setMessages((prev) => [...prev, data.data.message]);
//       loadSidebar();
//     } catch (err) {
//       setMessages((prev) => [
//         ...prev,
//         { role: 'assistant', content: err.response?.data?.message || 'Error contacting RAG service.' }
//       ]);
//     } finally {
//       setSending(false);
//     }
//   };

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-130px)]">
//       <div className="lg:col-span-3 p-4 rounded-xl border border-current/10 flex flex-col gap-3">
//         <button
//           onClick={startNewChat}
//           className="w-full py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
//         >
//           + New Study Chat
//         </button>

//         <div className="flex-1 overflow-y-auto space-y-1.5">
//           {sessions.map((s) => (
//             <div
//               key={s._id}
//               onClick={() => openSession(s._id)}
//               className={`p-2.5 rounded-lg text-xs cursor-pointer flex justify-between items-center ${
//                 activeSessionId === s._id ? 'bg-emerald-600/15 text-emerald-600 font-semibold' : 'hover:bg-current/5'
//               }`}
//             >
//               <span className="truncate pr-2">{s.title}</span>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   deleteSession(s._id);
//                 }}
//                 className="text-red-500 font-bold"
//               >
//                 ×
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="lg:col-span-9 rounded-xl border border-current/10 flex flex-col overflow-hidden">
//         <div className="p-3 border-b border-current/10 flex flex-wrap gap-2 items-center justify-between">
//           <select
//             value={selectedDocId}
//             onChange={(e) => setSelectedDocId(e.target.value)}
//             className="px-3 py-1.5 rounded-lg border border-current/20 bg-transparent text-xs"
//           >
//             <option value="">All Indexed Study Materials</option>
//             {documents.map((d) => (
//               <option key={d._id} value={d._id}>
//                 {d.originalFileName}
//               </option>
//             ))}
//           </select>

//           <div className="flex gap-1">
//             {[
//               { id: 'english', label: 'Simple English' },
//               { id: 'hinglish', label: 'Hinglish' },
//               { id: 'exam', label: 'Exam Answer' }
//             ].map((m) => (
//               <button
//                 key={m.id}
//                 onClick={() => setMode(m.id)}
//                 className={`px-2.5 py-1 rounded text-xs font-medium ${
//                   mode === m.id ? 'bg-emerald-600 text-white' : 'border border-current/15'
//                 }`}
//               >
//                 {m.label}
//               </button>
//             ))}
//           </div>
//         </div>

//         <div className="flex-1 p-4 overflow-y-auto space-y-4">
//           {messages.length === 0 && (
//             <div className="text-center text-sm opacity-60 py-12">
//               Ask any question from your uploaded syllabus notes. Answers include exact document & page citations.
//             </div>
//           )}
//           {messages.map((m, idx) => (
//             <div key={idx} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
//               <div
//                 className={`max-w-[85%] p-4 rounded-xl text-sm whitespace-pre-wrap ${
//                   m.role === 'user' ? 'bg-emerald-600 text-white' : 'border border-current/15 bg-current/[0.03]'
//                 }`}
//               >
//                 {m.content}
//                 {m.citations?.length > 0 && (
//                   <div className="mt-3 pt-2 border-t border-current/15 space-y-1.5">
//                     <p className="text-[11px] font-bold uppercase text-emerald-600">Source Citations:</p>
//                     {m.citations.map((c, i) => (
//                       <div key={i} className="text-xs p-2 rounded bg-emerald-600/10">
//                         <strong>
//                           {c.documentName} (Page {c.pageNumber}):
//                         </strong>{' '}
//                         <span className="opacity-80">"{c.passage}"</span>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}
//           {sending && <p className="text-xs opacity-60 animate-pulse">Searching ChromaDB & generating grounded answer...</p>}
//         </div>

//         <form onSubmit={handleAsk} className="p-3 border-t border-current/10 flex gap-2">
//           <input
//             value={question}
//             onChange={(e) => setQuestion(e.target.value)}
//             placeholder="Ask a doubt from your notes..."
//             className="flex-1 px-3.5 py-2 rounded-lg border border-current/20 bg-transparent text-sm"
//           />
//           <button
//             disabled={sending}
//             className="px-5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold"
//           >
//             Send
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }


import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function ChatPage() {
  const savedPrefs = (() => {
    try {
      return JSON.parse(localStorage.getItem('studysphere-ai-prefs') || '{}');
    } catch {
      return {};
    }
  })();

  const [sessions, setSessions] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [mode, setMode] = useState(savedPrefs.defaultMode || 'english');
  const [question, setQuestion] = useState('');
  const [sending, setSending] = useState(false);

  // Split-Screen Citation Verifier State
  const [activeCitation, setActiveCitation] = useState(null);

  const loadSidebar = async () => {
    const [histRes, docRes] = await Promise.all([
      api.get('/chat/history'),
      api.get('/documents'),
    ]);
    setSessions(histRes.data.data.sessions);
    setDocuments(
      docRes.data.data.documents.filter((d) => d.processingStatus === 'Completed')
    );
  };

  useEffect(() => {
    loadSidebar();
  }, []);

  const openSession = async (id) => {
    const { data } = await api.get(`/chat/${id}`);
    setActiveSessionId(id);
    setMessages(data.data.session.messages);
    setActiveCitation(null);
  };

  const startNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setActiveCitation(null);
  };

  const deleteSession = async (id) => {
    await api.delete(`/chat/${id}`);
    if (activeSessionId === id) startNewChat();
    loadSidebar();
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim() || sending) return;

    const q = question.trim();
    setQuestion('');
    setMessages((prev) => [...prev, { role: 'user', content: q }]);
    setSending(true);

    try {
      const { data } = await api.post('/chat', {
        sessionId: activeSessionId,
        question: q,
        documentIds: selectedDocId ? [selectedDocId] : [],
        mode,
      });
      setActiveSessionId(data.data.sessionId);
      setMessages((prev) => [...prev, data.data.message]);
      loadSidebar();
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            err.response?.data?.message || 'Error contacting RAG service.',
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  // Resolve PDF URL from matched document metadata
  const resolvePdfUrl = (citation) => {
    if (!citation) return '';
    const matchedDoc = documents.find(
      (d) =>
        String(d._id) === String(citation.documentId) ||
        d.originalFileName === citation.documentName
    );

    const backendOrigin = (
      api.defaults.baseURL || 'http://localhost:5000/api'
    ).replace(/\/api\/?$/, '');

    const rawPath =
      matchedDoc?.fileUrl ||
      matchedDoc?.filePath ||
      matchedDoc?.storedFileName ||
      matchedDoc?.fileName ||
      '';

    if (!rawPath) return '';
    if (rawPath.startsWith('http')) {
      return `${rawPath}#page=${citation.pageNumber || 1}`;
    }

    const normalized = rawPath.replace(/\\/g, '/');
    const uploadsIdx = normalized.indexOf('uploads/');
    const relativePath =
      uploadsIdx !== -1
        ? `/${normalized.slice(uploadsIdx)}`
        : `/uploads/${normalized.replace(/^\/+/, '')}`;

    // return `${backendOrigin}${relativePath}#page=${citation.pageNumber || 1}`;
    return `${backendOrigin}${relativePath}?page=${citation.pageNumber || 1}#page=${citation.pageNumber || 1}`;
  };

  const activePdfUrl = resolvePdfUrl(activeCitation);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-130px)]">
      {/* Left History Sidebar */}
      <div
        className={`${
          activeCitation ? 'lg:col-span-2' : 'lg:col-span-3'
        } p-3.5 rounded-xl border border-current/10 flex flex-col gap-3 transition-all`}
      >
        <button
          onClick={startNewChat}
          className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer"
        >
          + New Study Chat
        </button>

        <div className="flex-1 overflow-y-auto space-y-1.5">
          {sessions.map((s) => (
            <div
              key={s._id}
              onClick={() => openSession(s._id)}
              className={`p-2.5 rounded-lg text-xs cursor-pointer flex justify-between items-center transition ${
                activeSessionId === s._id
                  ? 'bg-emerald-600/15 text-emerald-500 font-semibold'
                  : 'hover:bg-current/5'
              }`}
            >
              <span className="truncate pr-2">{s.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSession(s._id);
                }}
                className="text-red-500 font-bold px-1 hover:opacity-80"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Center RAG Chat Panel */}
      <div
        className={`${
          activeCitation ? 'lg:col-span-5' : 'lg:col-span-9'
        } rounded-xl border border-current/10 flex flex-col overflow-hidden transition-all`}
      >
        <div className="p-3 border-b border-current/10 flex flex-wrap gap-2 items-center justify-between">
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-current/20 bg-transparent text-xs "
          >
            <option value="">All Indexed Study Materials</option>
            {documents.map((d) => (
              <option key={d._id} value={d._id}>
                {d.originalFileName}
              </option>
            ))}
          </select>

          <div className="flex gap-1">
            {[
              { id: 'english', label: 'Simple English' },
              { id: 'hinglish', label: 'Hinglish' },
              { id: 'exam', label: 'Exam Answer' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
                  mode === m.id
                    ? 'bg-emerald-600 text-white'
                    : 'border border-current/15 hover:bg-current/5'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-sm opacity-60 py-12">
              Ask any question from your uploaded syllabus notes. Click any citation below an answer to verify the exact PDF page.
            </div>
          )}
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                m.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[90%] p-4 rounded-xl text-sm whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-emerald-600 text-white'
                    : 'border border-current/15 bg-[rgba(255,255,255,0.03)]'
                }`}
              >
                {m.content}
                {m.citations?.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-current/15 space-y-1.5">
                    <p className="text-[11px] font-bold uppercase text-emerald-500">
                      Source Citations (Click to Verify Page):
                    </p>
                    {m.citations.map((c, i) => {
                      const isSelected =
                        activeCitation?.documentId === c.documentId &&
                        activeCitation?.pageNumber === c.pageNumber;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setActiveCitation(c)}
                          className={`w-full text-left text-xs p-2.5 rounded-lg border transition cursor-pointer block ${
                            isSelected
                              ? 'bg-emerald-600/20 border-emerald-500'
                              : 'bg-emerald-600/10 border-transparent hover:border-emerald-500/40'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <strong className="text-emerald-500">
                              {c.documentName} (Page {c.pageNumber})
                            </strong>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-600 text-white shrink-0">
                              Verify Page ↗
                            </span>
                          </div>
                          <span className="opacity-80 line-clamp-2">
                            &ldquo;{c.passage}&rdquo;
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
          {sending && (
            <p className="text-xs opacity-60 animate-pulse">
              Searching ChromaDB &amp; generating grounded answer...
            </p>
          )}
        </div>

        <form
          onSubmit={handleAsk}
          className="p-3 border-t border-current/10 flex gap-2"
        >
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a doubt from your notes..."
            className="flex-1 px-3.5 py-2 rounded-lg border border-current/20 bg-transparent text-sm"
          />
          <button
            disabled={sending}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition cursor-pointer"
          >
            Send
          </button>
        </form>
      </div>

      {/* Right Split-Screen PDF Source Verifier Drawer */}
      {activeCitation && (
        <div className="lg:col-span-5 rounded-xl border border-emerald-500/30 flex flex-col overflow-hidden bg-[rgba(255,255,255,0.02)]">
          <div className="p-3 border-b border-current/10 flex items-center justify-between gap-2 bg-emerald-600/10">
            <div className="min-w-0">
              <p className="text-xs font-bold text-emerald-500 truncate">
                {activeCitation.documentName} • Page {activeCitation.pageNumber}
              </p>
              <p className="text-[11px] opacity-70 truncate">
                Live Source Verification Viewer
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {activePdfUrl && (
                <a
                  href={activePdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded text-[11px] font-medium border border-current/20 hover:bg-current/10"
                >
                  Open Tab ↗
                </a>
              )}
              <button
                type="button"
                onClick={() => setActiveCitation(null)}
                className="px-2.5 py-1 rounded text-xs font-bold bg-red-500/15 text-red-500 hover:bg-red-500/25 cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Highlighted Extracted Chunk Snippet */}
          <div className="p-3 border-b border-current/10 bg-emerald-500/5 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 block mb-1">
              Matched Vector Chunk (Page {activeCitation.pageNumber}):
            </span>
            <p className="opacity-85 italic leading-relaxed max-h-20 overflow-y-auto">
              &ldquo;{activeCitation.passage}&rdquo;
            </p>
          </div>

          {/* Embedded PDF Viewer jumped to exact page */}
          <div className="flex-1 bg-black/20">
            {activePdfUrl ? (
              <iframe
                key={activePdfUrl}
                src={activePdfUrl}
                title={`${activeCitation.documentName} Page ${activeCitation.pageNumber}`}
                className="w-full h-full border-0"
              />
            ) : (
              <div className="h-full flex items-center justify-center p-6 text-center text-xs opacity-70">
                PDF file path not found on server. Ensure Backend serves /uploads statically.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}