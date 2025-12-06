"use client";

export default function GraphicProperties() {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold text-neutral-300">Properties</h2>

      <div className="space-y-2">
        <label className="text-sm text-neutral-400">Fill</label>
        <input type="color" className="w-full h-8 rounded bg-neutral-800" />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-neutral-400">Opacity</label>
        <input type="range" min="0" max="100" className="w-full" />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-neutral-400">Corner Radius</label>
        <input type="number" className="w-full bg-neutral-800 p-2 rounded" />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-neutral-400">Size</label>
        <div className="flex gap-2">
          <input placeholder="W" className="w-full bg-neutral-800 p-2 rounded" />
          <input placeholder="H" className="w-full bg-neutral-800 p-2 rounded" />
        </div>
      </div>
    </div>
  );
}
