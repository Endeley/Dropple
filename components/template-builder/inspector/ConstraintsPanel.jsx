"use client";

import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";

export default function ConstraintsPanel({ layer }) {
  const { updateLayer } = useTemplateBuilderStore();
  const constraints = layer.constraints || {};

  return (
    <div className="space-y-3 border-b pb-4">
      <h3 className="font-medium">Constraints</h3>

      <label className="block text-sm">
        Horizontal
        <select
          className="mt-1 border p-2 rounded w-full"
          value={constraints.horizontal || "left"}
          onChange={(e) =>
            updateLayer(layer.id, {
              constraints: {
                ...constraints,
                horizontal: e.target.value,
              },
            })
          }
        >
          <option value="left">Left</option>
          <option value="right">Right</option>
          <option value="left-right">Left & Right (Stretch)</option>
          <option value="scale">Scale</option>
        </select>
      </label>

      <label className="block text-sm">
        Vertical
        <select
          className="mt-1 border p-2 rounded w-full"
          value={constraints.vertical || "top"}
          onChange={(e) =>
            updateLayer(layer.id, {
              constraints: {
                ...constraints,
                vertical: e.target.value,
              },
            })
          }
        >
          <option value="top">Top</option>
          <option value="bottom">Bottom</option>
          <option value="top-bottom">Top & Bottom (Stretch)</option>
          <option value="scale">Scale</option>
        </select>
      </label>
    </div>
  );
}
