"use client";

import TimelineContainer from "@/components/timeline/TimelineContainer";
import { useEffect } from "react";
import { useTimelineStore } from "@/zustand/useTimelineStore";

export default function VideoTimeline() {
  const tracks = useTimelineStore((s) => s.tracks);
  const setTracks = useTimelineStore((s) => s.setTracks);
  const addClip = useTimelineStore((s) => s.addClip);

  useEffect(() => {
    if (!tracks?.length) {
      setTracks([
        { id: "v1", type: "video", name: "Video 1", clips: [] },
        { id: "a1", type: "audio", name: "Audio 1", clips: [] },
        { id: "fx1", type: "effect", name: "Effects", clips: [] },
      ]);
    }
  }, [tracks?.length, setTracks]);

  const handleDropClip = (trackId, asset, start) => {
    const duration =
      asset?.duration && asset.duration > 0 ? asset.duration : asset?.length || 2000;

    addClip(trackId, {
      assetId: asset._id || asset.id,
      src: asset.url,
      type: asset.type,
      name: asset.name,
      start,
      duration,
    });
  };

  return (
    <div className="w-full h-full bg-[#111] border-t border-neutral-700">
      <TimelineContainer tracks={tracks} onDropClip={handleDropClip} />
    </div>
  );
}
