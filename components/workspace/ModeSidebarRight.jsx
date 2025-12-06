"use client";

export default function ModeSidebarRight({ modeKey }) {
  return (
    <aside className="w-72 border-l border-slate-800 bg-slate-900/60 p-3 text-sm text-slate-200">
      <div className="font-semibold text-slate-100">Inspector</div>
      <p className="mt-2 text-slate-400 text-xs">
        Configure properties for <strong>{modeKey}</strong> components.
      </p>
    </aside>
  );
}
