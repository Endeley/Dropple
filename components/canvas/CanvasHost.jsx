"use client";

import CanvasGrid from "./CanvasGrid";
import CanvasRulers from "./CanvasRulers";
import CanvasOverlays from "./CanvasOverlays";

export default function CanvasHost({
  children,
  nodeMap = {},
  selectionBox = null,
}) {
  return (
    <div className="relative w-full h-full overflow-hidden bg-neutral-900">
      {/* Rulers */}
      <CanvasRulers />

      {/* Infinite Grid */}
      <CanvasGrid />

      {/* Canvas Content */}
      <div id="dropple-canvas-content" className="absolute inset-0">
        {children}
      </div>

      {/* Overlays */}
      <CanvasOverlays nodeMap={nodeMap} selectionBox={selectionBox} />
    </div>
  );
}
