"use client";

import CanvasHost from "./CanvasHost";
import NodeRenderer from "./NodeRenderer";
import TransformControls from "./TransformControls";
import { useNodeTreeStore } from "@/zustand/nodeTreeStore";

export default function Canvas2D() {
  const nodes = useNodeTreeStore((s) => s.nodes);

  return (
    <CanvasHost nodeMap={nodes}>
      <NodeRenderer />
      <TransformControls />
    </CanvasHost>
  );
}
