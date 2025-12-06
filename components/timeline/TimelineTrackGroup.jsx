"use client";

import TimelineTrack from "./TimelineTrack";

export default function TimelineTrackGroup({ tracks, pxPerMs, width, label }) {
  if (!tracks?.length) return null;

  return (
    <div className="border-b border-neutral-900">
      <div className="flex items-center gap-3 bg-neutral-900/70 px-3 py-2 text-xs font-semibold uppercase text-neutral-400">
        <span>{label || "Component"}</span>
        <span className="rounded bg-neutral-800 px-2 py-1 font-mono text-[10px] text-neutral-200">
          {tracks.length} track{tracks.length > 1 ? "s" : ""}
        </span>
      </div>
      <div>
        {tracks.map((t) => (
          <TimelineTrack key={t.id} layer={t} pxPerMs={pxPerMs} width={width} />
        ))}
      </div>
    </div>
  );
}
