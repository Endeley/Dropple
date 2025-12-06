"use client";

import SelectionBox from "./SelectionBox";
import SelectionOverlay from "./SelectionOverlay";
import GuideRenderer from "./GuideRenderer";

export default function CanvasOverlays({ nodeMap = {}, selectionBox, startResize, pan, zoom }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div
        style={{
          transform: `translate(${pan?.x || 0}px, ${pan?.y || 0}px) scale(${zoom || 1})`,
          transformOrigin: "0 0",
        }}
        className="absolute inset-0"
      >
        <GuideRenderer />
        <SelectionOverlay nodeMap={nodeMap} onResizeStart={startResize} />
        <SelectionBox box={selectionBox} />
      </div>
      {/* Additional overlays (guides, snapping indicators) could go here */}
    </div>
  );
}
