"use client";

import { useEditorStore } from "../hooks/useEditorStore";
import { useState } from "react";
import { Reorder } from "framer-motion";

export default function LayersPanel() {
  const nodes = useEditorStore((s) => s.nodes);
  const setSelectedNodes = useEditorStore((s) => s.setSelectedNodes);
  const reorderNodes = useEditorStore((s) => s.reorderNodes);
  const toggleVisibility = useEditorStore((s) => s.toggleVisibility);
  const toggleLock = useEditorStore((s) => s.toggleLock);
  const renameNode = useEditorStore((s) => s.renameNode);
  const [editingId, setEditingId] = useState(null);

  const sortedNodes = [...nodes].reverse(); // topmost first

  return (
    <div className="w-64 bg-white border-r p-4 overflow-y-auto space-y-2">
      <h2 className="text-sm font-semibold mb-3">Layers</h2>

      <Reorder.Group
        axis="y"
        values={sortedNodes}
        onReorder={(newOrder) => reorderNodes([...newOrder].reverse())}
        className="space-y-1"
      >
        {sortedNodes.map((node) => (
          <Reorder.Item
            key={node.id}
            value={node}
            className="p-2 flex items-center justify-between hover:bg-gray-100 rounded cursor-pointer"
            onClick={() => setSelectedNodes([node.id])}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-lg">{renderIcon(node.type)}</span>
              {editingId === node.id ? (
                <input
                  autoFocus
                  className="border px-1 rounded text-sm"
                  defaultValue={node.name || "Layer"}
                  onBlur={(e) => {
                    renameNode(node.id, e.target.value || "Layer");
                    setEditingId(null);
                  }}
                />
              ) : (
                <span onDoubleClick={() => setEditingId(node.id)} className="text-sm truncate">
                  {node.name || "Layer"}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVisibility(node.id);
                }}
              >
                {node.visible === false ? "🚫" : "👁"}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLock(node.id);
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

function renderIcon(type) {
  switch (type) {
    case "text":
      return "🅣";
    case "image":
      return "🖼️";
    case "shape":
      return "⬜";
    case "frame":
      return "📦";
    case "component-node":
      return "🧩";
    default:
      return "📄";
  }
}
