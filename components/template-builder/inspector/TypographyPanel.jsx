"use client";

import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";

export default function TypographyPanel({ layer }) {
  const { updateLayer } = useTemplateBuilderStore();
  const props = layer.props || {};

  return (
    <div className="space-y-3 border-b pb-4">
      <h3 className="font-medium">Typography</h3>

      <label className="block text-sm">
        <span className="block text-xs text-gray-600">Font Size</span>
        <input
          type="number"
          className="border p-1 rounded w-full"
          value={props.fontSize || 16}
          onChange={(e) =>
            updateLayer(layer.id, {
              props: { ...props, fontSize: Number(e.target.value) },
            })
          }
        />
      </label>

      <label className="block text-sm">
        <span className="block text-xs text-gray-600">Font Weight</span>
        <select
          className="border p-1 rounded w-full"
          value={props.fontWeight || 400}
          onChange={(e) =>
            updateLayer(layer.id, {
              props: { ...props, fontWeight: Number(e.target.value) },
            })
          }
        >
          <option value={300}>Light</option>
          <option value={400}>Regular</option>
          <option value={500}>Medium</option>
          <option value={600}>Semi-bold</option>
          <option value={700}>Bold</option>
        </select>
      </label>

      <label className="block text-sm">
        <span className="block text-xs text-gray-600">Line Height</span>
        <input
          type="number"
          className="border p-1 rounded w-full"
          value={props.lineHeight || 1.4}
          onChange={(e) =>
            updateLayer(layer.id, {
              props: { ...props, lineHeight: Number(e.target.value) },
            })
          }
        />
      </label>
    </div>
  );
}
