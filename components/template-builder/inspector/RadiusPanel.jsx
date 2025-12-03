"use client";
import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";

export default function RadiusPanel({ layer }) {
  const { updateLayer } = useTemplateBuilderStore();
  const props = layer.props || {};

  return (
    <div className="space-y-2 border-b pb-4">
      <h3 className="font-medium">Border Radius</h3>

      <input
        type="number"
        className="border p-1 rounded w-full"
        value={props.radius || 0}
        onChange={(e) =>
          updateLayer(layer.id, {
            props: { ...props, radius: Number(e.target.value) },
          })
        }
      />
    </div>
  );
}
