"use client";

import ModeSwitcher from "@/components/workspace/ModeSwitcher";
import { useSelectionStore } from "@/zustand/selectionStore";

export default function UIUXTopBar() {
  const deselectAll = useSelectionStore((s) => s.deselectAll);

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
        <button className="px-3 py-2 rounded-md border border-neutral-200 bg-white text-sm text-neutral-700 hover:border-violet-200 hover:bg-violet-50 transition">
          Undo
        </button>
        <button className="px-3 py-2 rounded-md border border-neutral-200 bg-white text-sm text-neutral-700 hover:border-violet-200 hover:bg-violet-50 transition">
          Redo
        </button>
        <button className="px-3 py-2 rounded-md border border-neutral-200 bg-white text-sm text-neutral-700 hover:border-violet-200 hover:bg-violet-50 transition">
          Preview
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
