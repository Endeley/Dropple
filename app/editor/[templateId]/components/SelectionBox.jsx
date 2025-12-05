"use client";

import { useEditorStore } from "../hooks/useEditorStore";
import TransformHandles from "./TransformHandles";

export default function SelectionBox() {
  const nodes = useEditorStore((s) => s.nodes);
  const selected = useEditorStore((s) => s.selectedNodeIds);
  const node = nodes.find((n) => n.id === selected[0]);

  if (!node) return null;

  const padding = 4;
  const x = node.x - padding;
  const y = node.y - padding;
  const width = node.width + padding * 2;
  const height = node.height + padding * 2;

  return (
    <>
      <div
        className="pointer-events-none border border-blue-500/80 ring-1 ring-blue-300/50 absolute"
        style={{ left: x, top: y, width, height }}
      />
      <TransformHandles node={node} />
    </>
  );
}
