"use client";

export default function VideoInspector() {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold text-neutral-300">Inspector</h2>

      <div className="space-y-2">
        <label className="text-sm text-neutral-400">Position</label>
        <div className="flex gap-2">
          <input
            placeholder="X"
            className="w-full bg-neutral-800 p-2 rounded text-sm"
          />
          <input
            placeholder="Y"
            className="w-full bg-neutral-800 p-2 rounded text-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-neutral-400">Scale</label>
        <input type="number" className="w-full bg-neutral-800 p-2 rounded text-sm" />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-neutral-400">Rotation</label>
        <input type="number" className="w-full bg-neutral-800 p-2 rounded text-sm" />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-neutral-400">Opacity</label>
        <input type="range" min="0" max="100" className="w-full" />
      </div>
    </div>
  );
}
