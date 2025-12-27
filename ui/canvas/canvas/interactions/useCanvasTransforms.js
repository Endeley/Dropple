"use client";

import { useCallback } from "react";

// Shared transforms for the workspace/create canvas.
export function useCanvasTransforms(containerRef, pan, zoom) {
  const toLocal = useCallback(
    (clientX, clientY) => {
      const rect = containerRef.current?.getBoundingClientRect();
      const x = (clientX - (rect?.left || 0) - pan.x) / zoom;
      const y = (clientY - (rect?.top || 0) - pan.y) / zoom;
      return { x, y };
    },
    [containerRef, pan.x, pan.y, zoom],
  );

  return { toLocal };
}
