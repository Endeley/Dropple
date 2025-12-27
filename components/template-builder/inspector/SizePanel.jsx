"use client";

import { useTemplateBuilderStore } from "@/runtime/stores/useTemplateBuilderStore";

export default function SizePanel({ layer }) {
  const { updateLayer } = useTemplateBuilderStore();

  return (
    <div className="space-y-2 border-b pb-4">
      <h3 className="font-medium">Size</h3>

      <div className="flex gap-2">
        <label className="flex-1 text-sm">
          <span className="block text-xs text-gray-600">Width</span>
          <input
            type="number"
            className="border p-1 rounded w-full"
            value={layer.width || 0}
            onChange={(e) => updateLayer(layer.id, { width: Number(e.target.value) })}
          />
        </label>

        <label className="flex-1 text-sm">
          <span className="block text-xs text-gray-600">Height</span>
          <input
            type="number"
            className="border p-1 rounded w-full"
            value={layer.height || 0}
            onChange={(e) => updateLayer(layer.id, { height: Number(e.target.value) })}
          />
        </label>
      </div>
    </div>
  );
}
