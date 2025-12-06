"use client";

import { useNodeTreeStore } from "@/zustand/nodeTreeStore";
import { useSelectionStore } from "@/zustand/selectionStore";

export default function NodeRenderer({ onNodePointerDown }) {
  const nodes = useNodeTreeStore((s) => s.nodes);
  const rootIds = useNodeTreeStore((s) => s.rootIds);
  const setSelectedManual = useSelectionStore((s) => s.setSelectedManual);

  const renderNode = (id) => {
    const node = nodes[id];
    if (!node) return null;

    const style = {
      position: "absolute",
      left: node.x,
      top: node.y,
      width: node.width,
      height: node.height,
      transform: `rotate(${node.rotation || 0}deg)`,
      opacity: node.opacity ?? 1,
      pointerEvents: node.locked ? "none" : "auto",
      display: node.hidden ? "none" : "block",
    };

    let content = null;
    switch (node.type) {
      case "rect":
      case "shape":
        content = <div style={{ background: node.fill || "#666", width: "100%", height: "100%" }} />;
        break;
      case "image":
        content = (
          <img
            src={node.src}
            alt={node.name || ""}
            className="w-full h-full object-cover"
            style={{ pointerEvents: "none" }}
          />
        );
        break;
      case "text":
        content = (
          <div
            style={{
              color: node.fill || "#fff",
              fontSize: node.fontSize || 16,
              lineHeight: 1.3,
            }}
          >
            {node.text || node.name}
          </div>
        );
        break;
      default:
        content = <div className="bg-neutral-700 w-full h-full" />;
    }

    return (
      <div
        key={id}
        style={style}
        onMouseDown={(e) => {
          setSelectedManual([id]);
          onNodePointerDown?.(e, id);
        }}
      >
        {content}
        {node.children?.map((childId) => renderNode(childId))}
      </div>
    );
  };

  return <>{rootIds.map((id) => renderNode(id))}</>;
}
