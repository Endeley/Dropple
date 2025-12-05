"use client";

import { useEditorStore } from "../hooks/useEditorStore";

function Handle({ x, y, cursor, onMouseDown }) {
  const size = 10;
  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        position: "absolute",
        width: size,
        height: size,
        background: "white",
        border: "1px solid #3b82f6",
        borderRadius: 2,
        left: x - size / 2,
        top: y - size / 2,
        cursor,
      }}
    />
  );
}

export default function TransformHandles({ node }) {
  const updateNode = useEditorStore((s) => s.updateNode);

  const startResize = (direction) => (e) => {
    e.stopPropagation();
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;
    const start = { ...node };

    const onMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      let updates = {};

      if (direction.includes("l")) {
        updates.x = start.x + dx;
        updates.width = start.width - dx;
      }
      if (direction.includes("r")) {
        updates.width = start.width + dx;
      }
      if (direction.includes("t")) {
        updates.y = start.y + dy;
        updates.height = start.height - dy;
      }
      if (direction.includes("b")) {
        updates.height = start.height + dy;
      }

      // Prevent negative sizes
      updates.width = Math.max(10, updates.width ?? start.width);
      updates.height = Math.max(10, updates.height ?? start.height);

      updateNode(node.id, updates);
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const startRotate = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const centerX = node.x + node.width / 2;
    const centerY = node.y + node.height / 2;
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);

    const onMove = (moveEvent) => {
      const angle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX);
      const rotation = ((angle - startAngle) * 180) / Math.PI;
      updateNode(node.id, { rotation });
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const { x, y, width, height } = node;
  const cx = x + width / 2;
  const cy = y + height / 2;

  return (
    <>
      <Handle x={x} y={y} cursor="nwse-resize" onMouseDown={startResize("tl")} />
      <Handle x={cx} y={y} cursor="ns-resize" onMouseDown={startResize("t")} />
      <Handle x={x + width} y={y} cursor="nesw-resize" onMouseDown={startResize("tr")} />

      <Handle x={x} y={cy} cursor="ew-resize" onMouseDown={startResize("l")} />
      <Handle x={x + width} y={cy} cursor="ew-resize" onMouseDown={startResize("r")} />

      <Handle x={x} y={y + height} cursor="nesw-resize" onMouseDown={startResize("bl")} />
      <Handle x={cx} y={y + height} cursor="ns-resize" onMouseDown={startResize("b")} />
      <Handle x={x + width} y={y + height} cursor="nwse-resize" onMouseDown={startResize("br")} />

      {/* rotation handle */}
      <Handle x={cx} y={y - 20} cursor="grab" onMouseDown={startRotate} />
    </>
  );
}
