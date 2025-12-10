"use client";

import { useEffect, useRef } from "react";
import { useCanvasState } from "@/lib/canvas-core/canvasState";
import { useToolStore } from "@/zustand/toolStore";

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
    spacePressed: false,
  });
  const toolRef = useRef(useToolStore.getState().tool);

  // Keep tool in sync without causing re-renders.
  useEffect(() => {
    const unsub = useToolStore.subscribe((val) => {
      toolRef.current = val.tool;
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onKeyDown = (e) => {
      if (e.code === "Space") {
        state.current.spacePressed = true;
      }
    };
    const onKeyUp = (e) => {
      if (e.code === "Space") {
        state.current.spacePressed = false;
      }
    };

    const start = (e) => {
      const tool = toolRef.current;
      const wantsPan = tool === "hand" || state.current.spacePressed || e.button === 1 || e.buttons === 4;
      if (!wantsPan) return;
      if (e.button !== 0 && e.button !== 1) return;
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
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      el.removeEventListener("mousedown", start);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", end);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [containerRef, setPan]);

  return { pan, isPanning: state.current.isDragging };
}
