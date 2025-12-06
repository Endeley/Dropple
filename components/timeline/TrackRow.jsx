"use client";

import ClipItem from "./ClipItem";
import KeyframeDot from "./KeyframeDot";

export default function TrackRow({ track }) {
  return (
    <div className="h-12 border-b border-neutral-800 flex items-center relative">
      <div className="w-40 px-3 text-sm text-neutral-400 truncate">{track.name || "Track"}</div>
      <div className="flex-1 relative">
        {(track.clips || []).map((clip) => (
          <ClipItem key={clip.id} clip={clip} />
        ))}
        {(track.keyframes || []).map((kf) => (
          <KeyframeDot key={kf.id} keyframe={kf} />
        ))}
      </div>
    </div>
  );
}
