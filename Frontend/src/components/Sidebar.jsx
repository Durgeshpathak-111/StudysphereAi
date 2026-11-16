import React from 'react';
import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/subjects', label: 'Subjects & Units' },
  { to: '/documents', label: 'Study Materials' },
  { to: '/chat', label: 'RAG Study Chatbot' },
  { to: '/notes', label: 'Smart Notes & Organizer' },
  { to: '/quizzes', label: 'AI Quiz Engine' },
  { to: '/pyq', label: 'Syllabus & PYQ Intel' },
  { to: '/analytics', label: 'Knowledge Gaps & Plan' },
  { to: '/profile', label: 'Student Profile' }
];

export default function Sidebar({ open, onClose, dark }) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 border-r transform transition-transform md:static md:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      } ${dark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-stone-200'}`}
    >
      <div className="h-16 px-6 flex items-center justify-between border-b border-inherit">
        <div>
          <span className="font-bold text-lg tracking-tight text-emerald-600">StudySphere AI</span>
          <p className="text-[10px] opacity-60">Academic RAG Workspace</p>
        </div>
        <button onClick={onClose} className="md:hidden text-xs px-2 py-1 rounded border border-inherit">
          Close
        </button>
      </div>

      <nav className="p-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `block px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : dark
                  ? 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}