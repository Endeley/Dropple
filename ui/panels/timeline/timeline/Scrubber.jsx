"use client";

import { useTimelineStore } from "@/runtime/stores/useTimelineStore";

export default function Scrubber() {
  const currentTime = useTimelineStore((s) => s.currentTime);

  return (
    <div
      className="absolute top-0 bottom-0 w-[2px] bg-red-500 pointer-events-none"
      style={{ left: currentTime }}
    />
  );
}
