import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onOpenSidebar, dark, onToggleDark }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header
      className={`h-16 px-4 md:px-8 border-b flex items-center justify-between ${
        dark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-stone-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="md:hidden px-3 py-1.5 rounded-lg border border-inherit text-xs font-medium"
        >
          Menu
        </button>

        <div className="text-sm">
          <span className="opacity-70">Welcome, </span>
          <span className="font-semibold">{user?.fullName || 'Student'}</span>
          {user?.semester && (
            <span className="ml-2 text-xs px-2 py-0.5 rounded bg-emerald-600/15 text-emerald-600 font-medium">
              Sem {user.semester}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          onClick={onToggleDark}
          className="px-3 py-1.5 rounded-lg border border-inherit text-xs font-medium hover:border-emerald-600 transition"
        >
          {dark ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 rounded-lg bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white text-xs font-semibold transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}