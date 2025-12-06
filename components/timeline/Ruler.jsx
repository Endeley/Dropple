"use client";

import { useRef, useState } from "react";
import { useTimelineStore } from "@/zustand/useTimelineStore";

export default function Ruler() {
  const duration = useTimelineStore((s) => s.duration);
  const setTime = useTimelineStore((s) => s.setTime);
  const [dragging, setDragging] = useState(false);
  const ref = useRef(null);

  const step = duration > 30000 ? 1000 : duration > 10000 ? 500 : 200;
  const ticks = Array.from({ length: Math.ceil(duration / step) + 1 }, (_, i) => i * step);

  const handlePointer = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const t = Math.max(0, x);
    setTime(t);
  };

  return (
    <div
      ref={ref}
      className="h-6 w-full flex border-b border-neutral-800 bg-[#222] select-none"
      onMouseDown={(e) => {
        setDragging(true);
        handlePointer(e);
      }}
      onMouseMove={(e) => {
        if (dragging) handlePointer(e);
      }}
      onMouseUp={() => setDragging(false)}
      onMouseLeave={() => setDragging(false)}
    >
      {ticks.map((t) => (
        <div
          key={t}
          className="border-r border-neutral-700 text-[10px] text-neutral-400 flex items-center justify-center"
          style={{ width: `${step}px` }}
        >
          {Math.round(t)}ms
        </div>
      ))}
    </div>
  );
}
