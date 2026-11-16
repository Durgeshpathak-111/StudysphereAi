import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    university: '',
    college: '',
    course: 'B.Tech',
    branch: 'Computer Science',
    semester: 1
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 px-4 py-8">
      <div className="max-w-lg w-full bg-white p-8 rounded-2xl border border-stone-200 shadow-sm space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Create Student Account</h1>
          <p className="text-sm text-stone-500 mt-1">Set up your semester study workspace</p>
        </div>

        {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-stone-600 mb-1">Full Name</label>
            <input
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm text-stone-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm text-stone-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Password (min 6 chars)</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm text-stone-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">University</label>
            <input
              value={form.university}
              onChange={(e) => setForm({ ...form, university: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm text-stone-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">College</label>
            <input
              value={form.college}
              onChange={(e) => setForm({ ...form, college: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm text-stone-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Course & Branch</label>
            <input
              value={form.branch}
              onChange={(e) => setForm({ ...form, branch: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm text-stone-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Semester</label>
            <input
              type="number"
              min={1}
              max={12}
              value={form.semester}
              onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm text-stone-900"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="sm:col-span-2 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm"
          >
            {submitting ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-sm text-stone-600">
          Already registered?{' '}
          <Link to="/login" className="text-emerald-600 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import { useTheme } from "../hooks/useTheme";

// export default function SignupPage() {
//   const { register } = useAuth();
//   const navigate = useNavigate();
//   const { isDark, toggleTheme } = useTheme();

//   const [form, setForm] = useState({
//     fullName: "",
//     email: "",
//     password: "",
//     university: "",
//     college: "",
//     course: "B.Tech",
//     branch: "Computer Science",
//     semester: 1,
//   });
//   const [error, setError] = useState("");
//   const [submitting, setSubmitting] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSubmitting(true);
//     try {
//       await register(form);
//       navigate("/dashboard");
//     } catch (err) {
//       setError(err.response?.data?.message || "Registration failed");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const inputClass = `w-full px-3.5 py-2.5 rounded-xl border outline-none text-sm transition ${
//     isDark
//       ? "bg-[#0a0f0d] border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500"
//       : "bg-stone-50 border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-emerald-600"
//   }`;

//   const labelClass = `block text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${
//     isDark ? "text-slate-400" : "text-stone-600"
//   }`;

//   return (
//     <div
//       className={`min-h-screen flex flex-col justify-between transition-colors duration-200 selection:bg-emerald-500/30 ${
//         isDark ? "bg-[#0a0f0d] text-slate-100" : "bg-stone-50 text-stone-900"
//       }`}
//     >
//       {/* Top Brand Header */}
//       <header
//         className={`w-full border-b backdrop-blur-md transition-colors ${
//           isDark
//             ? "border-emerald-500/15 bg-[#0a0f0d]/80"
//             : "border-stone-200 bg-white/90"
//         }`}
//       >
//         <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
//           <Link to="/login" className="flex items-center gap-3">
//             <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-extrabold text-slate-950 shadow-lg shadow-emerald-500/20">
//               S
//             </div>
//             <div>
//               <span
//                 className={`text-lg font-bold tracking-tight ${
//                   isDark ? "text-emerald-400" : "text-emerald-700"
//                 }`}
//               >
//                 StudySphere AI
//               </span>
//               <p
//                 className={`text-[11px] -mt-1 ${
//                   isDark ? "text-slate-400" : "text-stone-500"
//                 }`}
//               >
//                 Academic RAG Workspace
//               </p>
//             </div>
//           </Link>

//           <div className="flex items-center gap-3">
//             <button
//               type="button"
//               onClick={toggleTheme}
//               className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition cursor-pointer ${
//                 isDark
//                   ? "border-white/15 bg-white/5 text-slate-200 hover:border-emerald-500/40"
//                   : "border-stone-300 bg-stone-100 text-stone-700 hover:bg-stone-200"
//               }`}
//             >
//               {isDark ? "Light Mode" : "Dark Mode"}
//             </button>

//             <Link
//               to="/login"
//               className={`px-4 py-2 rounded-lg text-xs font-semibold border transition ${
//                 isDark
//                   ? "border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
//                   : "border-emerald-600/30 text-emerald-700 hover:bg-emerald-50"
//               }`}
//             >
//               Sign In
//             </Link>
//           </div>
//         </div>
//       </header>

//       {/* Main Split-Screen Container */}
//       <main className="max-w-7xl w-full mx-auto px-6 py-10 grid lg:grid-cols-12 gap-10 items-center">
//         {/* Left Side: Academic Workspace Overview */}
//         <div className="lg:col-span-5 space-y-6">
//           <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500">
//             Student Onboarding
//           </p>

//           <h1
//             className={`text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight ${
//               isDark ? "text-white" : "text-stone-900"
//             }`}
//           >
//             Organize Your Semester Notes &amp; Study Smarter.
//           </h1>

//           <p
//             className={`text-sm sm:text-base leading-relaxed ${
//               isDark ? "text-slate-400" : "text-stone-600"
//             }`}
//           >
//             Create your personalized academic profile to isolate vector retrieval by subject, generate page-cited explanations, and track weak concepts across your semester.
//           </p>

//           <div
//             className={`space-y-3 pt-4 border-t text-sm ${
//               isDark
//                 ? "border-white/10 text-slate-300"
//                 : "border-stone-200 text-stone-700"
//             }`}
//           >
//             <div className="flex items-center gap-3">
//               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
//               <span>Dedicated subject &amp; unit-wise PDF indexing</span>
//             </div>
//             <div className="flex items-center gap-3">
//               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
//               <span>Verified source citations on every AI response</span>
//             </div>
//             <div className="flex items-center gap-3">
//               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
//               <span>Automated quizzes &amp; exam readiness tracking</span>
//             </div>
//           </div>
//         </div>

//         {/* Right Side: Registration Card */}
//         <div className="lg:col-span-7">
//           <div
//             className={`w-full max-w-xl mx-auto backdrop-blur-xl p-8 rounded-2xl border shadow-2xl space-y-6 transition-colors ${
//               isDark
//                 ? "bg-[#111916]/95 border-emerald-500/25 shadow-emerald-950/40"
//                 : "bg-white border-stone-200 shadow-stone-200/70"
//             }`}
//           >
//             <div>
//               <h2
//                 className={`text-2xl font-bold ${
//                   isDark ? "text-white" : "text-stone-900"
//                 }`}
//               >
//                 Create Student Account
//               </h2>
//               <p
//                 className={`text-xs mt-1 ${
//                   isDark ? "text-slate-400" : "text-stone-500"
//                 }`}
//               >
//                 Set up your semester study workspace
//               </p>
//             </div>

//             {error && (
//               <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
//                 {error}
//               </div>
//             )}

//             <form
//               onSubmit={handleSubmit}
//               className="grid grid-cols-1 sm:grid-cols-2 gap-4"
//             >
//               <div className="sm:col-span-2">
//                 <label className={labelClass}>Full Name</label>
//                 <input
//                   required
//                   placeholder="Enter your full name"
//                   value={form.fullName}
//                   onChange={(e) =>
//                     setForm({ ...form, fullName: e.target.value })
//                   }
//                   className={inputClass}
//                 />
//               </div>

//               <div>
//                 <label className={labelClass}>Email Address</label>
//                 <input
//                   type="email"
//                   required
//                   placeholder="student@university.edu"
//                   value={form.email}
//                   onChange={(e) => setForm({ ...form, email: e.target.value })}
//                   className={inputClass}
//                 />
//               </div>

//               <div>
//                 <label className={labelClass}>Password (min 6 chars)</label>
//                 <input
//                   type="password"
//                   required
//                   minLength={6}
//                   placeholder="••••••••"
//                   value={form.password}
//                   onChange={(e) =>
//                     setForm({ ...form, password: e.target.value })
//                   }
//                   className={inputClass}
//                 />
//               </div>

//               <div>
//                 <label className={labelClass}>University</label>
//                 <input
//                   placeholder="e.g. KMCLU / AKTU"
//                   value={form.university}
//                   onChange={(e) =>
//                     setForm({ ...form, university: e.target.value })
//                   }
//                   className={inputClass}
//                 />
//               </div>

//               <div>
//                 <label className={labelClass}>College / Department</label>
//                 <input
//                   placeholder="Faculty of Engineering"
//                   value={form.college}
//                   onChange={(e) =>
//                     setForm({ ...form, college: e.target.value })
//                   }
//                   className={inputClass}
//                 />
//               </div>

//               <div>
//                 <label className={labelClass}>Course &amp; Branch</label>
//                 <input
//                   value={form.branch}
//                   onChange={(e) => setForm({ ...form, branch: e.target.value })}
//                   className={inputClass}
//                 />
//               </div>

//               <div>
//                 <label className={labelClass}>Semester</label>
//                 <input
//                   type="number"
//                   min={1}
//                   max={12}
//                   value={form.semester}
//                   onChange={(e) =>
//                     setForm({ ...form, semester: Number(e.target.value) })
//                   }
//                   className={inputClass}
//                 />
//               </div>

//               <button
//                 type="submit"
//                 disabled={submitting}
//                 className="sm:col-span-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20 cursor-pointer mt-2"
//               >
//                 {submitting ? "Creating Account..." : "Create Workspace →"}
//               </button>
//             </form>

//             <div
//               className={`pt-2 border-t text-center ${
//                 isDark ? "border-white/10" : "border-stone-200"
//               }`}
//             >
//               <p
//                 className={`text-xs ${
//                   isDark ? "text-slate-400" : "text-stone-600"
//                 }`}
//               >
//                 Already registered?{" "}
//                 <Link
//                   to="/login"
//                   className={`font-semibold hover:underline ${
//                     isDark
//                       ? "text-emerald-400 hover:text-emerald-300"
//                       : "text-emerald-600 hover:text-emerald-700"
//                   }`}
//                 >
//                   Sign in to your account
//                 </Link>
//               </p>
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* Footer */}
//       <footer
//         className={`border-t py-4 px-6 text-center text-xs ${
//           isDark
//             ? "border-white/10 text-slate-500"
//             : "border-stone-200 text-stone-500"
//         }`}
//       >
//         StudySphere AI • Grounded Academic Retrieval &amp; Adaptive Assessment
//         Platform
//       </footer>
//     </div>
//   );
// }