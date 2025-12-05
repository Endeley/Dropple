"use client";

import { useEditorStore } from "../hooks/useEditorStore";
import CanvasRenderer from "./CanvasRenderer";
import SelectionBox from "./SelectionBox";
import SmartGuides from "./SmartGuides";

export default function Canvas() {
  const { nodes, width, height, background, clearSelection, selectedNodeIds } = useEditorStore();

  return (
    <div
      className="relative overflow-hidden m-6 shadow-lg"
      style={{ width, height, background }}
      onMouseDown={() => clearSelection()}
    >
      {nodes.map((node) => (
        <CanvasRenderer key={node.id} node={node} />
      ))}
      {selectedNodeIds.length === 1 && <SelectionBox />}
      <SmartGuides />
    </div>
  );
}
