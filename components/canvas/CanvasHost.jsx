"use client";

import { useCallback, useMemo, useRef } from "react";
import AdaptiveGrid from "./AdaptiveGrid";
import InfinitePlane from "./InfinitePlane";
import RulerHorizontal from "./Rulers/RulerHorizontal";
import RulerVertical from "./Rulers/RulerVertical";
import CanvasOverlays from "./CanvasOverlays";
import { useSelectionStore } from "@/zustand/selectionStore";
import { useNodeTreeStore } from "@/zustand/nodeTreeStore";
import { getSelectedBounds } from "@/lib/canvas-core/selection";
import { applyResize, calculateAngle } from "@/lib/canvas-core/transforms";
import { useToolStore } from "@/zustand/toolStore";
import { getSnapPoints, snapValue } from "@/lib/canvas-core/snapping";
import { useSnappingStore } from "@/zustand/snappingStore";
import { NODE_TYPES } from "@/lib/nodeTypes";
import { useComponentStore } from "@/zustand/componentStore";
import { useUndoStore } from "@/zustand/undoStore";
import useCanvasPan from "./interactions/useCanvasPan";
import useCanvasZoom from "./interactions/useCanvasZoom";
import { useCanvasTransforms } from "./interactions/useCanvasTransforms";
import { useCanvasState } from "@/lib/canvas-core/canvasState";
const boundsFromPoints = (points = []) => {
  if (!points.length) return { x: 0, y: 0, width: 1, height: 1 };
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return { x: minX, y: minY, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY) };
};

export default function CanvasHost({
  children,
  nodeMap = {},
  selectionBox = null,
  enablePanZoom = false,
}) {
  const selectedIds = useSelectionStore((s) => s.selectedIds);
  const clearSelection = useSelectionStore((s) => s.deselectAll);
  const nodes = useNodeTreeStore((s) => s.nodes);
  const rootIds = useNodeTreeStore((s) => s.rootIds);
  const updateNode = useNodeTreeStore((s) => s.updateNode);
  const addNode = useNodeTreeStore((s) => s.addNode);
  const snapToGrid = useToolStore((s) => s.snapToGrid);
  const gridSize = useToolStore((s) => s.gridSize);
  const setGuides = useSnappingStore((s) => s.setGuides);
  const clearGuides = useSnappingStore((s) => s.clearGuides);
  const draggingComponentId = useComponentStore((s) => s.draggingComponentId);
  const clearDraggingComponent = useComponentStore((s) => s.clearDraggingComponent);
  const pushHistory = useUndoStore((s) => s.push);
  const containerRef = useRef(null);
  const { pan, isPanning } = useCanvasPan(containerRef);
  const { zoom } = useCanvasZoom(containerRef);
  const showGrid = useCanvasState((s) => s.gridVisible);
  const showRulers = useCanvasState((s) => s.rulersVisible);

  const dragRef = useRef(null);
  const resizeRef = useRef(null);
  const creationRef = useRef(null);
  const rotateRef = useRef(null);
  const { toLocal } = useCanvasTransforms(containerRef, pan, zoom);

  const activeNodeMap = nodeMap && Object.keys(nodeMap).length ? nodeMap : nodes;
  const selectedBounds = getSelectedBounds(selectedIds, activeNodeMap);

  const findParentFrame = (x, y) => {
    const frames = Object.values(nodes || {}).filter((n) => n?.type === NODE_TYPES.FRAME);
    const containing = frames.filter((f) => x >= f.x && x <= f.x + f.width && y >= f.y && y <= f.y + f.height);
    if (!containing.length) return null;
    // Prefer the smallest enclosing frame (deepest).
    return containing.sort((a, b) => a.width * a.height - b.width * b.height)[0].id;
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

  const startResize = useCallback((e, handle) => {
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
  }, [selectedBounds, selectedIds, nodes]);

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

    const tool = useToolStore.getState().tool;

    const { x: localX, y: localY } = toLocal(e.clientX, e.clientY);

    if (tool !== "select") {
      if (tool === "rectangle" || tool === "frame") {
        const id = crypto.randomUUID();
        const parent = tool === "frame" ? null : findParentFrame(localX, localY);
        addNode({
          id,
          type: tool === "rectangle" ? NODE_TYPES.RECT : NODE_TYPES.FRAME,
          name: tool === "rectangle" ? "Rectangle" : "Frame",
          x: localX,
          y: localY,
          width: 1,
          height: 1,
          rotation: 0,
          fill: tool === "frame" ? "#ffffff" : "#4a4a4a",
          parent,
          children: [],
        });
        useSelectionStore.getState().setSelectedManual([id]);
        creationRef.current = { id, startX: localX, startY: localY, type: tool };
        return;
      }

      if (tool === "ellipse") {
        const id = crypto.randomUUID();
        const parent = findParentFrame(localX, localY);
        addNode({
          id,
          type: NODE_TYPES.ELLIPSE,
          name: "Ellipse",
          x: localX,
          y: localY,
          width: 1,
          height: 1,
          rotation: 0,
          fill: "#ffffff",
          stroke: "#000000",
          strokeWidth: 1,
          parent,
          children: [],
        });
        useSelectionStore.getState().setSelectedManual([id]);
        creationRef.current = { id, startX: localX, startY: localY, type: tool };
        return;
      }

      if (tool === "line") {
        const id = crypto.randomUUID();
        const parent = findParentFrame(localX, localY);
        addNode({
          id,
          type: NODE_TYPES.LINE,
          name: "Line",
          x: localX,
          y: localY,
          x1: localX,
          y1: localY,
          x2: localX,
          y2: localY,
          width: 1,
          height: 1,
          stroke: "#000000",
          strokeWidth: 2,
          parent,
          children: [],
        });
        useSelectionStore.getState().setSelectedManual([id]);
        creationRef.current = { id, startX: localX, startY: localY, type: tool };
        return;
      }

      if (tool === "polygon") {
        const id = crypto.randomUUID();
        const parent = findParentFrame(localX, localY);
        const points = [
          { x: localX, y: localY },
          { x: localX + 1, y: localY + 1 },
          { x: localX + 1, y: localY },
        ];
        const bounds = boundsFromPoints(points);
        addNode({
          id,
          type: NODE_TYPES.POLYGON,
          name: "Polygon",
          points,
          sides: 3,
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
          rotation: 0,
          fill: "#ffffff",
          stroke: "#000000",
          strokeWidth: 1,
          parent,
          children: [],
        });
        useSelectionStore.getState().setSelectedManual([id]);
        creationRef.current = { id, startX: localX, startY: localY, type: tool, sides: 3 };
        return;
      }

      if (tool === "pen" || tool === "pencil") {
        const id = crypto.randomUUID();
        const parent = findParentFrame(localX, localY);
        const segments = [{ x: localX, y: localY, type: "move" }];
        addNode({
          id,
          type: NODE_TYPES.PATH,
          name: "Path",
          x: localX,
          y: localY,
          width: 1,
          height: 1,
          stroke: "#000000",
          strokeWidth: 2,
          fill: "transparent",
          segments,
          closed: false,
          parent,
          children: [],
        });
        useSelectionStore.getState().setSelectedManual([id]);
        creationRef.current = { id, startX: localX, startY: localY, type: tool, points: segments };
        return;
      }

      if (tool === "text") {
        const id = crypto.randomUUID();
        const parent = findParentFrame(localX, localY);
        addNode({
          id,
          type: NODE_TYPES.RICH_TEXT,
          name: "Text",
          x: localX,
          y: localY,
          width: 200,
          height: 40,
          autoWidth: false,
          autoHeight: true,
          spans: [
            {
              text: "Double-click to edit",
              fontFamily: "Inter",
              fontSize: 18,
              fontWeight: 400,
              color: "#ffffff",
              italic: false,
              underline: false,
              letterSpacing: 0,
              lineHeight: 1.4,
            },
          ],
          rotation: 0,
          parent,
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
    if (creationRef.current) {
      const { x: localX, y: localY } = toLocal(e.clientX, e.clientY);
      const { id, startX, startY, type, points } = creationRef.current;

      if (type === "ellipse" || type === "rectangle" || type === "frame") {
        updateNode(id, {
          x: Math.min(startX, localX),
          y: Math.min(startY, localY),
          width: Math.abs(localX - startX),
          height: Math.abs(localY - startY),
        });
        return;
      }

      if (type === "line") {
        const x1 = startX;
        const y1 = startY;
        const x2 = localX;
        const y2 = localY;
        updateNode(id, {
          x: Math.min(x1, x2),
          y: Math.min(y1, y2),
          width: Math.max(1, Math.abs(x2 - x1)),
          height: Math.max(1, Math.abs(y2 - y1)),
          x1,
          y1,
          x2,
          y2,
        });
        return;
      }

      if (type === "polygon") {
        const sides = creationRef.current.sides || 3;
        const radius = Math.max(1, Math.hypot(localX - startX, localY - startY));
        const baseAngle = -Math.PI / 2;
        const pts = Array.from({ length: sides }).map((_, i) => ({
          x: startX + Math.cos(baseAngle + i * ((2 * Math.PI) / sides)) * radius,
          y: startY + Math.sin(baseAngle + i * ((2 * Math.PI) / sides)) * radius,
        }));
        const bounds = boundsFromPoints(pts);
        updateNode(id, {
          points: pts,
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
        });
        return;
      }

      if (type === "pen" || type === "pencil") {
        const segs = [...(points || [])];
        segs.push({ x: localX, y: localY, type: "line" });
        const bounds = boundsFromPoints(segs);
        creationRef.current.points = segs;
        updateNode(id, {
          segments: segs,
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
        });
        return;
      }
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
    if (creationRef.current) {
      creationRef.current = null;
      useToolStore.getState().setTool("select");
    }
    clearGuides();
  };

  const onMouseLeave = () => {};

  const handleDrop = (e) => {
    const transferId = e.dataTransfer?.getData("application/x-component-id");
    const compId = transferId || draggingComponentId;
    if (!compId) return;
    e.preventDefault();

    const { x: localX, y: localY } = toLocal(e.clientX, e.clientY);

    // Prefer current selection if it's a component instance; otherwise hit-test.
    let targetId =
      selectedIds.find(
        (id) => nodes[id]?.type === NODE_TYPES.COMPONENT_INSTANCE || nodes[id]?.type === "component-instance",
      ) || null;

    if (!targetId) {
      const candidates = Object.values(nodes || {}).filter((n) => n.type === "component-instance");
      const hit = candidates
        .filter((n) => localX >= n.x && localX <= n.x + (n.width || 0) && localY >= n.y && localY <= n.y + (n.height || 0))
        .sort((a, b) => (a.width || 0) * (a.height || 0) - (b.width || 0) * (b.height || 0))[0];
      if (hit) targetId = hit.id;
    }

    if (!targetId) {
      clearDraggingComponent();
      return;
    }

    const before = {
      kind: "tree",
      before: {
        nodes: JSON.parse(JSON.stringify(nodes)),
        rootIds: [...rootIds],
        components: JSON.parse(JSON.stringify(useComponentStore.getState().components)),
      },
    };
    updateNode(targetId, { componentId: compId, variantId: null, propOverrides: {}, nodeOverrides: {} });
    const after = {
      nodes: JSON.parse(JSON.stringify(useNodeTreeStore.getState().nodes)),
      rootIds: [...useNodeTreeStore.getState().rootIds],
      components: JSON.parse(JSON.stringify(useComponentStore.getState().components)),
    };
    pushHistory({ kind: "tree", before: before.before, after });
    clearDraggingComponent();
  };

  const cursorClass = enablePanZoom && isPanning ? "cursor-grabbing" : "cursor-default";

  const renderedChildren = useMemo(() => children, [children]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-[#f4f5f7] ${cursorClass}`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onDragOver={(e) => {
        if (draggingComponentId || (e.dataTransfer && e.dataTransfer.types.includes("application/x-component-id"))) {
          e.preventDefault();
        }
      }}
      onDrop={handleDrop}
    >
      {showRulers && (
        <>
          <RulerHorizontal pan={pan} zoom={zoom} />
          <RulerVertical pan={pan} zoom={zoom} />
        </>
      )}
      {showGrid && <AdaptiveGrid zoom={zoom} />}

      <InfinitePlane>{renderedChildren}</InfinitePlane>

      <CanvasOverlays
        nodeMap={activeNodeMap}
        selectionBox={selectionBox}
        startResize={startResize}
        pan={pan}
        zoom={zoom}
      />
    </div>
  );
}
