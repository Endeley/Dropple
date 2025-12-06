"use client";

import { useRef, useState } from "react";
import CanvasGrid from "./CanvasGrid";
import CanvasRulers from "./CanvasRulers";
import CanvasOverlays from "./CanvasOverlays";
import { useSelectionStore } from "@/zustand/selectionStore";
import { useNodeTreeStore } from "@/zustand/nodeTreeStore";
import { getSelectedBounds } from "@/lib/canvas-core/selection";
import { applyResize, calculateAngle } from "@/lib/canvas-core/transforms";
import { useToolStore } from "@/zustand/toolStore";
import { getSnapPoints, snapValue } from "@/lib/canvas-core/snapping";
import { useSnappingStore } from "@/zustand/snappingStore";

export default function CanvasHost({
  children,
  nodeMap = {},
  selectionBox = null,
  enablePanZoom = false,
}) {
  const selectedIds = useSelectionStore((s) => s.selectedIds);
  const clearSelection = useSelectionStore((s) => s.deselectAll);
  const nodes = useNodeTreeStore((s) => s.nodes);
  const updateNode = useNodeTreeStore((s) => s.updateNode);
  const addNode = useNodeTreeStore((s) => s.addNode);
  const snapToGrid = useToolStore((s) => s.snapToGrid);
  const gridSize = useToolStore((s) => s.gridSize);
  const setGuides = useSnappingStore((s) => s.setGuides);
  const clearGuides = useSnappingStore((s) => s.clearGuides);

  const dragRef = useRef(null);
  const resizeRef = useRef(null);
  const creationRef = useRef(null);
  const containerRef = useRef(null);
  const rotateRef = useRef(null);
  const panRef = useRef(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const selectedBounds = getSelectedBounds(selectedIds, nodeMap);

  const toLocal = (clientX, clientY) => {
    const rect = containerRef.current?.getBoundingClientRect();
    const x = (clientX - (rect?.left || 0) - pan.x) / zoom;
    const y = (clientY - (rect?.top || 0) - pan.y) / zoom;
    return { x, y };
  };

  const startDrag = (e) => {
    if (!selectedIds?.length || !selectedBounds) return;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPositions: selectedIds.reduce((acc, id) => {
        const n = nodes[id];
        if (n) acc[id] = { x: n.x, y: n.y };
        return acc;
      }, {}),
    };
  };

  const startResize = (e, handle) => {
    if (!selectedBounds) return;
    e.stopPropagation();
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      handle,
      initial: selectedBounds,
      nodeId: selectedIds[0],
      initialNode: nodes[selectedIds[0]],
    };
  };

  const onMouseDown = (e) => {
    if (e.target?.dataset?.handle === "rotate") {
      if (!selectedBounds) return;
      const center = {
        x: selectedBounds.x + selectedBounds.width / 2,
        y: selectedBounds.y + selectedBounds.height / 2,
      };
      rotateRef.current = {
        center,
        startAngle: calculateAngle(center, toLocal(e.clientX, e.clientY)),
        initialRotations: selectedIds.map((id) => nodes[id]?.rotation || 0),
      };
      return;
    }

    if (enablePanZoom && (e.button === 1 || e.button === 2)) {
      panRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        panStart: { ...pan },
      };
      return;
    }

    const tool = useToolStore.getState().tool;
    const { x: localX, y: localY } = toLocal(e.clientX, e.clientY);

    if (tool !== "select") {
      if (tool === "rectangle" || tool === "frame") {
        const id = crypto.randomUUID();
        addNode({
          id,
          type: tool === "rectangle" ? "rect" : "frame",
          name: tool === "rectangle" ? "Rectangle" : "Frame",
          x: localX,
          y: localY,
          width: 1,
          height: 1,
          rotation: 0,
          fill: tool === "frame" ? "#ffffff" : "#4a4a4a",
          parent: null,
          children: [],
        });
        useSelectionStore.getState().setSelectedManual([id]);
        creationRef.current = { id, startX: localX, startY: localY, type: tool };
        return;
      }

      if (tool === "text") {
        const id = crypto.randomUUID();
        addNode({
          id,
          type: "text",
          name: "Text",
          x: localX,
          y: localY,
          width: 200,
          height: 40,
          text: "Double-click to edit",
          fill: "#ffffff",
          fontSize: 18,
          rotation: 0,
          parent: null,
          children: [],
        });
        useSelectionStore.getState().setSelectedManual([id]);
        useToolStore.getState().setTool("select");
        return;
      }
    }

    if (e.target === e.currentTarget) {
      clearSelection();
      dragRef.current = null;
      resizeRef.current = null;
      return;
    }
    startDrag(e);
  };

  const onMouseMove = (e) => {
    if (panRef.current) {
      const dx = e.clientX - panRef.current.startX;
      const dy = e.clientY - panRef.current.startY;
      setPan({
        x: panRef.current.panStart.x + dx,
        y: panRef.current.panStart.y + dy,
      });
      return;
    }

    if (creationRef.current) {
      const { x: localX, y: localY } = toLocal(e.clientX, e.clientY);
      const { id, startX, startY } = creationRef.current;
      updateNode(id, {
        x: Math.min(startX, localX),
        y: Math.min(startY, localY),
        width: Math.abs(localX - startX),
        height: Math.abs(localY - startY),
      });
      return;
    }

    if (resizeRef.current) {
      const { startX, startY, handle, nodeId, initialNode } = resizeRef.current;
      if (!nodeId || !initialNode) return;
      const dx = (e.clientX - startX) / zoom;
      const dy = (e.clientY - startY) / zoom;
      const next = { ...initialNode };
      applyResize(next, handle, dx, dy);
      updateNode(nodeId, {
        x: next.x,
        y: next.y,
        width: next.width,
        height: next.height,
      });
      return;
    }

    if (rotateRef.current) {
      const { center, startAngle, initialRotations } = rotateRef.current;
      const currentAngle = calculateAngle(center, toLocal(e.clientX, e.clientY));
      let delta = currentAngle - startAngle;
      const snapAngles = [0, 90, 180, -90, -180];

      selectedIds.forEach((id, idx) => {
        let newRot = (initialRotations[idx] || 0) + delta;
        if (e.shiftKey) {
          newRot = Math.round(newRot / 45) * 45;
        }
        snapAngles.forEach((a) => {
          if (Math.abs(newRot - a) < 5) newRot = a;
        });
        updateNode(id, { rotation: newRot });
      });
      return;
    }

    if (dragRef.current) {
      const { startX, startY, initialPositions } = dragRef.current;
      const dx = (e.clientX - startX) / zoom;
      const dy = (e.clientY - startY) / zoom;
      const snapPoints = getSnapPoints(nodes, selectedIds);
      const guides = [];
      selectedIds.forEach((id) => {
        const startPos = initialPositions[id];
        if (!startPos) return;
        let nextX = startPos.x + dx;
        let nextY = startPos.y + dy;

        const snappedX = snapValue(nextX, snapPoints.x);
        const snappedY = snapValue(nextY, snapPoints.y);
        if (Math.abs(snappedX - nextX) <= 6) {
          guides.push({ type: "vertical", x: snappedX });
          nextX = snappedX;
        }
        if (Math.abs(snappedY - nextY) <= 6) {
          guides.push({ type: "horizontal", y: snappedY });
          nextY = snappedY;
        }

        if (snapToGrid) {
          nextX = Math.round(nextX / gridSize) * gridSize;
          nextY = Math.round(nextY / gridSize) * gridSize;
        }

        updateNode(id, { x: nextX, y: nextY });
      });
      setGuides(guides);
    }
  };

  const onMouseUp = () => {
    dragRef.current = null;
    resizeRef.current = null;
    rotateRef.current = null;
    panRef.current = null;
    if (creationRef.current) {
      creationRef.current = null;
      useToolStore.getState().setTool("select");
    }
    clearGuides();
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-neutral-100"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onWheel={(e) => {
        if (!enablePanZoom) return;
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          const factor = e.deltaY > 0 ? 0.95 : 1.05;
          const nextZoom = Math.min(4, Math.max(0.2, zoom * factor));
          setZoom(nextZoom);
        }
      }}
    >
      <CanvasRulers />
      <CanvasGrid />

      <div
        id="dropple-canvas-content"
        className="absolute inset-0"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        {typeof children === "function" ? children({ startResize }) : children}
      </div>

      <CanvasOverlays
        nodeMap={nodeMap}
        selectionBox={selectionBox}
        startResize={startResize}
        pan={pan}
        zoom={zoom}
      />
    </div>
  );
}
