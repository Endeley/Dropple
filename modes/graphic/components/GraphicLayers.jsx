"use client";

import LayerPanel from "@/components/layers/LayerPanel";

export default function GraphicLayers() {
  return (
    <div className="h-full bg-neutral-950">
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-lg font-semibold text-neutral-300">Layers</h2>
      </div>
      <LayerPanel />
    </div>
  );
}
