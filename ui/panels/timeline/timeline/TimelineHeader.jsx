"use client";

import { useTimelineStore } from "@/runtime/stores/useTimelineStore";
import { formatTimecode } from "@/utils/timeline/timecode";

export default function TimelineHeader({ projectId = null, sceneId = null }) {
  const {
    playing,
    play,
    pause,
    currentTime,
    duration,
    zoom,
    setZoom,
    setDuration,
    fps,
    setFps,
    saveToServer,
    loadFromServer,
  } = useTimelineStore((state) => ({
    playing: state.playing,
    play: state.play,
    pause: state.pause,
    currentTime: state.currentTime,
    duration: state.duration,
    zoom: state.zoom,
    setZoom: state.setZoom,
    setDuration: state.setDuration,
    fps: state.fps,
    setFps: state.setFps,
    saveToServer: state.saveToServer,
    loadFromServer: state.loadFromServer,
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

      <div className="flex items-center gap-3 text-xs text-neutral-300">
        <label className="flex items-center gap-1">
          FPS
          <input
            type="number"
            className="w-16 rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs text-neutral-100"
            value={fps}
            min={1}
            onChange={(e) => setFps(Number(e.target.value))}
          />
        </label>
        <button
          onClick={() => loadFromServer(sceneId)}
          className="rounded border border-neutral-700 px-3 py-1 text-xs font-semibold hover:bg-neutral-800"
          disabled={!sceneId}
          title={sceneId ? "Load animation" : "Provide a sceneId to load"}
        >
          🔄 Load
        </button>
        <button
          onClick={() => saveToServer(projectId, sceneId)}
          className="rounded bg-emerald-500 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-400 disabled:opacity-50"
          disabled={!sceneId}
          title={sceneId ? "Save animation" : "Provide a sceneId to save"}
        >
          💾 Save
        </button>
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
