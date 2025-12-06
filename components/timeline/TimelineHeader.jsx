"use client";

import { useTimelineStore } from "@/zustand/useTimelineStore";
import { formatTimecode } from "@/utils/timeline/timecode";

export default function TimelineHeader() {
  const { playing, play, pause, currentTime, duration, zoom, setZoom, setDuration } =
    useTimelineStore((state) => ({
      playing: state.playing,
      play: state.play,
      pause: state.pause,
      currentTime: state.currentTime,
      duration: state.duration,
      zoom: state.zoom,
      setZoom: state.setZoom,
      setDuration: state.setDuration,
    }));

  return (
    <div className="flex h-12 w-full items-center gap-4 border-b border-neutral-800 bg-neutral-900 px-4 text-white">
      <button
        onClick={playing ? pause : play}
        className="rounded bg-white/10 px-3 py-1 text-sm font-semibold hover:bg-white/20"
      >
        {playing ? "⏸️" : "▶️"}
      </button>

      <div className="flex items-center gap-2 text-sm text-neutral-200">
        <span className="font-mono">{formatTimecode(currentTime)}</span>
        <span className="text-neutral-500">/</span>
        <span className="font-mono text-neutral-400">{formatTimecode(duration)}</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => setZoom(zoom - 0.1)}
          className="rounded border border-neutral-700 px-2 py-1 text-xs hover:bg-neutral-800"
        >
          -
        </button>
        <span className="text-xs font-semibold text-neutral-100">{zoom.toFixed(2)}x</span>
        <button
          onClick={() => setZoom(zoom + 0.1)}
          className="rounded border border-neutral-700 px-2 py-1 text-xs hover:bg-neutral-800"
        >
          +
        </button>
        <input
          type="number"
          className="w-20 rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs text-neutral-100"
          value={duration}
          min={200}
          onChange={(e) => setDuration(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
