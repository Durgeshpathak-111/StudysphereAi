// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// export default function LoginPage() {
//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [submitting, setSubmitting] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSubmitting(true);
//     try {
//       await login(email, password);
//       navigate('/dashboard');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Invalid email or password');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-stone-100 px-4">
//       <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6">
//         <div>
//           <h1 className="text-2xl font-bold text-stone-900">Sign in to StudySphere AI</h1>
//           <p className="text-sm text-stone-500 mt-1">Access your organized notes and RAG tutor</p>
//         </div>

//         {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-xs font-semibold uppercase text-stone-600 mb-1">Email</label>
//             <input
//               type="email"
//               required
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm text-stone-900"
//             />
//           </div>
//           <div>
//             <label className="block text-xs font-semibold uppercase text-stone-600 mb-1">Password</label>
//             <input
//               type="password"
//               required
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm text-stone-900"
//             />
//           </div>
//           <div className="text-right">
//             <Link to="/forgot-password" className="text-xs text-emerald-600 hover:underline">
//               Forgot password?
//             </Link>
//           </div>
//           <button
//             type="submit"
//             disabled={submitting}
//             className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm"
//           >
//             {submitting ? 'Signing in...' : 'Login'}
//           </button>
//         </form>

//         <p className="text-center text-sm text-stone-600">
//           New student?{' '}
//           <Link to="/signup" className="text-emerald-600 font-semibold hover:underline">
//             Create an account
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// export default function LoginPage() {
//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [submitting, setSubmitting] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSubmitting(true);
//     try {
//       await login(email, password);
//       navigate('/dashboard');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Invalid email or password');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const fillDemoAccount = () => {
//     setEmail('aman@studysphere.ai');
//     setPassword('123456');
//   };

//   return (
//     <div className="min-h-screen bg-[#0a0f0d] text-slate-100 flex flex-col justify-between selection:bg-emerald-500/30">
//       {/* Top Brand Header */}
//       <header className="w-full border-b border-emerald-500/15 bg-[#0a0f0d]/80 backdrop-blur-md">
//         <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-extrabold text-slate-950 shadow-lg shadow-emerald-500/20">
//               S
//             </div>
//             <div>
//               <span className="text-lg font-bold tracking-tight text-emerald-400">
//                 StudySphere AI
//               </span>
//               <p className="text-[11px] text-slate-400 -mt-1">
//                 Academic RAG Workspace
//               </p>
//             </div>
//           </div>

//           <div className="flex items-center gap-3">
//             {/* <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
//               <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
//               ChromaDB + Gemini Flash RAG
//             </span> */}
//             <Link
//               to="/signup"
//               className="px-4 py-2 rounded-lg text-xs font-semibold border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 transition"
//             >
//               Create Account
//             </Link>
//           </div>
//         </div>
//       </header>

//       {/* Main Split-Screen Container */}
//       <main className="max-w-7xl w-full mx-auto px-6 py-10 grid lg:grid-cols-12 gap-10 items-center">
//         {/* Left Side: StudySphere AI Showcase & Live Citation Preview */}
//         <div className="lg:col-span-7 space-y-6">
//           {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-medium">
//             Zero-Hallucination University Study Assistant
//           </div> */}

//           <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
//             Apne Notes & PYQs Se{' '}
//             <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
//               Exact Page-Cited Answers
//             </span>{' '}
//             Paayein.
//           </h1>

//           <p className="text-slate-400 text-sm sm:text-base max-w-xl leading-relaxed">
//             StudySphere AI tumhare uploaded PDFs ko vector index karke{' '}
//             <span className="text-slate-200 font-medium">Simple English</span>,{' '}
//             <span className="text-slate-200 font-medium">Hinglish</span>, aur{' '}
//             <span className="text-slate-200 font-medium">Exam Answer</span> formats mein samjhata hai—har answer ke saath exact PDF page number ke saath.
//           </p>

//           {/* Feature Pills */}
//           <div className="grid sm:grid-cols-3 gap-3 max-w-2xl">
//             <div className="p-3.5 rounded-xl bg-[#111916] border border-white/10">
//               <p className="text-xs font-bold text-emerald-400">Page-Cited RAG</p>
//               <p className="text-[11px] text-slate-400 mt-1">
//                 Har answer ke neeche verified PDF page reference.
//               </p>
//             </div>
//             <div className="p-3.5 rounded-xl bg-[#111916] border border-white/10">
//               <p className="text-xs font-bold text-emerald-400">3 Learning Modes</p>
//               <p className="text-[11px] text-slate-400 mt-1">
//                 Simple English, Hinglish aur Semester Exam format.
//               </p>
//             </div>
//             <div className="p-3.5 rounded-xl bg-[#111916] border border-white/10">
//               <p className="text-xs font-bold text-emerald-400">Topic-Locked Quiz</p>
//               <p className="text-[11px] text-slate-400 mt-1">
//                 Specific unit par MCQs aur weak-topic tracking.
//               </p>
//             </div>
//           </div>

//           {/* Mini Live Output Preview Card */}
//           <div className="max-w-2xl rounded-2xl bg-[#111916]/90 border border-emerald-500/20 p-4 space-y-2.5 shadow-xl">
//             <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-white/10 pb-2">
//               <span>Sample Grounded Response</span>
//               <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-medium">
//                 operating system.pdf • Page 44
//               </span>
//             </div>
//             <p className="text-xs text-slate-300 leading-relaxed">
//               <span className="text-emerald-400 font-semibold">Deadlock</span> ek aisi state hoti hai jismein multiple processes ek-dusre ke held resources ka wait karte rehte hain aur execution ruk jaata hai{' '}
//               <span className="text-emerald-400">(operating system.pdf, Page 44)</span>.
//             </p>
//           </div>
//         </div>

//         {/* Right Side: Glassmorphism Login Card */}
//         <div className="lg:col-span-5">
//           <div className="w-full max-w-md mx-auto bg-[#111916]/95 backdrop-blur-xl p-8 rounded-2xl border border-emerald-500/25 shadow-2xl shadow-emerald-950/40 space-y-6">
//             <div className="flex items-start justify-between gap-2">
//               <div>
//                 <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
//                 <p className="text-xs text-slate-400 mt-1">
//                   Sign in to access your StudySphere AI workspace
//                 </p>
//               </div>
//               <button
//                 type="button"
//                 onClick={fillDemoAccount}
//                 className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition shrink-0"
//               >
//                 Demo Fill
//               </button>
//             </div>

//             {error && (
//               <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
//                 {error}
//               </div>
//             )}

//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
//                   Email Address
//                 </label>
//                 <input
//                   type="email"
//                   required
//                   placeholder="student@university.edu"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0f0d] border border-white/10 focus:border-emerald-500 outline-none text-sm text-white placeholder:text-slate-600 transition"
//                 />
//               </div>

//               <div>
//                 <div className="flex items-center justify-between mb-1.5">
//                   <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
//                     Password
//                   </label>
//                   <Link
//                     to="/forgot-password"
//                     className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline"
//                   >
//                     Forgot password?
//                   </Link>
//                 </div>
//                 <input
//                   type="password"
//                   required
//                   placeholder="••••••••"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0f0d] border border-white/10 focus:border-emerald-500 outline-none text-sm text-white placeholder:text-slate-600 transition"
//                 />
//               </div>

//               <button
//                 type="submit"
//                 disabled={submitting}
//                 className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20 cursor-pointer"
//               >
//                 {submitting ? 'Signing in...' : 'Launch Workspace →'}
//               </button>
//             </form>

//             <div className="pt-2 border-t border-white/10 text-center">
//               <p className="text-xs text-slate-400">
//                 New student?{' '}
//                 <Link
//                   to="/signup"
//                   className="text-emerald-400 font-semibold hover:text-emerald-300 hover:underline"
//                 >
//                   Create a free workspace account
//                 </Link>
//               </p>
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* Subtle Footer */}
//       <footer className="border-t border-white/10 py-4 px-6 text-center text-xs text-slate-500">
//         StudySphere AI • Grounded Academic Retrieval & Adaptive Assessment Platform
//       </footer>
//     </div>
//   );
// }

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../hooks/useTheme";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between transition-colors duration-200 selection:bg-emerald-500/30 ${
        isDark ? "bg-[#0a0f0d] text-slate-100" : "bg-stone-50 text-stone-900"
      }`}
    >
      {/* Top Brand Header */}
      <header
        className={`w-full border-b backdrop-blur-md transition-colors ${
          isDark
            ? "border-emerald-500/15 bg-[#0a0f0d]/80"
            : "border-stone-200 bg-white/90"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center font-extrabold text-slate-950 shadow-lg shadow-emerald-500/20">
              S
            </div>

            <div>
              <span
                className={`text-lg font-bold tracking-tight ${
                  isDark ? "text-emerald-400" : "text-emerald-700"
                }`}
              >
                StudySphere AI
              </span>
              <p
                className={`text-[11px] -mt-1 ${
                  isDark ? "text-slate-400" : "text-stone-500"
                }`}
              >
                Academic RAG Workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                isDark
                  ? "border-white/15 bg-white/5 text-slate-200 hover:border-emerald-500/40"
                  : "border-stone-300 bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              {isDark ? "Light Mode" : "Dark Mode"}
            </button>

            <Link
              to="/signup"
              className={`px-4 py-2 rounded-lg text-xs font-semibold border transition ${
                isDark
                  ? "border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
                  : "border-emerald-600/30 text-emerald-700 hover:bg-emerald-50"
              }`}
            >
              Create Account
            </Link>
          </div>
        </div>
      </header>

      {/* Main Split-Screen Container */}
      <main className="max-w-7xl w-full mx-auto px-6 py-10 grid lg:grid-cols-12 gap-10 items-center">
        {/* Left Side: StudySphere AI Showcase */}
        <div className="lg:col-span-7 space-y-6">
          <h1
            className={`text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight ${
              isDark ? "text-white" : "text-stone-900"
            }`}
          >
            Get Accurate Answers From Your Notes &amp; PYQs
            <span
              className={`block mt-2 ${
                isDark ? "text-emerald-400" : "text-emerald-600"
              }`}
            >
              With Exact Page References.
            </span>
          </h1>

          <p
            className={`text-sm sm:text-base max-w-xl leading-relaxed ${
              isDark ? "text-slate-400" : "text-stone-600"
            }`}
          >
            StudySphere AI indexes your uploaded PDFs and explains concepts in{" "}
            <span
              className={`font-medium ${
                isDark ? "text-slate-200" : "text-stone-900"
              }`}
            >
              Simple English
            </span>
            ,{" "}
            <span
              className={`font-medium ${
                isDark ? "text-slate-200" : "text-stone-900"
              }`}
            >
              Hinglish
            </span>
            , and{" "}
            <span
              className={`font-medium ${
                isDark ? "text-slate-200" : "text-stone-900"
              }`}
            >
              Exam Answer
            </span>{" "}
            formats, providing exact PDF page references with every answer.
          </p>

          {/* Feature Pills */}
          <div className="grid sm:grid-cols-3 gap-3 max-w-2xl">
            {/* <div
              className={`p-3.5 rounded-xl border ${
                isDark
                  ? "bg-[#111916] border-white/10"
                  : "bg-white border-stone-200 shadow-xs"
              }`}
            >
              <p
                className={`text-xs font-bold ${
                  isDark ? "text-emerald-400" : "text-emerald-700"
                }`}
              >
                Page-Cited RAG
              </p>
              <p
                className={`text-[11px] mt-1 ${
                  isDark ? "text-slate-400" : "text-stone-500"
                }`}
              >
                Verified PDF page references with every answer.
              </p>
            </div> */}

            {/* <div
              className={`p-3.5 rounded-xl border ${
                isDark
                  ? "bg-[#111916] border-white/10"
                  : "bg-white border-stone-200 shadow-xs"
              }`}
            >
              <p
                className={`text-xs font-bold ${
                  isDark ? "text-emerald-400" : "text-emerald-700"
                }`}
              >
                3 Learning Modes
              </p>
              <p
                className={`text-[11px] mt-1 ${
                  isDark ? "text-slate-400" : "text-stone-500"
                }`}
              >
                Simple English, Hinglish, and Semester Exam format.
              </p>
            </div> */}

            {/* <div
              className={`p-3.5 rounded-xl border ${
                isDark
                  ? "bg-[#111916] border-white/10"
                  : "bg-white border-stone-200 shadow-xs"
              }`}
            >
              <p
                className={`text-xs font-bold ${
                  isDark ? "text-emerald-400" : "text-emerald-700"
                }`}
              >
                Topic-Locked Quiz
              </p>
              <p
                className={`text-[11px] mt-1 ${
                  isDark ? "text-slate-400" : "text-stone-500"
                }`}
              >
                Topic-specific MCQs and weak-topic tracking.
              </p>
            </div> */}
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="lg:col-span-5">
          <div
            className={`w-full max-w-md mx-auto backdrop-blur-xl p-8 rounded-2xl border shadow-2xl space-y-6 transition-colors ${
              isDark
                ? "bg-[#111916]/95 border-emerald-500/25 shadow-emerald-950/40"
                : "bg-white border-stone-200 shadow-stone-200/70"
            }`}
          >
            <div>
              <h2
                className={`text-2xl font-bold ${
                  isDark ? "text-white" : "text-stone-900"
                }`}
              >
                Welcome Back
              </h2>

              <p
                className={`text-xs mt-1 ${
                  isDark ? "text-slate-400" : "text-stone-500"
                }`}
              >
                Sign in to access your StudySphere AI workspace.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  className={`block text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${
                    isDark ? "text-slate-400" : "text-stone-600"
                  }`}
                >
                  Email Address
                </label>

                <input
                  type="email"
                  required
                  placeholder="student@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none text-sm transition ${
                    isDark
                      ? "bg-[#0a0f0d] border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500"
                      : "bg-stone-50 border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-emerald-600"
                  }`}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    className={`block text-[11px] font-semibold uppercase tracking-wider ${
                      isDark ? "text-slate-400" : "text-stone-600"
                    }`}
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className={`text-xs hover:underline ${
                      isDark
                        ? "text-emerald-400 hover:text-emerald-300"
                        : "text-emerald-600 hover:text-emerald-700"
                    }`}
                  >
                    Forgot password?
                  </Link>
                </div>

                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none text-sm transition ${
                    isDark
                      ? "bg-[#0a0f0d] border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500"
                      : "bg-stone-50 border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-emerald-600"
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                {submitting ? "Signing in..." : "Launch Workspace →"}
              </button>
            </form>

            {/* Signup Link */}
            <div
              className={`pt-2 border-t text-center ${
                isDark ? "border-white/10" : "border-stone-200"
              }`}
            >
              <p
                className={`text-xs ${
                  isDark ? "text-slate-400" : "text-stone-600"
                }`}
              >
                New student?{" "}
                <Link
                  to="/signup"
                  className={`font-semibold hover:underline ${
                    isDark
                      ? "text-emerald-400 hover:text-emerald-300"
                      : "text-emerald-600 hover:text-emerald-700"
                  }`}
                >
                  Create a free workspace account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className={`border-t py-4 px-6 text-center text-xs ${
          isDark
            ? "border-white/10 text-slate-500"
            : "border-stone-200 text-stone-500"
        }`}
      >
        StudySphere AI • Grounded Academic Retrieval &amp; Adaptive Assessment
        Platform
      </footer>
    </div>
  );
}