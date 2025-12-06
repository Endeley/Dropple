"use client";

export default function ModeBottomPanel({ modeKey }) {
  return (
    <div className="border-t border-slate-800 bg-slate-900/70 px-4 py-2 text-xs text-slate-300">
      Bottom Panel — timeline, audio, inspectors for <span className="font-semibold">{modeKey}</span>
    </div>
  );
}
