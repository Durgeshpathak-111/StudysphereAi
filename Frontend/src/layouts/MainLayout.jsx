import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('ss_theme') === 'dark');

  useEffect(() => {
    localStorage.setItem('ss_theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <div className={`min-h-screen flex ${dark ? 'bg-zinc-950 text-zinc-100' : 'bg-stone-50 text-stone-900'}`}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} dark={dark} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          onOpenSidebar={() => setSidebarOpen(true)}
          dark={dark}
          onToggleDark={() => setDark((prev) => !prev)}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ dark }} />
        </main>
      </div>
    </div>
  );
}