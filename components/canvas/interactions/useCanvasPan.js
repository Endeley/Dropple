"use client";

import { useEffect, useRef } from "react";
import { useCanvasState } from "@/lib/canvas-core/canvasState";

// Drag-to-pan with inertia (Figma-style) for the builder canvas.
export default function useCanvasPan(containerRef) {
  const setPan = useCanvasState((s) => s.setPan);
  const pan = useCanvasState((s) => s.pan);

  const state = useRef({
    isDragging: false,
    lastX: 0,
    lastY: 0,
    vx: 0,
    vy: 0,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const start = (e) => {
      if (e.button !== 0) return;
      state.current.isDragging = true;
      state.current.lastX = e.clientX;
      state.current.lastY = e.clientY;
    };

    const move = (e) => {
      if (!state.current.isDragging) return;
      const dx = e.clientX - state.current.lastX;
      const dy = e.clientY - state.current.lastY;
      state.current.vx = dx;
      state.current.vy = dy;
      state.current.lastX = e.clientX;
      state.current.lastY = e.clientY;
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
    };

    const end = () => {
      if (!state.current.isDragging) return;
      state.current.isDragging = false;
      let { vx, vy } = state.current;
      const inertia = () => {
        vx *= 0.93;
        vy *= 0.93;
        if (Math.abs(vx) < 0.1 && Math.abs(vy) < 0.1) return;
        setPan((p) => ({ x: p.x + vx, y: p.y + vy }));
        requestAnimationFrame(inertia);
      };
      requestAnimationFrame(inertia);
    };

    el.addEventListener("mousedown", start);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", end);

    return () => {
      el.removeEventListener("mousedown", start);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", end);
    };
  }, [containerRef, setPan]);

  return { pan, isPanning: state.current.isDragging };
}
