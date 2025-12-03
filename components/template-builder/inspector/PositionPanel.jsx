"use client";

import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";

export default function PositionPanel({ layer }) {
  const { updateLayer } = useTemplateBuilderStore();

  return (
    <div className="space-y-2 border-b pb-4">
      <h3 className="font-medium">Position</h3>

      <div className="flex gap-2">
        <label className="flex-1 text-sm">
          <span className="block text-xs text-gray-600">X</span>
          <input
            type="number"
            className="border p-1 rounded w-full"
            value={layer.x || 0}
            onChange={(e) => updateLayer(layer.id, { x: Number(e.target.value) })}
          />
        </label>

        <label className="flex-1 text-sm">
          <span className="block text-xs text-gray-600">Y</span>
          <input
            type="number"
            className="border p-1 rounded w-full"
            value={layer.y || 0}
            onChange={(e) => updateLayer(layer.id, { y: Number(e.target.value) })}
          />
        </label>
      </div>
    </div>
  );
}
