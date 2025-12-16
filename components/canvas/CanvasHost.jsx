'use client';

import { useCallback, useRef } from 'react';
import { computeConstraintPreview } from '@/lib/canvas-core/constraints/computeConstraintPreview';

import AdaptiveGrid from './AdaptiveGrid';
import InfinitePlane from './InfinitePlane';
import RulerHorizontal from './Rulers/RulerHorizontal';
import RulerVertical from './Rulers/RulerVertical';
import CanvasOverlays from './CanvasOverlays';

import { useSelectionStore } from '@/zustand/selectionStore';
import { useNodeTreeStore } from '@/zustand/nodeTreeStore';
import { useToolStore } from '@/zustand/toolStore';
import { useSnappingStore } from '@/zustand/snappingStore';
import { useConstraintPreviewStore } from '@/zustand/constraintPreviewStore';
import { useCanvasState } from '@/lib/canvas-core/canvasState';

import { getSelectedBounds } from '@/lib/canvas-core/selection';
import { applyResize, calculateAngle, getResizeMode } from '@/lib/canvas-core/transforms';
import { getSnapPoints, snapValue } from '@/lib/canvas-core/snapping';

import useCanvasPan from './interactions/useCanvasPan';
import useCanvasZoom from './interactions/useCanvasZoom';
import { useCanvasTransforms } from './interactions/useCanvasTransforms';

import { NODE_TYPES } from '@/lib/nodeTypes';

/* ---------------------------------------------
   CanvasHost
--------------------------------------------- */

export default function CanvasHost({ children, nodeMap = {}, selectionBox = null, enablePanZoom = false }) {
    /* ---------- STORES ---------- */

    const selectedIds = useSelectionStore((s) => s.selectedIds);
    const clearSelection = useSelectionStore((s) => s.deselectAll);

    const nodes = useNodeTreeStore((s) => s.nodes);
    const updateNode = useNodeTreeStore((s) => s.updateNode);
    const addNode = useNodeTreeStore((s) => s.addNode);
    const applyConstraintsForParent = useNodeTreeStore((s) => s.applyConstraintsForParent);
    const recomputeConstraintOffsetsForNode = useNodeTreeStore((s) => s.recomputeConstraintOffsetsForNode);

    const previewNodes = useConstraintPreviewStore((s) => s.previewNodes);
    const setPreviewNodes = useConstraintPreviewStore((s) => s.setPreviewNodes);
    const clearPreview = useConstraintPreviewStore((s) => s.clearPreview);

    const snapToGrid = useToolStore((s) => s.snapToGrid);
    const gridSize = useToolStore((s) => s.gridSize);

    const setGuides = useSnappingStore((s) => s.setGuides);
    const clearGuides = useSnappingStore((s) => s.clearGuides);

    const showGrid = useCanvasState((s) => s.gridVisible);
    const showRulers = useCanvasState((s) => s.rulersVisible);

    /* ---------- REFS ---------- */

    const containerRef = useRef(null);
    const dragRef = useRef(null);
    const resizeRef = useRef(null);
    const rotateRef = useRef(null);
    const creationRef = useRef(null);

    /* ---------- PAN / ZOOM ---------- */

    const { pan, isPanning } = useCanvasPan(containerRef);
    const { zoom } = useCanvasZoom(containerRef);
    const { toLocal } = useCanvasTransforms(containerRef, pan, zoom);

    /* ---------- DERIVED ---------- */

    const activeNodeMap = nodeMap && Object.keys(nodeMap).length ? nodeMap : nodes;
    const selectedBounds = getSelectedBounds(selectedIds, activeNodeMap);

    /* ---------------------------------------------
       ROTATE
    --------------------------------------------- */

    const startRotate = useCallback(
        (e) => {
            if (!selectedBounds) return;
            e.stopPropagation();

            const center = {
                x: selectedBounds.x + selectedBounds.width / 2,
                y: selectedBounds.y + selectedBounds.height / 2,
            };

            rotateRef.current = {
                center,
                startAngle: calculateAngle(center, toLocal(e.clientX, e.clientY)),
                initialRotations: selectedIds.map((id) => nodes[id]?.rotation || 0),
            };
        },
        [selectedBounds, selectedIds, nodes, toLocal]
    );

    /* ---------------------------------------------
       RESIZE
    --------------------------------------------- */

    const startResize = useCallback(
        (e, handle) => {
            if (!selectedBounds) return;
            e.stopPropagation();

            resizeRef.current = {
                startX: e.clientX,
                startY: e.clientY,
                handle,
                resizeMode: getResizeMode(handle),
                nodeId: selectedIds[0],
                initialNode: nodes[selectedIds[0]],
            };
        },
        [selectedBounds, selectedIds, nodes]
    );

    /* ---------------------------------------------
       DRAG
    --------------------------------------------- */

    const startDrag = (e) => {
        if (!selectedIds.length || !selectedBounds) return;

        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            initialPositions: Object.fromEntries(selectedIds.map((id) => [id, { x: nodes[id].x, y: nodes[id].y }])),
        };
    };

    /* ---------------------------------------------
       MOUSE MOVE
    --------------------------------------------- */

    const onMouseMove = (e) => {
        if (resizeRef.current) {
            const { startX, startY, handle, nodeId, initialNode, resizeMode } = resizeRef.current;

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

            if (resizeMode === 'constraint') {
                setPreviewNodes({
                    __parent: next,
                    nodes: computeConstraintPreview(next, nodes),
                });
            } else {
                clearPreview();
            }

            return;
        }

        /* ---- DRAG ---- */
        if (dragRef.current && resizeRef.current?.resizeMode !== 'constraint') {
            const { startX, startY, initialPositions } = dragRef.current;

            const dx = (e.clientX - startX) / zoom;
            const dy = (e.clientY - startY) / zoom;

            const snapPoints = getSnapPoints(nodes, selectedIds);
            const guides = [];

            selectedIds.forEach((id) => {
                let nx = initialPositions[id].x + dx;
                let ny = initialPositions[id].y + dy;

                const sx = snapValue(nx, snapPoints.x);
                const sy = snapValue(ny, snapPoints.y);

                if (Math.abs(sx - nx) < 6) nx = sx;
                if (Math.abs(sy - ny) < 6) ny = sy;

                if (snapToGrid) {
                    nx = Math.round(nx / gridSize) * gridSize;
                    ny = Math.round(ny / gridSize) * gridSize;
                }

                updateNode(id, { x: nx, y: ny });
            });

            setGuides(guides);
        }
    };;

    /* ---------------------------------------------
       MOUSE UP
    --------------------------------------------- */

    const onMouseUp = () => {
        const resizeData = resizeRef.current;

        resizeRef.current = null;
        dragRef.current = null;
        rotateRef.current = null;
        creationRef.current = null;

        clearGuides();
        clearPreview();

        if (resizeData) {
            const { nodeId, resizeMode } = resizeData;
            const parentId = nodes[nodeId]?.parent;

            if (resizeMode === 'constraint' && parentId) {
                applyConstraintsForParent(parentId);
            }

            if (resizeMode === 'scale') {
                nodes[nodeId]?.children?.forEach((cid) => {
                    recomputeConstraintOffsetsForNode(cid);
                });
            }
        }
    };

    /* ---------------------------------------------
       RENDER
    --------------------------------------------- */

    const cursorClass = enablePanZoom && isPanning ? 'cursor-grabbing' : 'cursor-default';

    return (
        <div ref={containerRef} className={`relative w-full h-full overflow-hidden bg-[#f4f5f7] ${cursorClass}`} onMouseDown={startDrag} onMouseMove={onMouseMove} onMouseUp={onMouseUp}>
            {showRulers && (
                <>
                    <RulerHorizontal pan={pan} zoom={zoom} />
                    <RulerVertical pan={pan} zoom={zoom} />
                </>
            )}

            {showGrid && <AdaptiveGrid zoom={zoom} />}

            <InfinitePlane>{children}</InfinitePlane>

            <CanvasOverlays nodeMap={activeNodeMap} previewNodes={previewNodes} selectionBox={selectionBox} startResize={startResize} startRotate={startRotate} pan={pan} zoom={zoom} bounds={selectedBounds} />
        </div>
    );
}
