"use client";

import TimelineContainer from "./TimelineContainer";
import { useTimelineStore } from "@/runtime/stores/useTimelineStore";

export default function TimelineShell() {
  const { tracks } = useTimelineStore((s) => ({ tracks: s.tracks || s.layers || [] }));
  return <TimelineContainer tracks={tracks} />;
}
