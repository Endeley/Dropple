"use client";

export default function ModeCanvas({ modeKey }) {
  return (
    <div className="flex-1 min-h-0 bg-slate-950/70 p-4">
      <div className="h-full rounded border border-slate-800 bg-slate-900/60 p-6 text-slate-200">
        <p className="text-xs uppercase tracking-wide text-slate-500">Canvas</p>
        <h2 className="text-lg font-semibold text-white">Workspace: {modeKey}</h2>
        <p className="mt-2 text-slate-400 text-sm">
          Drop in your mode-specific canvas (2D/3D/video/audio) components here.
        </p>
      </div>
    </div>
  );
}
