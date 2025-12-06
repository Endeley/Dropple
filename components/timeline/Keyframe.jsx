"use client";

import { useEffect, useState } from "react";
import { useTimelineStore } from "@/zustand/useTimelineStore";

export default function Keyframe({ frame, trackId, pxPerMs = 0.1, duration = 5000 }) {
  const moveKeyframe = useTimelineStore((s) => s.moveKeyframe);
  const openCurveEditor = useTimelineStore((s) => s.openCurveEditor);
  const [dragging, setDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startTime, setStartTime] = useState(frame.t || 0);

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e) => {
      const deltaPx = e.clientX - startX;
      const deltaMs = deltaPx / pxPerMs;
      const nextTime = Math.max(0, Math.min(duration, startTime + deltaMs));
      moveKeyframe(trackId, frame.id, nextTime);
    };
    const handleUp = () => {
      setDragging(false);
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [dragging, frame.id, moveKeyframe, pxPerMs, startTime, startX, duration, trackId]);

  return (
    <div
      className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 cursor-ew-resize bg-yellow-400 shadow ring-1 ring-yellow-500"
      style={{ left: `${(frame.t || 0) * pxPerMs}px` }}
      title={`t=${Math.round(frame.t || 0)}ms`}
      onMouseDown={(e) => {
        e.stopPropagation();
        setStartX(e.clientX);
        setStartTime(frame.t || 0);
        setDragging(true);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        openCurveEditor(trackId, frame.id);
      }}
    />
  );
}
