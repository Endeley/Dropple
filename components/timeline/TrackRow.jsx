"use client";

import ClipItem from "./ClipItem";
import KeyframeDot from "./KeyframeDot";

export default function TrackRow({ track, onDropClip }) {
  return (
    <div className="h-12 border-b border-neutral-800 flex items-center relative">
      <div className="w-40 px-3 text-sm text-neutral-400 truncate">{track.name || "Track"}</div>
      <div
        className="flex-1 relative"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const raw = e.dataTransfer.getData("asset");
          if (!raw) return;
          try {
            const asset = JSON.parse(raw);
            const rect = e.currentTarget.getBoundingClientRect();
            const start = Math.max(0, e.clientX - rect.left);
            onDropClip?.(track.id, asset, start);
          } catch (err) {
            console.error("Failed to drop asset on track", err);
          }
        }}
      >
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
