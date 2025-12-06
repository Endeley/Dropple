"use client";

export default function UIUXProperties() {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold text-neutral-300">Properties</h2>

      <div className="space-y-2">
        <label className="text-sm text-neutral-400">Size</label>
        <div className="flex gap-2">
          <input placeholder="Width" className="w-full bg-neutral-800 p-2 rounded" />
          <input placeholder="Height" className="w-full bg-neutral-800 p-2 rounded" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-neutral-400">Layout</label>
        <select className="w-full bg-neutral-800 p-2 rounded">
          <option>None</option>
          <option>Auto Layout (Vertical)</option>
          <option>Auto Layout (Horizontal)</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-neutral-400">Content Alignment</label>
        <select className="w-full bg-neutral-800 p-2 rounded">
          <option>Start</option>
          <option>Center</option>
          <option>End</option>
          <option>Space Between</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-neutral-400">Spacing</label>
        <input type="number" className="w-full bg-neutral-800 p-2 rounded" />
      </div>
    </div>
  );
}
