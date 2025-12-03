"use client";

import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";
import CanvasLayer from "./CanvasLayer";

export default function ComponentEditorCanvas() {
  const {
    editingComponentId,
    editingVariantId,
    exitComponentEdit,
    components,
  } = useTemplateBuilderStore();

  const component = components.find((c) => c._id === editingComponentId);
  if (!component) return null;

  const nodes = editingVariantId
    ? component.variants?.find((v) => v.id === editingVariantId)?.nodes || []
    : component.nodes || [];

  return (
    <div className="flex-1 bg-gray-50 flex flex-col" id="dropple-canvas">
      <div className="p-3 bg-purple-700 text-white flex items-center justify-between">
        <span className="font-medium">
          Editing Component: {component.name || "Component"}
          {editingVariantId ? ` • Variant` : ""}
        </span>
        <button
          className="px-3 py-1 bg-white text-purple-700 rounded hover:bg-purple-100"
          onClick={exitComponentEdit}
        >
          Done
        </button>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="border-2 border-purple-600/50 rounded p-6 inline-block relative bg-white shadow">
          {nodes.map((layer) => (
            <CanvasLayer
              key={layer.id}
              layer={layer}
              isComponentMaster
              offset={{ x: 0, y: 0 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
