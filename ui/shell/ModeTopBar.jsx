"use client";

export default function ModeTopBar({ modeKey, title, subtitle }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/70 px-4 py-3">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400">Mode</p>
        <h1 className="text-lg font-semibold text-white">
          {title || modeKey}
          {subtitle ? <span className="ml-2 text-sm text-slate-400">{subtitle}</span> : null}
        </h1>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span className="rounded border border-slate-700 px-3 py-1">Workspace</span>
        <span className="rounded border border-slate-700 px-3 py-1">Templates</span>
        <span className="rounded border border-slate-700 px-3 py-1">Assets</span>
      </div>
    </div>
  );
}
