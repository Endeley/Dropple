"use client";

import ClipItem from "./ClipItem";
import KeyframeDot from "./KeyframeDot";
import { useSelectionStore } from "@/zustand/selectionStore";
import { useState } from "react";

export default function TrackRow({ track, onDropClip }) {
  const selectedIds = useSelectionStore((s) => s.selectedIds);
  const setSelectedManual = useSelectionStore((s) => s.setSelectedManual);
  const deselectAll = useSelectionStore((s) => s.deselectAll);
  const [marquee, setMarquee] = useState(null);
  const [startX, setStartX] = useState(null);

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
        onMouseDown={(e) => {
          if (e.button !== 0) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          setStartX(x);
          setMarquee({ x, width: 0 });
        }}
        onMouseMove={(e) => {
          if (startX === null || e.buttons !== 1) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const left = Math.min(startX, x);
          const width = Math.abs(x - startX);
          setMarquee({ x: left, width });
        }}
        onMouseUp={(e) => {
          if (startX === null) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const left = Math.min(startX, x);
          const width = Math.abs(x - startX);
          const end = left + width;
          const hits =
            track.clips
              ?.filter((clip) => clip.start < end && clip.start + clip.duration > left)
              .map((clip) => clip.id) || [];
          if (hits.length) {
            setSelectedManual(hits);
          } else {
            deselectAll();
          }
          setMarquee(null);
          setStartX(null);
        }}
        onMouseLeave={() => {
          setMarquee(null);
          setStartX(null);
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) deselectAll();
        }}
      >
        {(track.clips || []).map((clip) => {
          const active = selectedIds?.includes(clip.id);
          return (
            <div
              key={clip.id}
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedManual([clip.id]);
              }}
              className="absolute"
              style={{ left: clip.start, width: clip.duration, top: 0, height: "100%" }}
            >
              <ClipItem clip={clip} isActive={active} />
            </div>
          );
        })}
        {(track.keyframes || []).map((kf) => (
          <KeyframeDot key={kf.id} keyframe={kf} />
        ))}
        {marquee && marquee.width > 2 ? (
          <div
            className="absolute top-0 bottom-0 bg-blue-500/10 border border-blue-400/60 pointer-events-none"
            style={{ left: marquee.x, width: marquee.width }}
          />
        ) : null}
      </div>
    </div>
  );
}
