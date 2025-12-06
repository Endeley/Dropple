"use client";

export default function PodcastInspector() {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold text-neutral-300">Inspector</h2>

      <div className="space-y-2">
        <label className="text-sm text-neutral-400">Gain (dB)</label>
        <input type="number" className="w-full p-2 bg-neutral-800 rounded text-sm" />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-neutral-400">Speed</label>
        <input type="number" className="w-full p-2 bg-neutral-800 rounded text-sm" />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-neutral-400">Pitch Shift</label>
        <input type="number" className="w-full p-2 bg-neutral-800 rounded text-sm" />
      </div>

      <div className="space-y-2 flex items-center gap-2">
        <input type="checkbox" className="h-4 w-4" />
        <label className="text-sm text-neutral-400">Noise Reduction</label>
      </div>
    </div>
  );
}
