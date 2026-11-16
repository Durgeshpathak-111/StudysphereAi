import React from 'react';

export function PlaceholderModule({ title, part }) {
  return (
    <div className="p-8 rounded-xl border border-current/15 space-y-2">
      <span className="text-xs font-bold uppercase text-emerald-600">{part}</span>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-sm opacity-70">Module shell ready.</p>
    </div>
  );
}