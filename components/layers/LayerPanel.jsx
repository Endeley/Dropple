"use client";

import { useNodeTreeStore } from "@/zustand/nodeTreeStore";
import { useSelectionStore } from "@/zustand/selectionStore";
import { useCallback } from "react";

function LayerItem({ id, depth = 0 }) {
  const nodes = useNodeTreeStore((state) => state.nodes);
  const toggleHidden = useNodeTreeStore((state) => state.toggleHidden);
  const toggleLock = useNodeTreeStore((state) => state.toggleLock);
  const { selectedIds, setSelected } = useSelectionStore();

  const handleSelect = useCallback(() => setSelected([id]), [id, setSelected]);
  const node = nodes[id];
  const isSelected = selectedIds?.includes(id);
  if (!node) return null;

  return (
    <div className="w-full">
      <div
        className={`px-2 py-1 flex items-center justify-between cursor-pointer rounded transition ${
          isSelected ? "bg-blue-600/20 text-blue-300" : "hover:bg-neutral-800"
        }`}
        style={{ marginLeft: depth * 12 }}
        onClick={handleSelect}
      >
        <span className="truncate text-sm">{node.name || node.type}</span>

        <div className="flex items-center gap-2">
          <button
            className="text-xs text-neutral-400 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              toggleHidden(id);
            }}
            title={node.hidden ? "Show layer" : "Hide layer"}
          >
            {node.hidden ? "🙈" : "👁"}
          </button>
          <button
            className="text-xs text-neutral-400 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              toggleLock(id);
            }}
            title={node.locked ? "Unlock layer" : "Lock layer"}
          >
            {node.locked ? "🔒" : "🔓"}
          </button>
        </div>
      </div>

      {!!node.children?.length &&
        node.children.map((childId) => (
          <LayerItem key={childId} id={childId} depth={depth + 1} />
        ))}
    </div>
  );
}

export default function LayerPanel() {
  const rootIds = useNodeTreeStore((state) => state.rootIds);

  if (!rootIds?.length) {
    return (
      <div className="p-4 text-sm text-neutral-500">
        No layers yet. Add elements to the canvas to see them listed here.
      </div>
    );
  }

  return (
    <div className="p-3 space-y-2 text-neutral-300">
      {rootIds.map((id) => (
        <LayerItem key={id} id={id} depth={0} />
      ))}
    </div>
  );
}
