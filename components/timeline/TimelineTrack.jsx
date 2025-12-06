"use client";

import Keyframe from "./Keyframe";
import { useTimelineStore } from "@/zustand/useTimelineStore";

const LABEL_WIDTH = 200;

export default function TimelineTrack({ layer, pxPerMs, width }) {
  const { duration } = useTimelineStore((s) => ({ duration: s.duration }));

  return (
    <div className="relative flex h-10 items-center border-b border-neutral-800">
      {/* Track label */}
      <div className="flex h-full w-[200px] items-center gap-2 border-r border-neutral-800 px-3 text-sm text-neutral-300">
        <span className="rounded bg-neutral-800 px-2 py-1 text-[10px] font-mono text-neutral-200">
          {layer.targetId?.slice(0, 6) || "track"}
        </span>
        <span className="truncate capitalize">{layer.property || layer.name}</span>
      </div>

      {/* Keyframe area */}
      <div className="relative flex-1" style={{ minWidth: width }}>
        {(layer.keyframes || []).map((kf) => (
          <Keyframe key={kf.id} frame={kf} trackId={layer.id} pxPerMs={pxPerMs} duration={duration} />
        ))}
      </div>
    </div>
  );
}
