"use client";

import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";
import CanvasLayer from "./CanvasLayer";

export default function BuilderCanvas() {
  const { currentTemplate } = useTemplateBuilderStore();

  return (
    <div className="flex-1 bg-gray-100 flex items-center justify-center overflow-auto relative">
      <div
        className="relative bg-white shadow-md"
        style={{ width: currentTemplate.width, height: currentTemplate.height }}
      >
        {currentTemplate.layers.map((layer) => (
          <CanvasLayer key={layer.id} layer={layer} />
        ))}
      </div>
    </div>
  );
}
