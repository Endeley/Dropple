"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useEditorStore } from "../hooks/useEditorStore";
import { useEditorStore as useStore } from "../hooks/useEditorStore";
import { computeSnapping } from "../utils/snapping";
import { applyAnimationsToStyle } from "../utils/animateNode";
import ComponentNodeRenderer from "./ComponentNodeRenderer";

export default function CanvasRenderer({ node }) {
  const selectNode = useEditorStore((s) => s.selectNode);
  const isSelected = useEditorStore((s) => s.isSelected)(node.id);
  const updateNode = useEditorStore((s) => s.updateNode);
  const setSmartGuides = useEditorStore((s) => s.setSmartGuides);
  const clearSmartGuides = useEditorStore((s) => s.clearSmartGuides);
  const startPos = useRef(null);
  const nodes = useStore((s) => s.nodes);
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    if (!node.animations || node.animations.length === 0) return;
    let raf;
    const anim = node.animations[0];
    const start = performance.now() + (anim.delay || 0);

    const loop = (now) => {
      const t = Math.min(1, (now - start) / (anim.duration || 1));
      setProgress(t);
      if (t < 1) {
        raf = requestAnimationFrame(loop);
      }
    };

    raf = requestAnimationFrame(loop);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      setProgress(1);
    };
  }, [node.animations]);

  const style = useMemo(
    () => ({
      position: "absolute",
      left: node.x,
      top: node.y,
      width: node.width,
      height: node.height,
      transform: `rotate(${node.rotation || 0}deg)`,
      border: isSelected ? "1px solid #3b82f6" : "none",
      cursor: isSelected ? "move" : "pointer",
      opacity: node.visible === false ? 0 : undefined,
    }),
    [node.x, node.y, node.width, node.height, node.rotation, isSelected, node.visible],
  );

  const onMouseDown = (e) => {
    if (node.locked) return;
    e.stopPropagation();
    const additive = e.shiftKey;
    selectNode(node.id, additive);
    if (!isSelected) return;

    startPos.current = {
      startX: e.clientX,
      startY: e.clientY,
      nodeX: node.x,
      nodeY: node.y,
    };

    const onMove = (moveEvent) => {
      if (!startPos.current) return;
      const dx = moveEvent.clientX - startPos.current.startX;
      const dy = moveEvent.clientY - startPos.current.startY;
      let newX = startPos.current.nodeX + dx;
      let newY = startPos.current.nodeY + dy;

      const { snappedX, snappedY, guides } = computeSnapping(
        { ...node, x: newX, y: newY },
        nodes,
      );
      newX = snappedX;
      newY = snappedY;

      updateNode(node.id, {
        x: newX,
        y: newY,
      });
      setSmartGuides(guides);
    };

    const onUp = () => {
      clearSmartGuides();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      startPos.current = null;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const animatedStyle = useMemo(() => applyAnimationsToStyle(node, progress), [node, progress]);

  if (node.type === "frame") {
    if (node.visible === false) return null;
    return (
      <div
        onMouseDown={onMouseDown}
        style={{
          ...animatedStyle,
          background: node.fill || "#ffffff",
          border: `${node.strokeWidth || 1}px solid ${node.stroke || "#d1d5db"}`,
          borderRadius: node.radius || 0,
        }}
      >
        {node.children?.map((childId) => {
          const child = nodes.find((n) => n.id === childId);
          if (!child) return null;
          return <CanvasRenderer key={child.id} node={child} />;
        })}
      </div>
    );
  }

  if (node.type === "component-node") {
    if (node.visible === false) return null;
    return <ComponentNodeRenderer node={node} styleOverride={animatedStyle} />;
  }

  if (node.type === "text") {
    if (node.visible === false) return null;
    return (
      <div
        onMouseDown={onMouseDown}
        style={{ ...style, ...animatedStyle }}
        className="font-sans outline-none"
        contentEditable
        suppressContentEditableWarning
      >
        {node.content}
      </div>
    );
  }

  if (node.type === "image") {
    if (node.visible === false) return null;
    return (
      <img
        onMouseDown={onMouseDown}
        src={node.src}
        alt=""
        style={{ ...style, ...animatedStyle, objectFit: node.fit || "cover" }}
      />
    );
  }

  if (node.type === "shape") {
    if (node.visible === false) return null;
    const radius = node.shape === "circle" ? "9999px" : undefined;
    return (
      <div
        onMouseDown={onMouseDown}
        style={{
          ...style,
          ...animatedStyle,
          background: node.fill,
          border: `${node.strokeWidth || 0}px solid ${node.stroke || "transparent"}`,
          borderRadius: radius,
        }}
      />
    );
  }

  return null;
}
