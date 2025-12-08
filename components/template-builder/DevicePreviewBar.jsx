"use client";

import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";

export default function DevicePreviewBar() {
  const { setActiveBreakpoint } = useTemplateBuilderStore();

  return (
    <div className="flex gap-2 border border-slate-200 p-2 bg-white/90 backdrop-blur rounded-md shadow-sm">
      <button
        className="px-3 py-1 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-sm"
        onClick={() => setActiveBreakpoint("base")}
      >
        📱 Mobile
      </button>
      <button
        className="px-3 py-1 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-sm"
        onClick={() => setActiveBreakpoint("tablet")}
      >
        📱 Tablet
      </button>
      <button
        className="px-3 py-1 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-sm"
        onClick={() => setActiveBreakpoint("desktop")}
      >
        💻 Desktop
      </button>
      <button
        className="px-3 py-1 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-sm"
        onClick={() => setActiveBreakpoint("large")}
      >
        🖥️ Large
      </button>
    </div>
  );
}
