"use client";

import { useEffect } from "react";
import { useCanvasState } from "@/engine/canvas/canvasState";

const clampZoom = (z) => Math.min(8, Math.max(0.1, z));

// Wheel + pinch zoom centered on cursor (Figma-like) for builder canvas.
export default function useCanvasZoom(containerRef) {
  const zoom = useCanvasState((s) => s.zoom);
  const pan = useCanvasState((s) => s.pan);
  const setZoom = useCanvasState((s) => s.setZoom);
  const setPan = useCanvasState((s) => s.setPan);

  useEffect(() => {
    const el = containerRef.current?.parentElement || containerRef.current;
    if (!el) return;

    const onWheel = (e) => {
      e.preventDefault();

      const rect = el.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;

      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const nextZoom = clampZoom(zoom * zoomFactor);

      setPan({
        x: e.clientX - rect.left - mouseX * nextZoom,
        y: e.clientY - rect.top - mouseY * nextZoom,
      });

      setZoom(nextZoom);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [containerRef, pan, setPan, setZoom, zoom]);

  return { zoom };
}

export { clampZoom };
