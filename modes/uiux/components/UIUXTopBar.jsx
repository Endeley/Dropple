"use client";

import ModeSwitcher from "@/components/workspace/ModeSwitcher";
import { useSelectionStore } from "@/zustand/selectionStore";

export default function UIUXTopBar() {
  const deselectAll = useSelectionStore((s) => s.deselectAll);

  return (
    <div className="flex items-center justify-between w-full px-4">
      <ModeSwitcher />
      <button
        onClick={deselectAll}
        className="px-2 py-1 rounded bg-neutral-800 text-white hover:bg-neutral-700 text-sm"
      >
        Clear Selection
      </button>
    </div>
  );
}
