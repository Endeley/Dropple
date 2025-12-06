"use client";

import { useEffect } from "react";
import TimelineContainer from "@/components/timeline/TimelineContainer";
import { useTimelineStore } from "@/zustand/useTimelineStore";
import { useSelectionStore } from "@/zustand/selectionStore";
import { generateWaveformFromUrl } from "@/lib/audio-core/waveform";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function PodcastTimeline() {
  const tracks = useTimelineStore((s) => s.tracks);
  const setTracks = useTimelineStore((s) => s.setTracks);
  const addClip = useTimelineStore((s) => s.addClip);
  const currentTime = useTimelineStore((s) => s.currentTime);
  const updateClip = useTimelineStore((s) => s.updateClip);
  const setSelected = useSelectionStore((s) => s.setSelected);
  const manual = useSelectionStore((s) => s.manual);
  const updateAssetMetadata = useMutation(api.updateAssetMetadata.updateAssetMetadata);

  useEffect(() => {
    if (!tracks?.length) {
      setTracks([
        { id: "main", type: "audio", name: "Main Audio", clips: [] },
        { id: "music", type: "audio", name: "Music", clips: [] },
        { id: "sfx", type: "audio", name: "SFX", clips: [] },
      ]);
    }
  }, [tracks?.length, setTracks]);

  const handleDropClip = (trackId, asset, start) => {
    const clipId = asset._id || asset.id || `clip_${Date.now().toString(16)}`;
    const duration =
      asset?.duration && asset.duration > 0 ? asset.duration : asset?.length || 2000;

    addClip(trackId, {
      id: clipId,
      assetId: asset._id || asset.id,
      src: asset.url,
      type: asset.type,
      name: asset.name,
      start,
      duration,
      waveform: asset.waveform,
    });

    if (asset.type === "audio" && !asset.waveform) {
      generateWaveformFromUrl(asset.url, 120)
        .then((wf) => {
          updateClip(trackId, clipId, { waveform: wf });
          if (asset._id) {
            updateAssetMetadata({ id: asset._id, waveform: wf }).catch(() => {});
          }
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    if (manual || !tracks?.length) return;
    const active =
      tracks
        .flatMap((t) => t.clips || [])
        .find((c) => currentTime >= c.start && currentTime <= c.start + c.duration) || null;
    if (active) {
      setSelected([active.id]);
    }
  }, [tracks, currentTime, setSelected, manual]);

  return (
    <div className="w-full h-full bg-[#111] border-t border-neutral-700">
      <TimelineContainer tracks={tracks} onDropClip={handleDropClip} />
    </div>
  );
}
