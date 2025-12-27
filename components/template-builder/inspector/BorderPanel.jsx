"use client";
import { useTemplateBuilderStore } from "@/runtime/stores/useTemplateBuilderStore";

export default function BorderPanel({ layer }) {
  const { updateLayer } = useTemplateBuilderStore();
  const props = layer.props || {};

  return (
    <div className="space-y-2 border-b pb-4">
      <h3 className="font-medium">Border</h3>

      <label className="block text-sm">
        <span className="block text-xs text-gray-600">Border Width</span>
        <input
          type="number"
          className="border p-1 rounded w-full"
          value={props.borderWidth || 0}
          onChange={(e) =>
            updateLayer(layer.id, {
              props: { ...props, borderWidth: Number(e.target.value) },
            })
          }
        />
      </label>

      <label className="block text-sm">
        <span className="block text-xs text-gray-600">Border Color</span>
        <input
          type="color"
          className="w-full h-10 border rounded"
          value={props.borderColor || "#000000"}
          onChange={(e) =>
            updateLayer(layer.id, {
              props: { ...props, borderColor: e.target.value },
            })
          }
        />
      </label>
    </div>
  );
}
