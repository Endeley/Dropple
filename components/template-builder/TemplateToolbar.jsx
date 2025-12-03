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
      className={`px-3 py-1 border rounded ${
        activeTool === tool ? "bg-blue-600 text-white" : "hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="h-14 border-b bg-white flex items-center gap-4 px-4">
      {btn("Select", "select")}
      {btn("Text", "text")}
      {btn("Shape", "shape")}
      {btn("Frame", "frame")}
      {btn("Image", "image")}
      {btn("Component", "component")}
    </div>
  );
}
