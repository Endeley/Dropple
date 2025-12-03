"use client";

import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";

export default function EffectsPanel({ layer }) {
  const { updateLayer } = useTemplateBuilderStore();
  const props = layer.props || {};

  return (
    <div className="space-y-2 border-b pb-4">
      <h3 className="font-medium">Shadow</h3>

      <label className="block text-sm">
        <span className="block text-xs text-gray-600">Shadow</span>
        <input
          type="text"
          placeholder="0px 4px 12px rgba(0,0,0,0.15)"
          className="border p-1 rounded w-full"
          value={props.shadow || ""}
          onChange={(e) =>
            updateLayer(layer.id, {
              props: { ...props, shadow: e.target.value },
            })
          }
        />
      </label>
    </div>
  );
}
