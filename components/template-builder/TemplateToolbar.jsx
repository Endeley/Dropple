"use client";

import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";

export default function TemplateToolbar() {
  const {
    activeTool,
    setActiveTool,
    addTextLayer,
    addRectangleLayer,
    addImageLayer,
    addFrameLayer,
    addArtboard,
  } = useTemplateBuilderStore();

  function handleToolClick(tool) {
    setActiveTool(tool);

    if (tool === "text") addTextLayer();
    if (tool === "shape") addRectangleLayer();
    if (tool === "image") addImageLayer();
    if (tool === "frame") addFrameLayer();
  }

  const btn = (label, tool) => (
    <button
      onClick={() => handleToolClick(tool)}
      className={`px-3 py-1 text-sm font-medium rounded-md border transition-colors ${
        activeTool === tool
          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
          : "border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
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
        className="ml-2 px-3 py-1 text-sm font-medium rounded-md border border-emerald-500 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
      >
        + Artboard
      </button>
    </div>
  );
}
