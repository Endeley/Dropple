"use client";

import { useMemo, useRef } from "react";
import { useTimelineStore } from "@/zustand/useTimelineStore";
import TimelineHeader from "./TimelineHeader";
import TimelineTracks from "./TimelineTracks";
import Playhead from "./Playhead";
import CurvesEditorPanel from "./curves/CurvesEditorPanel";

const PX_PER_MS_BASE = 0.1; // 1px = 10ms

export default function TimelinePanel({ projectId = null, sceneId = null }) {
  const { duration, zoom } = useTimelineStore((state) => ({
    duration: state.duration,
    zoom: state.zoom,
  }));

  const containerRef = useRef(null);
  const { pxPerMs, width } = useMemo(() => {
    const pxPerMs = PX_PER_MS_BASE * (zoom || 1);
    const width = Math.max(800, duration * pxPerMs);
    return { pxPerMs, width };
  }, [duration, zoom]);
  const trackAreaWidth = width + 200; // include label gutter

  return (
    <div className="relative flex h-[260px] w-full flex-col border-t border-neutral-900 bg-neutral-950 text-white">
      <TimelineHeader projectId={projectId} sceneId={sceneId} />
      <div className="relative flex-1 overflow-auto" ref={containerRef}>
        <TimelineTracks pxPerMs={pxPerMs} width={trackAreaWidth} />
        <Playhead containerRef={containerRef} pxPerMs={pxPerMs} width={trackAreaWidth} />
      </div>
      <CurvesEditorPanel />
    </div>
  );
}
