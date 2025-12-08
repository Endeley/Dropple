"use client";

import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";
import { Reorder } from "framer-motion";
import { useMemo } from "react";

export default function LayersPanel() {
  const layers = useTemplateBuilderStore((s) => s.currentTemplate.layers || []);
  const selected = useTemplateBuilderStore((s) => s.selectedLayers || []);
  const setSelectedLayers = useTemplateBuilderStore((s) => s.setSelectedLayers);
  const moveNode = useTemplateBuilderStore((s) => s.moveNode);
  const toggleLayerVisibility = useTemplateBuilderStore((s) => s.toggleLayerVisibility);
  const toggleLayerLock = useTemplateBuilderStore((s) => s.toggleLayerLock);

  // Flat list sorted top-most first
  const ordered = useMemo(() => [...layers].reverse(), [layers]);

  return (
    <div className="w-64 bg-white border-r p-3 overflow-y-auto space-y-2 text-sm">
      <div className="font-semibold text-slate-800 mb-2">Layers</div>
      <Reorder.Group
        axis="y"
        values={ordered}
        onReorder={(newOrder) => {
          const reversed = [...newOrder].reverse();
          reversed.forEach((node, idx) => {
            // move to root, reorder by index from bottom
            moveNode(node.id, node.parentId || null, idx, { undoable: true });
          });
        }}
        className="space-y-1"
      >
        {ordered.map((node) => (
          <Reorder.Item
            key={node.id}
            value={node}
            className={`px-2 py-1 rounded flex items-center justify-between hover:bg-slate-100 cursor-pointer ${
              selected.includes(node.id) ? "bg-slate-200" : ""
            }`}
            onClick={() => setSelectedLayers([node.id])}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-xs text-slate-500">{iconFor(node.type)}</span>
              <span className="truncate">{node.name || node.id}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLayerVisibility(node.id);
                }}
              >
                {node.hidden ? "🚫" : "👁"}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLayerLock(node.id);
                }}
              >
                {node.locked ? "🔒" : "🔓"}
              </button>
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
}

function iconFor(type) {
  switch (type) {
    case "text":
      return "T";
    case "image":
      return "🖼";
    case "frame":
      return "⬛";
    case "component-instance":
      return "🧩";
    default:
      return "◻";
  }
}
