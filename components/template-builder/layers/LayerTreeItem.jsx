"use client";

import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";

export default function LayerTreeItem({ layer, depth = 0 }) {
  const {
    currentTemplate,
    selectedLayers,
    setSelectedLayers,
    toggleLayerLock,
    toggleLayerVisibility,
    toggleLayerExpand,
    renameLayer,
    reorderLayers,
  } = useTemplateBuilderStore();

  const children = (layer.children || [])
    .map((id) => currentTemplate.layers.find((l) => l.id === id))
    .filter(Boolean);

  const isSelected = selectedLayers.includes(layer.id);

  function handleDragStart(e) {
    e.dataTransfer.setData("sourceId", layer.id);
  }

  function handleDrop(e) {
    const sourceId = e.dataTransfer.getData("sourceId");
    if (!sourceId) return;
    reorderLayers(sourceId, layer.id);
  }

  return (
    <div
      className="flex flex-col"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div
        draggable
        onDragStart={handleDragStart}
        className={`flex items-center px-2 py-1 rounded cursor-pointer ${
          isSelected ? "bg-blue-600 text-white" : "hover:bg-gray-100"
        }`}
        style={{ paddingLeft: depth * 16 }}
        onClick={() => setSelectedLayers([layer.id])}
      >
        {children.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLayerExpand(layer.id);
            }}
            className="mr-2 text-xs"
          >
            {layer.expanded ? "▼" : "▶"}
          </button>
        )}

        <span className="text-xs opacity-70 mr-2">
          {layer.type === "text" ? "T" : layer.type === "frame" ? "▭" : "■"}
        </span>

        <input
          value={layer.name || layer.type}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => renameLayer(layer.id, e.target.value)}
          className={`bg-transparent outline-none text-sm flex-1 ${
            isSelected ? "text-white" : "text-gray-800"
          }`}
        />

        <button
          className="ml-2 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            toggleLayerLock(layer.id);
          }}
          title={layer.locked ? "Unlock" : "Lock"}
        >
          {layer.locked ? "🔒" : "🔓"}
        </button>

        <button
          className="ml-2 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            toggleLayerVisibility(layer.id);
          }}
          title={layer.hidden ? "Show" : "Hide"}
        >
          {layer.hidden ? "🙈" : "👁"}
        </button>
      </div>

      {layer.expanded !== false &&
        children.map((child) => (
          <LayerTreeItem key={child.id} layer={child} depth={depth + 1} />
        ))}
    </div>
  );
}
