"use client";

import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";
import { useState } from "react";
import ComponentInsertModal from "./ComponentInsertModal";

export default function TemplateToolbar() {
  const {
    activeTool,
    setActiveTool,
    addTextLayer,
    addRectangleLayer,
    addImageLayer,
    addFrameLayer,
    addArtboard,
    components,
    createInstanceFromComponent,
  } = useTemplateBuilderStore();
  const [insertOpen, setInsertOpen] = useState(false);

  function handleToolClick(tool) {
    setActiveTool(tool);

    if (tool === "text") addTextLayer();
    if (tool === "shape") addRectangleLayer();
    if (tool === "image") addImageLayer();
    if (tool === "frame") addFrameLayer();
    if (tool === "component") {
      if (components?.length) {
        setInsertOpen(true);
      }
    }
  }

  const btn = (label, tool) => (
    <button
      onClick={() => handleToolClick(tool)}
      className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-colors shadow-sm whitespace-nowrap ${
        activeTool === tool
          ? "bg-purple-600 text-white border-purple-600"
          : "border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur flex items-center justify-between px-4 shadow-sm sticky top-14 z-20">
      <div className="flex items-center gap-2">
        {btn("Select", "select")}
        {btn("Text", "text")}
        {btn("Shape", "shape")}
        {btn("Frame", "frame")}
        {btn("Image", "image")}
        {btn("Component", "component")}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => addArtboard()}
          className="px-5 py-2 text-sm font-semibold rounded-lg border border-purple-600 text-purple-700 bg-purple-50 hover:bg-purple-100 shadow-sm whitespace-nowrap"
        >
          + Artboard
        </button>
      </div>
      <ComponentInsertModal open={insertOpen} onClose={() => setInsertOpen(false)} />
    </div>
  );
}
