"use client";

import ModeSwitcher from "@/components/workspace/ModeSwitcher";
import { useTimelineStore } from "@/zustand/useTimelineStore";

export default function VideoTopBar() {
  const playing = useTimelineStore((s) => s.playing);
  const togglePlay = useTimelineStore((s) => s.togglePlay);
  const currentTime = useTimelineStore((s) => s.currentTime);
  const duration = useTimelineStore((s) => s.duration);

  const formatMs = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const secs = String(totalSeconds % 60).padStart(2, "0");
    const milli = String(Math.floor(ms % 1000)).padStart(3, "0");
    return `${mins}:${secs}.${milli}`;
  };

  return (
    <div className="flex items-center justify-between w-full px-4">
      <ModeSwitcher />
      <div className="flex items-center gap-2 text-sm text-neutral-400">
        <button
          onClick={togglePlay}
          className="px-2 py-1 rounded bg-neutral-800 text-white hover:bg-neutral-700"
        >
          {playing ? "Pause" : "Play"}
        </button>
        <span className="tabular-nums">
          {formatMs(currentTime)} / {formatMs(duration)}
        </span>
      </div>
    </div>
  );
}
