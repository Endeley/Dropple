"use client";

import { useMemo, useRef, useState } from "react";
import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";

const TIMELINE_WIDTH = 640; // px

export default function TimelinePanel({ layer }) {
  const { scrubberTime, setScrubberTime, updateKeyframeTime, addKeyframe } =
    useTemplateBuilderStore();
  const [activeAnimId, setActiveAnimId] = useState(
    layer.animations?.[0]?.id || null,
  );
  const [selectedTrack, setSelectedTrack] = useState(null);
  const containerRef = useRef(null);

  const animations = useMemo(() => layer.animations || [], [layer.animations]);
  const anim = useMemo(
    () => animations.find((a) => a.id === activeAnimId) || animations[0],
    [activeAnimId, animations],
  );

  if (!anim) return null;

  const duration = Math.max(anim.duration || 1000, 1);

  const pxPerMs = TIMELINE_WIDTH / duration;

  const convertPixelsToTime = (px) => Math.max(0, px / pxPerMs);
  const convertTimeToPercent = (time) =>
    `${Math.min(100, Math.max(0, (time / duration) * 100))}%`;

  const handleScrub = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const px = clientX - rect.left;
    setScrubberTime(convertPixelsToTime(px / rect.width * TIMELINE_WIDTH));
  };

  const handleKeyframeDrag = (e, trackProp, idx) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = e.clientX - rect.left;
    const newTime = convertPixelsToTime((px / rect.width) * TIMELINE_WIDTH);
    updateKeyframeTime(layer.id, anim.id, trackProp, idx, newTime);
  };

  return (
    <div className="space-y-2 border-t pt-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <span className="text-sm font-semibold text-slate-700">Timeline</span>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={anim.id}
            onChange={(e) => setActiveAnimId(e.target.value)}
          >
            {animations.map((a) => (
              <option key={a.id} value={a.id}>
                {a.id}
              </option>
            ))}
          </select>
        </div>
        <div className="text-xs text-slate-500">
          Duration: {Math.round(duration)} ms
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative bg-slate-900 text-white rounded border border-slate-800"
        style={{ height: 120 }}
        onMouseDown={(e) => handleScrub(e.clientX)}
      >
        <div
          className="absolute bg-red-500 w-0.5 top-0 bottom-0"
          style={{ left: convertTimeToPercent(scrubberTime) }}
        />

        <div className="absolute inset-0">
          {anim.tracks?.map((track, tIndex) => (
            <TrackRow
              key={tIndex}
              anim={anim}
              track={track}
              onDrag={(e, idx) => handleKeyframeDrag(e, track.property, idx)}
              convertTimeToPercent={convertTimeToPercent}
              onSelect={() => setSelectedTrack(track.property)}
            />
          ))}
        </div>
      </div>

      {selectedTrack && (
        <button
          className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
          onClick={() =>
            addKeyframe(layer.id, anim.id, selectedTrack, scrubberTime, 0)
          }
        >
          + Add Keyframe to {selectedTrack}
        </button>
      )}
    </div>
  );
}

function TrackRow({ anim, track, onDrag, convertTimeToPercent, onSelect }) {
  return (
    <div
      className="relative h-8 border-b border-slate-800"
      onClick={onSelect}
    >
      <div className="absolute left-2 top-1 text-xs text-slate-300">
        {track.property}
      </div>
      <div className="pl-20 relative h-full">
        {track.keyframes?.map((kf, idx) => (
          <div
            key={idx}
            className="absolute w-3 h-3 bg-yellow-400 rotate-45 cursor-pointer"
            style={{ left: convertTimeToPercent(kf.time) }}
            draggable
            onDrag={(e) => onDrag(e, idx)}
          />
        ))}
      </div>
    </div>
  );
}
