"use client";

import { useEffect, useMemo, useState } from "react";
import AssetLibrary from "@/components/library/AssetLibrary";
import { useTimelineStore } from "@/zustand/useTimelineStore";

export default function VideoTools() {
  const tabs = ["Media", "Transitions", "Effects", "Titles", "Audio", "Templates"];
  const [active, setActive] = useState("Media");
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

  const defaultVideoTrackId = useMemo(() => {
    if (tracks?.length) {
      return tracks.find((t) => t.type === "video")?.id || tracks[0].id;
    }
    return "v1";
  }, [tracks]);

  const handleAddAsset = (asset) => {
    const duration =
      asset?.duration && asset.duration > 0 ? asset.duration : asset?.length || 2000;
    addClip(defaultVideoTrackId, {
      assetId: asset._id || asset.id,
      src: asset.url,
      type: asset.type,
      name: asset.name,
      start: 0,
      duration,
    });
  };

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      <div className="space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`w-full px-3 py-2 text-left rounded text-sm transition ${
              active === tab ? "bg-neutral-800 text-white" : "hover:bg-neutral-800 text-neutral-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {active === "Media" && <AssetLibrary onSelect={handleAddAsset} />}

      {active !== "Media" && (
        <div className="text-sm text-neutral-500 px-2">
          {active} panel coming soon.
        </div>
      )}
    </div>
  );
}
