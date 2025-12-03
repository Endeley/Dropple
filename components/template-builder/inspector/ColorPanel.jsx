"use client";

import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";

export default function ColorPanel({ layer }) {
  const { updateLayer } = useTemplateBuilderStore();
  const props = layer.props || {};

  return (
    <div className="space-y-2 border-b pb-4">
      <h3 className="font-medium">Color</h3>

      <input
        type="color"
        className="w-full h-10 rounded border"
        value={props.color || props.fill || "#000000"}
        onChange={(e) => {
          const value = e.target.value;
          updateLayer(layer.id, {
            props: {
              ...props,
              color: layer.type === "text" ? value : props.color,
              fill: layer.type !== "text" ? value : props.fill,
            },
          });
        }}
      />
    </div>
  );
}
