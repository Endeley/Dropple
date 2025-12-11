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
  const reparentNode = useNodeTreeStore((s) => s.reparentNode);
  const snapToGrid = useToolStore((s) => s.snapToGrid);
  const gridSize = useToolStore((s) => s.gridSize);
  const setGuides = useSnappingStore((s) => s.setGuides);
  const clearGuides = useSnappingStore((s) => s.clearGuides);
  const setHighlightTarget = useSnappingStore((s) => s.setHighlightTarget);
  const clearHighlight = useSnappingStore((s) => s.clearHighlight);
  const setDropIndicator = useSnappingStore((s) => s.setDropIndicator);
  const clearDropIndicator = useSnappingStore((s) => s.clearDropIndicator);
  const dropIndicator = useSnappingStore((s) => s.dropIndicator);
  const setSpacingPreview = useSnappingStore((s) => s.setSpacingPreview);
  const clearSpacingPreview = useSnappingStore((s) => s.clearSpacingPreview);
  const draggingComponentId = useComponentStore((s) => s.draggingComponentId);
  const clearDraggingComponent = useComponentStore((s) => s.clearDraggingComponent);
  const pushHistory = useUndoStore((s) => s.push);
  const createInstance = useNodeTreeStore((s) => s.createInstance);
  const recomputeConstraintOffsetsForParent = useNodeTreeStore((s) => s.recomputeConstraintOffsetsForParent);
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
      lastPos: toLocal(e.clientX, e.clientY),
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
        const isFrame = tool === "frame";
        addNode({
          id,
          type: isFrame ? NODE_TYPES.FRAME : NODE_TYPES.RECT,
          name: isFrame ? "Frame" : "Rectangle",
          x: localX,
          y: localY,
          width: 1,
          height: 1,
          rotation: 0,
          // Leave frame fill undefined so node defaults supply a visible background.
          fill: isFrame ? undefined : "#4a4a4a",
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
      dragRef.current.lastPos = toLocal(e.clientX, e.clientY);
      const hoveredContainer = hitTestContainer(dragRef.current.lastPos.x, dragRef.current.lastPos.y);
      if (hoveredContainer) {
        setHighlightTarget(hoveredContainer.id);
        if (hoveredContainer.autoLayout?.enabled) {
          const dropIndicator = computeAutoLayoutDropIndicator(
            hoveredContainer,
            dragRef.current.lastPos.x,
            dragRef.current.lastPos.y,
          );
          setDropIndicator(dropIndicator);
        } else {
          clearDropIndicator();
        }
        // Alt-drag to adjust spacing quickly.
        if (e.altKey && hoveredContainer.autoLayout?.enabled) {
          const vertical = hoveredContainer.autoLayout.direction !== "horizontal";
          const delta = vertical ? dy : dx;
          const nextSpacing = Math.max(0, (hoveredContainer.autoLayout.spacing || 0) + delta);
          updateNode(hoveredContainer.id, {
            autoLayout: { ...(hoveredContainer.autoLayout || {}), spacing: nextSpacing },
          });
          const pad = hoveredContainer.autoLayout?.padding || { top: 0, right: 0, bottom: 0, left: 0 };
          const lineY = vertical
            ? (dropIndicator?.y ?? hoveredContainer.y + (hoveredContainer.height || 0) / 2)
            : hoveredContainer.y + pad.top;
          const lineX = vertical
            ? hoveredContainer.x + pad.left
            : (dropIndicator?.x ?? hoveredContainer.x + (hoveredContainer.width || 0) / 2);
          const lineX2 = hoveredContainer.x + (hoveredContainer.width || 0) - pad.right;
          const lineY2 = hoveredContainer.y + (hoveredContainer.height || 0) - pad.bottom;
          setSpacingPreview({
            parentId: hoveredContainer.id,
            spacing: nextSpacing,
            x: lineX,
            y: lineY,
            x2: vertical ? lineX2 : lineX,
            y2: vertical ? lineY : lineY2,
            vertical,
          });
        } else {
          clearSpacingPreview();
        }
      } else {
        clearHighlight();
        clearDropIndicator();
        clearSpacingPreview();
      }
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
    const resizedId = resizeRef.current?.nodeId;
    if (dragRef.current) {
      const lastPos = dragRef.current.lastPos;
      if (lastPos) {
        // Hit-test for potential parent frame.
        const potentialParent = hitTestNode(lastPos.x, lastPos.y);
        const childId = selectedIds[0];
        if (
          potentialParent &&
          potentialParent.type === NODE_TYPES.FRAME &&
          childId &&
          childId !== potentialParent.id &&
          nodes[potentialParent.id]?.parent !== childId
        ) {
          reparentNode(childId, potentialParent.id);
        }
        if (potentialParent?.autoLayout?.enabled && dropIndicator?.parentId === potentialParent.id) {
          const parent = nodes[potentialParent.id];
          const draggedId = selectedIds[0];
          if (parent && draggedId && parent.children?.includes(draggedId)) {
            const newChildren = [...parent.children];
            const fromIdx = newChildren.indexOf(draggedId);
            const toIdx = Math.min(dropIndicator.index, newChildren.length - 1);
            if (fromIdx > -1 && toIdx > -1 && fromIdx !== toIdx) {
              newChildren.splice(fromIdx, 1);
              newChildren.splice(toIdx, 0, draggedId);
              newChildren.forEach((cid, i) => updateNode(cid, { order: i }));
              updateNode(parent.id, { children: newChildren });
            }
          }
        }
      }
      dragRef.current = null;
    }
    clearHighlight();
    clearDropIndicator();
    clearSpacingPreview();
    resizeRef.current = null;
    rotateRef.current = null;
    if (creationRef.current) {
      creationRef.current = null;
      useToolStore.getState().setTool("select");
    }
    if (resizedId) {
      applyConstraintsForParent(resizedId);
    }
    clearGuides();
  };

  const onMouseLeave = () => {
    clearHighlight();
    clearDropIndicator();
    clearSpacingPreview();
  };

  // Hit-test any node at point (local coordinates).
  const hitTestNode = (localX, localY) => {
    const all = Object.values(nodes || {});
    const sorted = all
      .filter((n) => n && n.width != null && n.height != null)
      .sort((a, b) => {
        const areaA = (a.width || 0) * (a.height || 0);
        const areaB = (b.width || 0) * (b.height || 0);
        return areaA - areaB;
      });
    return sorted.find(
      (n) => localX >= n.x && localX <= n.x + (n.width || 0) && localY >= n.y && localY <= n.y + (n.height || 0),
    );
  };

  // Hit-test only container nodes (frames/shapes).
  const hitTestContainer = (x, y) => {
    const containers = Object.values(nodes || {}).filter((n) => n && (n.type === NODE_TYPES.FRAME || n.type === "shape"));
    const sorted = containers.sort((a, b) => (a.width || 0) * (a.height || 0) - (b.width || 0) * (b.height || 0));
    return sorted.find((n) => x >= n.x && x <= n.x + (n.width || 0) && y >= n.y && y <= n.y + (n.height || 0));
  };

  const computeAutoLayoutDropIndicator = (parent, localX, localY) => {
    if (!parent) return { parentId: null, index: 0, x: 0, y: 0 };
    const vertical = parent.autoLayout?.direction !== "horizontal";
    const children = (parent.children || [])
      .map((id) => nodes[id])
      .filter(Boolean)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    let targetIndex = children.length;
    const gap = parent.autoLayout?.spacing || 0;
    const pad = parent.autoLayout?.padding || { top: 0, right: 0, bottom: 0, left: 0 };
    let lineX = parent.x + pad.left;
    let lineY = parent.y + pad.top;

    for (let i = 0; i < children.length; i++) {
      const c = children[i];
      const beforeEdge = vertical ? c.y - gap / 2 : c.x - gap / 2;
      if ((vertical && localY < beforeEdge) || (!vertical && localX < beforeEdge)) {
        targetIndex = i;
        lineX = vertical ? parent.x + pad.left : Math.max(parent.x + pad.left, beforeEdge);
        lineY = vertical ? Math.max(parent.y + pad.top, beforeEdge) : parent.y + pad.top;
        break;
      }
    }

    if (!children.length) {
      lineX = parent.x + pad.left;
      lineY = parent.y + pad.top;
      targetIndex = 0;
    } else if (targetIndex === children.length) {
      const last = children[children.length - 1];
      lineX = vertical ? parent.x + pad.left : last.x + last.width + gap / 2;
      lineY = vertical ? last.y + last.height + gap / 2 : parent.y + pad.top;
    }

    // Clamp line to padding box.
    const minX = parent.x + pad.left;
    const maxX = parent.x + (parent.width || 0) - pad.right;
    const minY = parent.y + pad.top;
    const maxY = parent.y + (parent.height || 0) - pad.bottom;
    lineX = Math.min(Math.max(lineX, minX), maxX);
    lineY = Math.min(Math.max(lineY, minY), maxY);

    return { parentId: parent.id, index: targetIndex, x: lineX, y: lineY };
  };

  const applyConstraintsForParent = (parentId) => {
    const allNodes = useNodeTreeStore.getState().nodes;
    const parent = allNodes[parentId];
    if (!parent) return;
    Object.values(allNodes).forEach((child) => {
      if (!child || child.parent !== parentId) return;
      const c = child.constraints || {};
      const offs = child.constraintOffsets || { left: 0, right: 0, top: 0, bottom: 0 };
      let nextX = child.x ?? 0;
      let nextY = child.y ?? 0;
      let nextW = child.width ?? 0;
      let nextH = child.height ?? 0;

      switch (c.horizontal) {
        case "left-right":
          nextX = parent.x + offs.left;
          nextW = (parent.width ?? 0) - offs.left - offs.right;
          break;
        case "stretch":
          nextX = parent.x;
          nextW = parent.width ?? nextW;
          break;
        case "center":
          nextX = parent.x + (parent.width ?? 0) / 2 - nextW / 2;
          break;
        case "right":
          nextX = parent.x + (parent.width ?? 0) - nextW - offs.right;
          break;
        default:
          nextX = parent.x + offs.left;
      }

      switch (c.vertical) {
        case "top-bottom":
          nextY = parent.y + offs.top;
          nextH = (parent.height ?? 0) - offs.top - offs.bottom;
          break;
        case "stretch":
          nextY = parent.y;
          nextH = parent.height ?? nextH;
          break;
        case "center":
          nextY = parent.y + (parent.height ?? 0) / 2 - nextH / 2;
          break;
        case "bottom":
          nextY = parent.y + (parent.height ?? 0) - nextH - offs.bottom;
          break;
        default:
          nextY = parent.y + offs.top;
      }

      updateNode(child.id, {
        x: nextX,
        y: nextY,
        width: nextW,
        height: nextH,
      });
    });
    recomputeConstraintOffsetsForParent(parentId);
  };

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

    const snapshotBefore = {
      nodes: JSON.parse(JSON.stringify(useNodeTreeStore.getState().nodes)),
      rootIds: [...useNodeTreeStore.getState().rootIds],
      components: JSON.parse(JSON.stringify(useComponentStore.getState().components)),
    };

    if (!targetId) {
      const newId = createInstance(compId, localX, localY);
      if (newId) {
        useSelectionStore.getState().setSelectedManual([newId]);
      }
    } else {
      updateNode(targetId, { componentId: compId, variantId: null, propOverrides: {}, nodeOverrides: {} });
    }

    const snapshotAfter = {
      nodes: JSON.parse(JSON.stringify(useNodeTreeStore.getState().nodes)),
      rootIds: [...useNodeTreeStore.getState().rootIds],
      components: JSON.parse(JSON.stringify(useComponentStore.getState().components)),
    };
    pushHistory({ kind: "tree", before: snapshotBefore, after: snapshotAfter });
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
