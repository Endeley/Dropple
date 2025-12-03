"use client";

import { useRef } from "react";
import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";
import CanvasLayer from "./CanvasLayer";
import SmartGuides from "./SmartGuides";
import MarqueeSelect from "./MarqueeSelect";
import ComponentEditorCanvas from "./ComponentEditorCanvas";

export default function BuilderCanvas() {
  const { currentTemplate, isEditingComponent } = useTemplateBuilderStore();
  const containerRef = useRef(null);

  if (isEditingComponent) {
    return <ComponentEditorCanvas />;
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-gray-100 flex items-center justify-center overflow-auto relative"
      onDragOver={(e) => e.preventDefault()}
      onDrop={async (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/assets/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data?.url) {
          useTemplateBuilderStore.getState().addImageLayer(data.url);
        }
      }}
    >
      <div
        id="dropple-canvas"
        className="relative bg-white shadow"
        style={{ width: currentTemplate.width, height: currentTemplate.height }}
      >
        {currentTemplate.layers
          .filter((layer) => !layer.parentId)
          .map((layer) => (
            <CanvasLayer key={layer.id} layer={layer} offset={{ x: 0, y: 0 }} />
          ))}
        <SmartGuides />
      </div>
      <MarqueeSelect containerRef={containerRef} layers={currentTemplate.layers} />
    </div>
  );
}
