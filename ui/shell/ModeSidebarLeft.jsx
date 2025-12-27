"use client";

export default function ModeSidebarLeft({ modeKey }) {
  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/60 p-3 space-y-3 text-sm text-slate-200">
      <div className="font-semibold text-slate-100">Layers / Assets</div>
      <div className="rounded border border-slate-800 bg-slate-900 p-3">
        <p className="text-xs text-slate-400">Mode</p>
        <p className="font-medium">{modeKey}</p>
      </div>
      <div className="rounded border border-slate-800 bg-slate-900 p-3 text-slate-400">
        Sidebar controls go here.
      </div>
    </aside>
  );
}
