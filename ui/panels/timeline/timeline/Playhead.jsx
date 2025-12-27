"use client";

import { useEffect, useRef } from "react";
import { useTimelineStore } from "@/runtime/stores/useTimelineStore";

export default function Playhead({ containerRef, pxPerMs = 0.1, width = 800 }) {
  const { currentTime, setTime, duration } = useTimelineStore((state) => ({
    currentTime: state.currentTime,
    setTime: state.setTime,
    duration: state.duration,
  }));
  const playheadRef = useRef(null);

  useEffect(() => {
    const node = containerRef?.current;
    if (!node) return;
    const handleMouseDown = (e) => {
      const rect = node.getBoundingClientRect();
      const x = e.clientX - rect.left + node.scrollLeft;
      const nextTime = Math.max(0, Math.min(duration, x / pxPerMs));
      setTime(nextTime);
    };
    node.addEventListener("mousedown", handleMouseDown);
    return () => node.removeEventListener("mousedown", handleMouseDown);
  }, [containerRef, duration, pxPerMs, setTime]);

  const left = Math.max(0, Math.min(width, currentTime * pxPerMs));

  return (
    <div
      ref={playheadRef}
      className="pointer-events-none absolute top-0 bottom-0 w-[2px] bg-red-500"
      style={{ left }}
    />
  );
}
