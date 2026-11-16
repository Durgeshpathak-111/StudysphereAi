import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState({
    fullName: user?.fullName || '',
    university: user?.university || '',
    college: user?.college || '',
    course: user?.course || '',
    branch: user?.branch || '',
    semester: user?.semester || 1
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [statusMsg, setStatusMsg] = useState('');

  const handleProfileSave = async (e) => {
    e.preventDefault();
    const { data } = await api.put('/auth/profile', profile);
    setUser(data.data.user);
    setStatusMsg('Profile updated.');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/change-password', passwords);
      setPasswords({ currentPassword: '', newPassword: '' });
      setStatusMsg('Password changed successfully.');
    } catch (err) {
      setStatusMsg(err.response?.data?.message || 'Password update failed');
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Student Profile & Security</h1>
      {statusMsg && <div className="p-3 rounded-lg bg-emerald-600/15 text-emerald-600 text-sm">{statusMsg}</div>}

      <form onSubmit={handleProfileSave} className="p-6 rounded-xl border border-current/10 space-y-4">
        <h2 className="font-semibold">Academic Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            value={profile.fullName}
            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
            placeholder="Full Name"
            className="px-3 py-2 rounded-lg border border-current/20 bg-transparent text-sm"
          />
          <input
            value={profile.university}
            onChange={(e) => setProfile({ ...profile, university: e.target.value })}
            placeholder="University"
            className="px-3 py-2 rounded-lg border border-current/20 bg-transparent text-sm"
          />
          <input
            value={profile.college}
            onChange={(e) => setProfile({ ...profile, college: e.target.value })}
            placeholder="College"
            className="px-3 py-2 rounded-lg border border-current/20 bg-transparent text-sm"
          />
          <input
            type="number"
            min={1}
            max={12}
            value={profile.semester}
            onChange={(e) => setProfile({ ...profile, semester: Number(e.target.value) })}
            placeholder="Semester"
            className="px-3 py-2 rounded-lg border border-current/20 bg-transparent text-sm"
          />
        </div>
        <button className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium">
          Save Profile
        </button>
      </form>

      <form onSubmit={handlePasswordChange} className="p-6 rounded-xl border border-current/10 space-y-4">
        <h2 className="font-semibold">Change Password</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="password"
            required
            placeholder="Current Password"
            value={passwords.currentPassword}
            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
            className="px-3 py-2 rounded-lg border border-current/20 bg-transparent text-sm"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="New Password"
            value={passwords.newPassword}
            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
            className="px-3 py-2 rounded-lg border border-current/20 bg-transparent text-sm"
          />
        </div>
        <button className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium">
          Update Password
        </button>
      </form>
    </div>
  );
}





// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useAuth } from '../context/AuthContext';

// export default function ProfilePage() {
//   const { user, setUser, token } = useAuth();

//   const [profileForm, setProfileForm] = useState({
//     fullName: '',
//     university: '',
//     college: '',
//     course: 'B.Tech',
//     branch: 'Computer Science',
//     semester: 1,
//   });

//   const [aiPrefs, setAiPrefs] = useState(() => {
//     try {
//       const saved = localStorage.getItem('studysphere-ai-prefs');
//       return saved
//         ? JSON.parse(saved)
//         : {
//             defaultMode: 'english',
//             targetGoal: 'University Semester Exams',
//             dailyMinutes: 60,
//           };
//     } catch {
//       return {
//         defaultMode: 'english',
//         targetGoal: 'University Semester Exams',
//         dailyMinutes: 60,
//       };
//     }
//   });

//   const [passwordForm, setPasswordForm] = useState({
//     currentPassword: '',
//     newPassword: '',
//   });

//   const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
//   const [prefsMsg, setPrefsMsg] = useState('');
//   const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
//   const [savingProfile, setSavingProfile] = useState(false);
//   const [savingPassword, setSavingPassword] = useState(false);

//   useEffect(() => {
//     if (user) {
//       setProfileForm({
//         fullName: user.fullName || '',
//         university: user.university || '',
//         college: user.college || '',
//         course: user.course || 'B.Tech',
//         branch: user.branch || 'Computer Science',
//         semester: user.semester || 1,
//       });
//     }
//   }, [user]);

//   const authHeaders = {
//     headers: {
//       Authorization: `Bearer ${token || localStorage.getItem('token')}`,
//     },
//   };

//   const handleProfileSave = async (e) => {
//     e.preventDefault();
//     setProfileMsg({ type: '', text: '' });
//     setSavingProfile(true);
//     try {
//       const res = await axios.put(
//         '/api/auth/profile',
//         profileForm,
//         authHeaders
//       );
//       if (setUser && res.data?.user) {
//         setUser(res.data.user);
//       }
//       setProfileMsg({
//         type: 'success',
//         text: 'Academic profile updated successfully.',
//       });
//     } catch (err) {
//       setProfileMsg({
//         type: 'error',
//         text: err.response?.data?.message || 'Failed to update profile.',
//       });
//     } finally {
//       setSavingProfile(false);
//     }
//   };

//   const handlePrefsSave = (e) => {
//     e.preventDefault();
//     localStorage.setItem('studysphere-ai-prefs', JSON.stringify(aiPrefs));
//     setPrefsMsg('AI tutor preferences saved.');
//     setTimeout(() => setPrefsMsg(''), 3000);
//   };

//   const handlePasswordUpdate = async (e) => {
//     e.preventDefault();
//     setPasswordMsg({ type: '', text: '' });
//     setSavingPassword(true);
//     try {
//       await axios.put(
//         '/api/auth/change-password',
//         passwordForm,
//         authHeaders
//       );
//       setPasswordForm({ currentPassword: '', newPassword: '' });
//       setPasswordMsg({
//         type: 'success',
//         text: 'Password updated successfully.',
//       });
//     } catch (err) {
//       setPasswordMsg({
//         type: 'error',
//         text: err.response?.data?.message || 'Could not update password.',
//       });
//     } finally {
//       setSavingPassword(false);
//     }
//   };

//   const initials = (profileForm.fullName || 'Student')
//     .split(' ')
//     .map((n) => n[0])
//     .join('')
//     .toUpperCase()
//     .slice(0, 2);

//   const inputClass =
//     'w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-[#0a0f0d] text-sm text-stone-900 dark:text-slate-100 focus:border-emerald-500 outline-none transition';

//   const labelClass =
//     'block text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400 mb-1.5';

//   return (
//     <div className="max-w-5xl space-y-6 pb-10">
//       {/* Page Title */}
//       <div>
//         <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
//           Student Profile &amp; Security
//         </h1>
//         <p className="text-xs text-stone-500 dark:text-slate-400 mt-1">
//           Manage your academic credentials, AI explanation defaults, and account security
//         </p>
//       </div>

//       {/* Top Student Summary Banner */}
//       <div className="p-6 rounded-2xl bg-white dark:bg-[#111916] border border-stone-200 dark:border-emerald-500/20 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div className="flex items-center gap-4">
//           <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-emerald-500/20 shrink-0">
//             {initials}
//           </div>
//           <div>
//             <div className="flex flex-wrap items-center gap-2">
//               <h2 className="text-lg font-bold text-stone-900 dark:text-white">
//                 {profileForm.fullName || 'Student'}
//               </h2>
//               <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
//                 Semester {profileForm.semester}
//               </span>
//             </div>
//             <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
//               {profileForm.course} • {profileForm.branch}
//               {profileForm.university ? ` • ${profileForm.university.toUpperCase()}` : ''}
//             </p>
//             <p className="text-xs text-stone-400 dark:text-slate-500 mt-0.5">
//               {user?.email || 'Registered Student Account'}
//             </p>
//           </div>
//         </div>

//         <div className="flex items-center gap-3 self-start sm:self-center">
//           <div className="px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-[#0a0f0d] border border-stone-200 dark:border-white/10 text-right">
//             <p className="text-[10px] uppercase tracking-wider text-stone-400">
//               Default Tutor Mode
//             </p>
//             <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 capitalize mt-0.5">
//               {aiPrefs.defaultMode === 'exam'
//                 ? 'Exam Answer'
//                 : aiPrefs.defaultMode}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Main Grid: Academic Details + AI Preferences */}
//       <div className="grid lg:grid-cols-12 gap-6">
//         {/* Academic Details Card */}
//         <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-[#111916] border border-stone-200 dark:border-white/10 shadow-xs space-y-5">
//           <div>
//             <h3 className="text-base font-bold text-stone-900 dark:text-white">
//               Academic Details
//             </h3>
//             <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
//               Used to contextualize your syllabus, subjects, and semester materials
//             </p>
//           </div>

//           {profileMsg.text && (
//             <div
//               className={`p-3 rounded-xl text-xs border ${
//                 profileMsg.type === 'success'
//                   ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-300'
//                   : 'bg-red-500/10 border-red-500/25 text-red-500'
//               }`}
//             >
//               {profileMsg.text}
//             </div>
//           )}

//           <form onSubmit={handleProfileSave} className="grid sm:grid-cols-2 gap-4">
//             <div className="sm:col-span-2">
//               <label className={labelClass}>Full Name</label>
//               <input
//                 required
//                 value={profileForm.fullName}
//                 onChange={(e) =>
//                   setProfileForm({ ...profileForm, fullName: e.target.value })
//                 }
//                 className={inputClass}
//               />
//             </div>

//             <div className="sm:col-span-2">
//               <label className={labelClass}>Registered Email (Read-Only)</label>
//               <input
//                 disabled
//                 value={user?.email || ''}
//                 className={`${inputClass} opacity-60 cursor-not-allowed`}
//               />
//             </div>

//             <div>
//               <label className={labelClass}>University</label>
//               <input
//                 placeholder="e.g. KMCLU / AKTU"
//                 value={profileForm.university}
//                 onChange={(e) =>
//                   setProfileForm({ ...profileForm, university: e.target.value })
//                 }
//                 className={inputClass}
//               />
//             </div>

//             <div>
//               <label className={labelClass}>College / Institute</label>
//               <input
//                 placeholder="Institute Name"
//                 value={profileForm.college}
//                 onChange={(e) =>
//                   setProfileForm({ ...profileForm, college: e.target.value })
//                 }
//                 className={inputClass}
//               />
//             </div>

//             <div>
//               <label className={labelClass}>Course &amp; Branch</label>
//               <input
//                 value={profileForm.branch}
//                 onChange={(e) =>
//                   setProfileForm({ ...profileForm, branch: e.target.value })
//                 }
//                 className={inputClass}
//               />
//             </div>

//             <div>
//               <label className={labelClass}>Current Semester</label>
//               <input
//                 type="number"
//                 min={1}
//                 max={12}
//                 value={profileForm.semester}
//                 onChange={(e) =>
//                   setProfileForm({
//                     ...profileForm,
//                     semester: Number(e.target.value),
//                   })
//                 }
//                 className={inputClass}
//               />
//             </div>

//             <div className="sm:col-span-2 pt-1">
//               <button
//                 type="submit"
//                 disabled={savingProfile}
//                 className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold text-xs transition cursor-pointer"
//               >
//                 {savingProfile ? 'Saving...' : 'Save Academic Profile'}
//               </button>
//             </div>
//           </form>
//         </div>

//         {/* Right Column: AI Study Preferences + Security */}
//         <div className="lg:col-span-5 space-y-6">
//           {/* AI Study Preferences Card */}
//           <div className="p-6 rounded-2xl bg-white dark:bg-[#111916] border border-stone-200 dark:border-white/10 shadow-xs space-y-4">
//             <div>
//               <h3 className="text-base font-bold text-stone-900 dark:text-white">
//                 AI Tutor Preferences
//               </h3>
//               <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
//                 Customize default response style and study goals
//               </p>
//             </div>

//             {prefsMsg && (
//               <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-300 text-xs">
//                 {prefsMsg}
//               </div>
//             )}

//             <form onSubmit={handlePrefsSave} className="space-y-3.5">
//               <div>
//                 <label className={labelClass}>Default Explanation Mode</label>
//                 <select
//                   value={aiPrefs.defaultMode}
//                   onChange={(e) =>
//                     setAiPrefs({ ...aiPrefs, defaultMode: e.target.value })
//                   }
//                   className={inputClass}
//                 >
//                   <option value="english">Simple English</option>
//                   <option value="hinglish">Hinglish (Conceptual)</option>
//                   <option value="exam">University Exam Answer</option>
//                 </select>
//               </div>

//               <div>
//                 <label className={labelClass}>Primary Academic Goal</label>
//                 <select
//                   value={aiPrefs.targetGoal}
//                   onChange={(e) =>
//                     setAiPrefs({ ...aiPrefs, targetGoal: e.target.value })
//                   }
//                   className={inputClass}
//                 >
//                   <option value="University Semester Exams">
//                     University Semester Exams
//                   </option>
//                   <option value="Mid-Semester Revision">
//                     Mid-Semester Revision
//                   </option>
//                   <option value="Technical Interview & Core CS">
//                     Technical Interview &amp; Core CS
//                   </option>
//                 </select>
//               </div>

//               <div>
//                 <label className={labelClass}>Daily Study Target (Minutes)</label>
//                 <input
//                   type="number"
//                   min={15}
//                   max={480}
//                   step={15}
//                   value={aiPrefs.dailyMinutes}
//                   onChange={(e) =>
//                     setAiPrefs({
//                       ...aiPrefs,
//                       dailyMinutes: Number(e.target.value),
//                     })
//                   }
//                   className={inputClass}
//                 />
//               </div>

//               <button
//                 type="submit"
//                 className="px-4 py-2 rounded-xl border border-emerald-500/35 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold text-xs transition cursor-pointer"
//               >
//                 Save Preferences
//               </button>
//             </form>
//           </div>

//           {/* Change Password Card */}
//           <div className="p-6 rounded-2xl bg-white dark:bg-[#111916] border border-stone-200 dark:border-white/10 shadow-xs space-y-4">
//             <div>
//               <h3 className="text-base font-bold text-stone-900 dark:text-white">
//                 Security &amp; Password
//               </h3>
//               <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
//                 Update your workspace login password
//               </p>
//             </div>

//             {passwordMsg.text && (
//               <div
//                 className={`p-3 rounded-xl text-xs border ${
//                   passwordMsg.type === 'success'
//                     ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-300'
//                     : 'bg-red-500/10 border-red-500/25 text-red-500'
//                 }`}
//               >
//                 {passwordMsg.text}
//               </div>
//             )}

//             <form onSubmit={handlePasswordUpdate} className="space-y-3.5">
//               <div>
//                 <label className={labelClass}>Current Password</label>
//                 <input
//                   type="password"
//                   required
//                   placeholder="••••••••"
//                   value={passwordForm.currentPassword}
//                   onChange={(e) =>
//                     setPasswordForm({
//                       ...passwordForm,
//                       currentPassword: e.target.value,
//                     })
//                   }
//                   className={inputClass}
//                 />
//               </div>

//               <div>
//                 <label className={labelClass}>New Password (min 6 chars)</label>
//                 <input
//                   type="password"
//                   required
//                   minLength={6}
//                   placeholder="••••••••"
//                   value={passwordForm.newPassword}
//                   onChange={(e) =>
//                     setPasswordForm({
//                       ...passwordForm,
//                       newPassword: e.target.value,
//                     })
//                   }
//                   className={inputClass}
//                 />
//               </div>

//               <button
//                 type="submit"
//                 disabled={savingPassword}
//                 className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold text-xs transition cursor-pointer"
//               >
//                 {savingPassword ? 'Updating...' : 'Update Password'}
//               </button>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }