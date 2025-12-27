"use client";

import ModeSwitcher from "@/ui/shell/ModeSwitcher";
import { useSelectionStore } from "@/runtime/stores/selectionStore";
import { usePageStore } from "@/runtime/stores/pageStore";

export default function UIUXTopBar({ onSaveTemplate, onPublishTemplate, onAIGenerate }) {
  const deselectAll = useSelectionStore((s) => s.deselectAll);
  const pages = usePageStore((s) => s.pages);
  const currentPageId = usePageStore((s) => s.currentPageId);
  const setViewportWidth = usePageStore((s) => s.setViewportWidth);
  const setCurrentBreakpoint = usePageStore((s) => s.setCurrentBreakpoint);
  const viewportWidth = usePageStore((s) => s.viewportWidth);
  const currentBreakpointId = usePageStore((s) => s.currentBreakpointId);

  const currentPage = pages.find((p) => p.id === currentPageId);
  const breakpoints = currentPage?.breakpoints || [];

  return (
    <div className="flex items-center justify-between w-full px-4 gap-4">
      <div className="flex items-center gap-3 overflow-x-auto">
        <ModeSwitcher />
        <div className="h-6 w-px bg-neutral-200" />
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]" />
          <span>Untitled Project</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 py-1">
          {breakpoints.map((bp) => (
            <button
              key={bp.id}
              onClick={() => setCurrentBreakpoint(bp.id)}
              className={`px-2 py-1 rounded text-xs font-semibold transition ${
                currentBreakpointId === bp.id
                  ? "bg-violet-100 text-violet-700 border border-violet-200"
                  : "text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              {bp.label || bp.id}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-md px-2 py-1">
          <input
            type="range"
            min={320}
            max={1920}
            value={viewportWidth}
            onChange={(e) => setViewportWidth(Number(e.target.value))}
            className="w-32"
          />
          <div className="text-xs font-semibold text-neutral-700 min-w-[70px] text-right">
            {Math.round(viewportWidth)} px
          </div>
        </div>
        <button className="px-3 py-2 rounded-md border border-neutral-200 bg-white text-sm text-neutral-700 hover:border-violet-200 hover:bg-violet-50 transition">
          Undo
        </button>
        <button className="px-3 py-2 rounded-md border border-neutral-200 bg-white text-sm text-neutral-700 hover:border-violet-200 hover:bg-violet-50 transition">
          Redo
        </button>
        <button
          className="px-3 py-2 rounded-md border border-neutral-200 bg-white text-sm text-neutral-700 hover:border-violet-200 hover:bg-violet-50 transition"
          onClick={onSaveTemplate}
        >
          Save Template
        </button>
        <button
          className="px-3 py-2 rounded-md border border-neutral-200 bg-white text-sm text-neutral-700 hover:border-violet-200 hover:bg-violet-50 transition"
          onClick={onPublishTemplate}
        >
          Publish
        </button>
        <button
          className="px-3 py-2 rounded-md border border-neutral-200 bg-white text-sm text-neutral-700 hover:border-violet-200 hover:bg-violet-50 transition"
          onClick={onAIGenerate}
        >
          AI Generate
        </button>
        <button
          onClick={deselectAll}
          className="px-3 py-2 rounded-md bg-violet-500/90 text-white hover:bg-violet-600 text-sm font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-violet-200"
        >
          Clear Selection
        </button>
      </div>
    </div>
  );
}
