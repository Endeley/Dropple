"use client";

import SelectionBox from "./SelectionBox";
import SelectionOverlay from "./SelectionOverlay";

export default function CanvasOverlays({ nodeMap = {}, selectionBox }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      <SelectionOverlay nodeMap={nodeMap} />
      <SelectionBox box={selectionBox} />
      {/* Additional overlays (guides, snapping indicators) could go here */}
    </div>
  );
}
