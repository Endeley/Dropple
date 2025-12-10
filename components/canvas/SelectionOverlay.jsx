"use client";

import { useMemo } from "react";
import TransformControls from "./TransformControls";
import { getSelectedBounds } from "@/lib/canvas-core/selection";
import { useSelectionStore } from "@/zustand/selectionStore";

export default function SelectionOverlay({ nodeMap = {}, onResizeStart }) {
  const selectedIds = useSelectionStore((s) => s.selectedIds);
  const bounds = useMemo(() => getSelectedBounds(selectedIds, nodeMap), [selectedIds, nodeMap]);
  if (!bounds) return null;
  return (
    <div className="pointer-events-auto">
      <TransformControls bounds={bounds} onResizeStart={onResizeStart} />
    </div>
  );
}
