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
      className={`px-3 py-1 text-sm font-medium rounded-md border transition-colors ${
        activeTool === tool
          ? "bg-purple-600 text-white border-purple-600 shadow-sm"
          : "border-purple-100 text-purple-700 bg-white hover:bg-purple-50"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="h-14 border-b border-slate-200 bg-white/95 backdrop-blur flex items-center gap-3 px-4 shadow-sm sticky top-14 z-20">
      {btn("Select", "select")}
      {btn("Text", "text")}
      {btn("Shape", "shape")}
      {btn("Frame", "frame")}
      {btn("Image", "image")}
      {btn("Component", "component")}
      <button
        onClick={() => addArtboard()}
        className="ml-2 px-3 py-1 text-sm font-medium rounded-md border border-purple-600 text-purple-700 bg-purple-50 hover:bg-purple-100"
      >
        + Artboard
      </button>
      <ComponentInsertModal open={insertOpen} onClose={() => setInsertOpen(false)} />
    </div>
  );
}
