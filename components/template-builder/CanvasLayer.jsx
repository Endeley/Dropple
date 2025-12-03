"use client";

import { useEffect, useRef } from "react";
import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";

export default function CanvasLayer({ layer, isInstanceChild = false }) {
  const {
    selectedLayerId,
    selectLayer,
    updateLayer,
    editingTextId,
    setEditingTextId,
    stopEditingText,
  } = useTemplateBuilderStore();

  const ref = useRef(null);

  useEffect(() => {
    if (editingTextId === layer.id && ref.current) {
      ref.current.focus();
    }
  }, [editingTextId, layer.id]);

  const isSelected = selectedLayerId === layer.id;

  function handleMouseDown(e) {
    if (editingTextId === layer.id) return;
    e.stopPropagation();
    if (!isInstanceChild) {
      selectLayer(layer.id);
    }
  }

  const style = {
    position: "absolute",
    left: layer.x,
    top: layer.y,
    width: layer.width,
    height: layer.height,
    borderRadius: layer.props?.borderRadius || 0,
    overflow: "hidden",
    color: layer.props?.color,
    background: layer.props?.fill,
    pointerEvents: editingTextId === layer.id ? "auto" : "initial",
    outline: isSelected ? "1px dashed #3b82f6" : "none",
  };

  return (
    <div
      style={style}
      className="select-none"
      onMouseDown={handleMouseDown}
      ref={ref}
    >
      {layer.type === "text" && (
        <div
          contentEditable={editingTextId === layer.id}
          suppressContentEditableWarning={true}
          onDoubleClick={(e) => {
            e.stopPropagation();
            setEditingTextId(layer.id);
          }}
          onBlur={(e) => {
            stopEditingText();
            updateLayer(layer.id, { content: e.target.innerText });
          }}
          onInput={(e) => {
            updateLayer(layer.id, { content: e.target.innerText });
          }}
          style={{
            fontSize: layer?.props?.fontSize || 18,
            fontWeight: layer?.props?.fontWeight || 400,
            color: layer?.props?.color || "#000",
            outline: "none",
            cursor: editingTextId === layer.id ? "text" : "inherit",
            width: "100%",
            height: "100%",
            userSelect: editingTextId === layer.id ? "text" : "none",
          }}
        >
          {layer.content}
        </div>
      )}

      {layer.type === "rect" && <div className="w-full h-full" />}

      {layer.type === "image" && (
        <img
          src={layer.url}
          alt="Layer"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}

      {layer.type === "component-instance" && (
        <div className="w-full h-full relative">
          {(layer.nodes || []).map((child) => (
            <CanvasLayer
              key={`${child.id}_${layer.id}`}
              layer={child}
              isInstanceChild
            />
          ))}
        </div>
      )}
    </div>
  );
}
