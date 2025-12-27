"use client";

import { useMemo } from "react";
import { useTimelineStore } from "@/runtime/stores/useTimelineStore";
import TimelineTrack from "./TimelineTrack";
import TimelineTrackGroup from "./TimelineTrackGroup";

export default function TimelineTracks({ pxPerMs, width }) {
  const { layers } = useTimelineStore((state) => ({ layers: state.layers }));

  const grouped = useMemo(() => {
    const map = new Map();
    layers.forEach((layer) => {
      const key = layer.targetId || "ungrouped";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(layer);
    });
    return Array.from(map.entries()).map(([key, tracks]) => ({
      key,
      tracks,
    }));
  }, [layers]);

  return (
    <div className="relative w-full flex-1 overflow-auto bg-neutral-950 text-white">
      <div style={{ minWidth: width }}>
        {layers.length === 0 && (
          <div className="mt-10 text-center text-neutral-500">No animation tracks yet</div>
        )}

        {grouped.map((group) =>
          group.key === "ungrouped" ? (
            <div key={group.key} className="border-b border-neutral-900">
              {group.tracks.map((track) => (
                <TimelineTrack key={track.id} layer={track} pxPerMs={pxPerMs} width={width} />
              ))}
            </div>
          ) : (
            <TimelineTrackGroup
              key={group.key}
              label={`Component: ${group.key}`}
              tracks={group.tracks}
              pxPerMs={pxPerMs}
              width={width}
            />
          ),
        )}
      </div>
    </div>
  );
}
