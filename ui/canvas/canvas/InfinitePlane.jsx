"use client";

import { forwardRef } from "react";
import { useCanvasState } from "@/engine/canvas/canvasState";

// Large world plane with pan/zoom applied (Figma-style).
const InfinitePlane = forwardRef(({ children }, ref) => {
  const pan = useCanvasState((s) => s.pan);
  const zoom = useCanvasState((s) => s.zoom);

  return (
    <div
      ref={ref}
      className="absolute"
      style={{
        left: "-5000000px",
        top: "-5000000px",
        width: "10000000px",
        height: "10000000px",
        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        transformOrigin: "0 0",
      }}
    >
      {children}
    </div>
  );
});

InfinitePlane.displayName = "InfinitePlane";

export default InfinitePlane;
