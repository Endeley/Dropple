'use client';

import clsx from 'clsx';
import { useCallback, useMemo, useRef, useState } from 'react';
import ElementNode from './ElementNode';
import TimelineBar from './TimelineBar';
import { useCanvasStore } from './context/CanvasStore';
import { createFrameTargets, snapRectToTargets, snapResizedRectToTargets } from './utils/alignmentUtils';
import { FRAME_MIN_SIZE, RESIZE_HANDLES, computeResizedBox } from './utils/resizeUtils';

const DEFAULT_LAYOUT_PADDING = { top: 64, right: 64, bottom: 64, left: 64 };
const DEFAULT_GRID_COLUMNS = 3;
const DEFAULT_GRID_AUTO_ROWS = 240;
const DEFAULT_GRID_MIN_COLUMN_WIDTH = 240;

function normalizePadding(padding) {
    const base = { ...DEFAULT_LAYOUT_PADDING };
    if (!padding) return base;
    return {
        top: Number.isFinite(padding.top) ? padding.top : base.top,
        right: Number.isFinite(padding.right) ? padding.right : base.right,
        bottom: Number.isFinite(padding.bottom) ? padding.bottom : base.bottom,
        left: Number.isFinite(padding.left) ? padding.left : base.left,
    };
}

export function buildElementTree(elements, parentId = null) {
    if (!Array.isArray(elements)) return [];
    return elements
        .filter((element) => (element.parentId ?? null) === parentId)
        .map((element) => ({
            element,
            children: buildElementTree(elements, element.id),
        }));
}

export default function FrameNode({ frame }) {
    const selectedTool = useCanvasStore((state) => state.selectedTool);
    const selectedFrameId = useCanvasStore((state) => state.selectedFrameId);
    const scale = useCanvasStore((state) => state.scale);
    const prototypeMode = useCanvasStore((state) => state.prototypeMode);
    const mode = useCanvasStore((state) => state.mode);
    const timelineAssets = useCanvasStore((state) => state.timelineAssets);
    const setSelectedFrame = useCanvasStore((state) => state.setSelectedFrame);
    const updateFrame = useCanvasStore((state) => state.updateFrame);
    const comments = useCanvasStore((state) => state.comments);
    const setActiveToolOverlay = useCanvasStore((state) => state.setActiveToolOverlay);
    const selectElementsInRect = useCanvasStore((state) => state.selectElementsInRect);
    const setContextMenu = useCanvasStore((state) => state.setContextMenu);
    const gridVisible = useCanvasStore((state) => state.gridVisible);
    const gridSize = useCanvasStore((state) => state.gridSize);
    const autoLayoutPreview = useCanvasStore((state) => state.autoLayoutPreview);

    const dragStateRef = useRef(null);
    const resizeStateRef = useRef(null);
    const marqueeStateRef = useRef(null);
    const [marqueeRect, setMarqueeRect] = useState(null);

    if (!frame) return null;

    const isSelected = selectedFrameId === frame.id;
    const isPointerTool = !selectedTool || selectedTool === 'pointer';
    const showResizeHandles = isSelected && isPointerTool && !prototypeMode;
    const frameComments = useMemo(
        () => comments.filter((comment) => comment.frameId === frame.id && !comment.elementId),
        [comments, frame.id],
    );
    const frameTimelineAssets = useMemo(
        () => timelineAssets.filter((asset) => asset.frameId === frame.id),
        [timelineAssets, frame.id],
    );

    const elementTree = useMemo(() => buildElementTree(frame.elements ?? []), [frame.elements]);
    const timelineTotalDuration = useMemo(() => {
        if (frame.timelineDuration && frame.timelineDuration > 0) return frame.timelineDuration;
        const sum = frameTimelineAssets.reduce((acc, asset) => acc + (asset.duration || 0), 0);
        return sum > 0 ? sum : 1;
    }, [frame.timelineDuration, frameTimelineAssets]);
    const timelineDurationLabel = useMemo(() => {
        const rounded = Math.round(timelineTotalDuration * 10) / 10;
        return Number.isInteger(rounded) ? String(Math.trunc(rounded)) : rounded.toFixed(1);
    }, [timelineTotalDuration]);

    const frameBackgroundStyle = useMemo(() => {
        const fillType = frame.backgroundFillType ?? (frame.backgroundImage ? 'image' : 'solid');
        const gradientType = frame.backgroundGradientType ?? 'linear';
        const baseColor = frame.backgroundColor ?? 'rgba(15,23,42,0.94)';

        const layers = [];
        const sizes = [];
        const repeats = [];
        const positions = [];

        if (fillType === 'gradient') {
            const start = frame.backgroundGradientStart ?? '#8B5CF6';
            const end = frame.backgroundGradientEnd ?? '#3B82F6';
            const angle = frame.backgroundGradientAngle ?? 45;
            let gradient;
            switch (gradientType) {
                case 'radial':
                    gradient = `radial-gradient(circle, ${start} 0%, ${end} 100%)`;
                    break;
                case 'conic':
                    gradient = `conic-gradient(from ${angle}deg, ${start}, ${end})`;
                    break;
                case 'linear':
                default:
                    gradient = `linear-gradient(${angle}deg, ${start} 0%, ${end} 100%)`;
                    break;
            }
            layers.push(gradient);
            sizes.push('cover');
            repeats.push('no-repeat');
            positions.push('center');
        }

        if (fillType === 'image' && frame.backgroundImage) {
            layers.push(`url(${frame.backgroundImage})`);
            sizes.push(frame.backgroundFit ?? 'cover');
            repeats.push('no-repeat');
            positions.push('center');
        }

        if (fillType === 'pattern' && frame.backgroundImage) {
            const scale = Math.max(frame.backgroundPatternScale ?? 1, 0.01) * 100;
            layers.push(`url(${frame.backgroundImage})`);
            sizes.push(`${scale}%`);
            repeats.push(frame.backgroundPatternRepeat ?? 'repeat');
            positions.push(`${frame.backgroundPatternOffsetX ?? 0}px ${frame.backgroundPatternOffsetY ?? 0}px`);
        }

        return {
            backgroundColor: baseColor,
            backgroundImage: layers.length ? layers.join(', ') : undefined,
            backgroundSize: layers.length ? sizes.join(', ') : undefined,
            backgroundRepeat: layers.length ? repeats.join(', ') : undefined,
            backgroundPosition: layers.length ? positions.join(', ') : undefined,
            backgroundBlendMode: layers.length ? frame.backgroundBlendMode ?? 'normal' : undefined,
        };
    }, [
        frame.backgroundBlendMode,
        frame.backgroundColor,
        frame.backgroundFillType,
        frame.backgroundFit,
        frame.backgroundGradientAngle,
        frame.backgroundGradientEnd,
        frame.backgroundGradientStart,
        frame.backgroundGradientType,
        frame.backgroundImage,
        frame.backgroundPatternOffsetX,
        frame.backgroundPatternOffsetY,
        frame.backgroundPatternRepeat,
        frame.backgroundPatternScale,
    ]);

    const showLayoutOverlay = isSelected && frame.layoutMode && frame.layoutMode !== 'absolute';
    const frameLayoutPadding = normalizePadding(frame.layoutPadding);
    const frameLayoutGap = Number.isFinite(frame.layoutGap) ? frame.layoutGap : 0;
    const frameLayoutDirectionLabel =
        frame.layoutMode === 'flex-row'
            ? 'Frame Layout · Row'
            : frame.layoutMode === 'grid'
                ? 'Frame Layout · Grid'
                : 'Frame Layout · Column';

    const getTimelineStyles = (asset) => {
        switch (asset.type) {
            case 'audio':
                return {
                    icon: '🎵',
                    style: {
                        backgroundImage:
                            'repeating-linear-gradient(135deg, rgba(96,165,250,0.35) 0, rgba(96,165,250,0.35) 6px, rgba(59,130,246,0.2) 6px, rgba(59,130,246,0.2) 12px)',
                    },
                };
            case 'overlay':
                return {
                    icon: '✨',
                    style: {
                        backgroundImage:
                            'repeating-linear-gradient(90deg, rgba(236,233,254,0.15) 0, rgba(236,233,254,0.15) 4px, transparent 4px, transparent 8px)',
                        border: '1px dashed rgba(236,233,254,0.35)',
                    },
                };
            case 'clip':
            default:
                return {
                    icon: '🎬',
                    style: {
                        backgroundImage: 'linear-gradient(135deg, rgba(59,130,246,0.55) 0%, rgba(139,92,246,0.55) 100%)',
                    },
                };
        }
    };

    const handlePointerDown = (event) => {
        event.stopPropagation();
        if (prototypeMode) return;

        const target = event.currentTarget;

        if (isPointerTool && !prototypeMode && event.button === 0 && event.shiftKey) {
            event.preventDefault();
            useCanvasStore.getState().clearActiveGuides();
            setSelectedFrame(frame.id);

            const frameRect = target.getBoundingClientRect();
            const startX = (event.clientX - frameRect.left) / (scale || 1);
            const startY = (event.clientY - frameRect.top) / (scale || 1);

            marqueeStateRef.current = {
                startX,
                startY,
                frameRect,
                pointerId: event.pointerId,
                target,
                additive: event.metaKey || event.ctrlKey,
            };

            setMarqueeRect({ x: startX, y: startY, width: 0, height: 0 });
            target.setPointerCapture?.(event.pointerId);

            const handleMarqueeMove = (moveEvent) => {
                const current = marqueeStateRef.current;
                if (!current) return;
                if ((moveEvent.buttons & 1) === 0) {
                    handleMarqueeUp(moveEvent);
                    return;
                }
                const currentX = (moveEvent.clientX - current.frameRect.left) / (scale || 1);
                const currentY = (moveEvent.clientY - current.frameRect.top) / (scale || 1);
                const x = Math.min(current.startX, currentX);
                const y = Math.min(current.startY, currentY);
                const width = Math.abs(currentX - current.startX);
                const height = Math.abs(currentY - current.startY);
                setMarqueeRect({ x, y, width, height });
            };

            const handleMarqueeUp = (upEvent) => {
                const current = marqueeStateRef.current;
                if (!current) return;
                window.removeEventListener('pointermove', handleMarqueeMove);
                window.removeEventListener('pointerup', handleMarqueeUp);
                current.target.releasePointerCapture?.(current.pointerId);

                const endX = (upEvent.clientX - current.frameRect.left) / (scale || 1);
                const endY = (upEvent.clientY - current.frameRect.top) / (scale || 1);
                const x = Math.min(current.startX, endX);
                const y = Math.min(current.startY, endY);
                const width = Math.abs(endX - current.startX);
                const height = Math.abs(endY - current.startY);

                const additive = current.additive || upEvent.metaKey || upEvent.ctrlKey;
                if (width > 4 && height > 4) {
                    selectElementsInRect(frame.id, { x, y, width, height }, { additive });
                }

                setMarqueeRect(null);
                marqueeStateRef.current = null;
            };

            window.addEventListener('pointermove', handleMarqueeMove);
            window.addEventListener('pointerup', handleMarqueeUp);
            return;
        }

        useCanvasStore.getState().clearActiveGuides();
        setSelectedFrame(frame.id);

        const isPrimaryButton = event.button === 0;
        if (!isPrimaryButton || !isPointerTool) return;

        dragStateRef.current = {
            startX: event.clientX,
            startY: event.clientY,
            frameX: frame.x,
            frameY: frame.y,
            pointerId: event.pointerId,
            target,
        };

        target.setPointerCapture?.(event.pointerId);

        const handlePointerMove = (moveEvent) => {
            if (!dragStateRef.current) return;

            // If the primary button was released outside the frame, end the drag.
            if ((moveEvent.buttons & 1) === 0) {
                handlePointerUp();
                return;
            }

            const storeApi = useCanvasStore.getState();
            const currentFrame = storeApi.getFrameById(frame.id) ?? frame;
            const deltaX = (moveEvent.clientX - dragStateRef.current.startX) / (scale || 1);
            const deltaY = (moveEvent.clientY - dragStateRef.current.startY) / (scale || 1);

            const candidateRect = {
                x: dragStateRef.current.frameX + deltaX,
                y: dragStateRef.current.frameY + deltaY,
                width: currentFrame.width ?? frame.width,
                height: currentFrame.height ?? frame.height,
            };

            const targets = createFrameTargets(storeApi.frames ?? [], frame.id);
            const snapped = snapRectToTargets({ rect: candidateRect, targets });
            storeApi.setActiveGuides(snapped.guides ?? []);

            let nextX = snapped.x;
            let nextY = snapped.y;
            if (gridVisible && gridSize > 0) {
                nextX = Math.round(nextX / gridSize) * gridSize;
                nextY = Math.round(nextY / gridSize) * gridSize;
            }

            updateFrame(frame.id, {
                x: nextX,
                y: nextY,
            });
        };

        const handlePointerUp = () => {
            useCanvasStore.getState().clearActiveGuides();
            const current = dragStateRef.current;
            if (current?.pointerId != null && current?.target) {
                current.target.releasePointerCapture?.(current.pointerId);
            }
            dragStateRef.current = null;
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
    };

    const handleFrameContextMenu = useCallback(
        (event) => {
            event.preventDefault();
            event.stopPropagation();
            const viewport = event.currentTarget.closest('[data-canvas-viewport]');
            if (!viewport) return;
            const storeState = useCanvasStore.getState();
            const rect = viewport.getBoundingClientRect();
            const canvasPoint = {
                x: (event.clientX - rect.left - storeState.position.x) / storeState.scale,
                y: (event.clientY - rect.top - storeState.position.y) / storeState.scale,
            };
            setContextMenu({
                type: 'frame',
                frameId: frame.id,
                position: { x: event.clientX, y: event.clientY },
                canvasPoint,
            });
        },
        [frame.id, setContextMenu],
    );

    const handleResizePointerDown = (event, handleKey) => {
        event.stopPropagation();
        if (!isPointerTool || prototypeMode) return;

        dragStateRef.current = null;

        const pointerId = event.pointerId;
        resizeStateRef.current = {
            pointerId,
            handle: handleKey,
            startX: event.clientX,
            startY: event.clientY,
            target: event.currentTarget,
            startBox: {
                x: frame.x,
                y: frame.y,
                width: frame.width,
                height: frame.height,
            },
        };

        event.currentTarget.setPointerCapture?.(pointerId);

        const handlePointerMove = (moveEvent) => {
            const current = resizeStateRef.current;
            if (!current) return;
            if ((moveEvent.buttons & 1) === 0) {
                handlePointerUp();
                return;
            }
            moveEvent.preventDefault();

            const storeApi = useCanvasStore.getState();
            const deltaX = (moveEvent.clientX - current.startX) / (scale || 1);
            const deltaY = (moveEvent.clientY - current.startY) / (scale || 1);

            const candidate = computeResizedBox({
                start: current.startBox,
                handle: current.handle,
                deltaX,
                deltaY,
                minWidth: FRAME_MIN_SIZE,
                minHeight: FRAME_MIN_SIZE,
            });

            const targets = createFrameTargets(storeApi.frames ?? [], frame.id);
            const snapped = snapResizedRectToTargets({
                rect: candidate,
                handle: current.handle,
                targets,
            });
            storeApi.setActiveGuides(snapped.guides ?? []);

            let rect = snapped.rect;
            if (gridVisible && gridSize > 0) {
                rect = {
                    ...rect,
                    x: Math.round(rect.x / gridSize) * gridSize,
                    y: Math.round(rect.y / gridSize) * gridSize,
                    width: Math.max(gridSize, Math.round(rect.width / gridSize) * gridSize),
                    height: Math.max(gridSize, Math.round(rect.height / gridSize) * gridSize),
                };
            }

            updateFrame(frame.id, rect);
        };

        const handlePointerUp = () => {
            useCanvasStore.getState().clearActiveGuides();
            const current = resizeStateRef.current;
            if (current?.pointerId != null && current?.target) {
                current.target.releasePointerCapture?.(current.pointerId);
            }
            resizeStateRef.current = null;
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
    };

    let layoutOverlay = null;
    if (showLayoutOverlay) {
        const topLevelDescriptors = elementTree
            .map(({ element }) => ({
                id: element.id,
                props: element.props ?? {},
            }))
            .filter(
                (item) =>
                    Number.isFinite(item.props.x) &&
                    Number.isFinite(item.props.y) &&
                    Number.isFinite(item.props.width) &&
                    Number.isFinite(item.props.height),
            );

        let gapMarkers = null;
        if (frameLayoutGap > 0 && topLevelDescriptors.length > 1) {
            if (frame.layoutMode === 'flex-column') {
                const sorted = [...topLevelDescriptors].sort(
                    (a, b) => (a.props.y ?? 0) - (b.props.y ?? 0),
                );
                const markers = [];
                for (let index = 0; index < sorted.length - 1; index += 1) {
                    const current = sorted[index];
                    const next = sorted[index + 1];
                    const currentBottom = (current.props.y ?? 0) + (current.props.height ?? 0);
                    const gapSize = (next.props.y ?? currentBottom) - currentBottom;
                    if (!(gapSize > 0)) continue;
                    markers.push(
                        <div
                            key={`frame-gap-${current.id}-${next.id}`}
                            className='pointer-events-none absolute left-0 right-0 flex items-center justify-center text-[10px] font-semibold uppercase tracking-[0.25em]'
                            style={{
                                top: currentBottom,
                                height: gapSize,
                                paddingLeft: frameLayoutPadding.left,
                                paddingRight: frameLayoutPadding.right,
                            }}
                        >
                            <span className='rounded-full border border-[rgba(59,130,246,0.45)] bg-[rgba(59,130,246,0.18)] px-2 py-0.5 text-[rgba(191,219,254,0.85)]'>
                                Gap {Math.round(gapSize)}
                            </span>
                        </div>,
                    );
                }
                gapMarkers = markers;
            } else if (frame.layoutMode === 'flex-row') {
                const sorted = [...topLevelDescriptors].sort(
                    (a, b) => (a.props.x ?? 0) - (b.props.x ?? 0),
                );
                const markers = [];
                for (let index = 0; index < sorted.length - 1; index += 1) {
                    const current = sorted[index];
                    const next = sorted[index + 1];
                    const currentRight = (current.props.x ?? 0) + (current.props.width ?? 0);
                    const gapSize = (next.props.x ?? currentRight) - currentRight;
                    if (!(gapSize > 0)) continue;
                    markers.push(
                        <div
                            key={`frame-gap-${current.id}-${next.id}`}
                            className='pointer-events-none absolute top-0 bottom-0 flex items-center justify-center text-[10px] font-semibold uppercase tracking-[0.25em]'
                            style={{
                                left: currentRight,
                                width: gapSize,
                                paddingTop: frameLayoutPadding.top,
                                paddingBottom: frameLayoutPadding.bottom,
                            }}
                        >
                            <span className='rotate-90 rounded-full border border-[rgba(59,130,246,0.45)] bg-[rgba(59,130,246,0.18)] px-2 py-0.5 text-[rgba(191,219,254,0.85)]'>
                                Gap {Math.round(gapSize)}
                            </span>
                        </div>,
                    );
                }
                gapMarkers = markers;
            }
        }

        let gridGuides = null;
        if (frame.layoutMode === 'grid') {
            const columnGap = Number.isFinite(frame.layoutGap) ? frame.layoutGap : 0;
            const rowGap = Number.isFinite(frame.layoutRowGap) ? frame.layoutRowGap : columnGap;
            const hasAutoFit = frame.layoutGridAutoFit && frame.layoutGridAutoFit !== 'none';
            const minColumnWidth = Number.isFinite(frame.layoutGridMinColumnWidth)
                ? frame.layoutGridMinColumnWidth
                : DEFAULT_GRID_MIN_COLUMN_WIDTH;
            const autoRowHeight = Number.isFinite(frame.layoutGridAutoRows)
                ? frame.layoutGridAutoRows
                : DEFAULT_GRID_AUTO_ROWS;
            const contentWidth = Math.max(
                0,
                frame.width - frameLayoutPadding.left - frameLayoutPadding.right,
            );
            const contentHeight = Math.max(
                0,
                frame.height - frameLayoutPadding.top - frameLayoutPadding.bottom,
            );
            const explicitColumns = Math.max(
                1,
                Number.isFinite(frame.layoutGridColumns)
                    ? Math.floor(frame.layoutGridColumns)
                    : DEFAULT_GRID_COLUMNS,
            );
            let columns = explicitColumns;
            if (hasAutoFit) {
                const unit = minColumnWidth + columnGap;
                if (unit > 0) {
                    const possible = Math.floor((contentWidth + columnGap) / unit);
                    columns = Number.isFinite(possible) && possible > 0 ? possible : 1;
                }
            }
            if (columns < 1) {
                columns = 1;
            }
            const baseColumnWidth =
                columns > 0
                    ? Math.max(0, (contentWidth - columnGap * (columns - 1)) / columns)
                    : contentWidth;
            const effectiveMinWidth = contentWidth > 0 ? Math.min(minColumnWidth, contentWidth) : 0;
            const columnWidth = hasAutoFit
                ? Math.max(baseColumnWidth, effectiveMinWidth)
                : baseColumnWidth;

            const columnLinePositions = Array.from({ length: columns + 1 }, (_, index) =>
                frameLayoutPadding.left + index * columnWidth + Math.max(0, index - 1) * columnGap,
            );
            const columnCenters = Array.from({ length: columns }, (_, index) => {
                const start = frameLayoutPadding.left + index * columnWidth + Math.max(0, index) * columnGap;
                return start + columnWidth / 2;
            });

            const topLevelElements = frame.elements.filter((element) => !element.parentId);
            const sortedElements = topLevelElements
                .map((element, index) => ({ element, index }))
                .sort((a, b) => {
                    const orderA = Number.isFinite(a.element.layout?.order) ? a.element.layout.order : a.index;
                    const orderB = Number.isFinite(b.element.layout?.order) ? b.element.layout.order : b.index;
                    if (orderA === orderB) return a.index - b.index;
                    return orderA - orderB;
                });

            const occupied = new Map();
            const ensureRow = (rowIndex) => {
                if (!occupied.has(rowIndex)) {
                    occupied.set(rowIndex, Array.from({ length: columns }, () => false));
                }
            };
            const isFree = (rowIndex, colIndex, colSpan, rowSpan) => {
                const maxColumn = columns - 1;
                for (let r = 0; r < rowSpan; r += 1) {
                    const targetRow = rowIndex + r;
                    ensureRow(targetRow);
                    const row = occupied.get(targetRow);
                    for (let c = 0; c < colSpan; c += 1) {
                        const targetCol = colIndex + c - 1;
                        if (targetCol > maxColumn || targetCol < 0 || row[targetCol]) {
                            return false;
                        }
                    }
                }
                return true;
            };
            const reserve = (rowIndex, colIndex, colSpan, rowSpan) => {
                for (let r = 0; r < rowSpan; r += 1) {
                    const targetRow = rowIndex + r;
                    ensureRow(targetRow);
                    const row = occupied.get(targetRow);
                    for (let c = 0; c < colSpan; c += 1) {
                        const targetCol = colIndex + c - 1;
                        if (targetCol >= 0 && targetCol < row.length) {
                            row[targetCol] = true;
                        }
                    }
                }
            };
            const findSlot = (colSpan, rowSpan, preferredRow = 1, preferredCol = 1) => {
                let rowIndex = Math.max(1, preferredRow);
                let attempts = 0;
                const maxColStart = Math.max(1, columns - colSpan + 1);
                let colStart = Math.max(1, Math.min(preferredCol, maxColStart));
                while (attempts < 1000) {
                    const limit = Math.max(1, columns - colSpan + 1);
                    let colIndex = colStart;
                    while (colIndex <= limit) {
                        if (isFree(rowIndex, colIndex, colSpan, rowSpan)) {
                            return { row: rowIndex, col: colIndex };
                        }
                        colIndex += 1;
                    }
                    rowIndex += 1;
                    colStart = 1;
                    attempts += 1;
                }
                return { row: rowIndex, col: 1 };
            };

            const placements = [];
            sortedElements.forEach(({ element }) => {
                const props = element.props ?? {};
                const layout = element.layout ?? {};
                const span = Math.max(
                    1,
                    Number.isFinite(layout.gridColumnSpan) ? Math.floor(layout.gridColumnSpan) : 1,
                );
                const colSpan = Math.min(span, columns);
                const rowSpan = Math.max(
                    1,
                    Number.isFinite(layout.gridRowSpan) ? Math.floor(layout.gridRowSpan) : 1,
                );
                const preferredCol =
                    layout.gridColumnStart !== null && layout.gridColumnStart !== undefined
                        ? Math.max(1, Math.floor(layout.gridColumnStart))
                        : null;
                const preferredRow =
                    layout.gridRowStart !== null && layout.gridRowStart !== undefined
                        ? Math.max(1, Math.floor(layout.gridRowStart))
                        : null;
                const slot = findSlot(colSpan, rowSpan, preferredRow ?? 1, preferredCol ?? 1);
                reserve(slot.row, slot.col, colSpan, rowSpan);
                const definedHeight = Number.isFinite(props.height) ? props.height : null;
                const contentHeightForRow = definedHeight ?? autoRowHeight * rowSpan;
                placements.push({
                    rowStart: slot.row,
                    rowSpan,
                    contentHeight: contentHeightForRow,
                });
            });

            const rowHeights = new Map();
            placements.forEach((item) => {
                const perRowHeight =
                    item.contentHeight > 0 ? item.contentHeight / item.rowSpan : autoRowHeight;
                for (let offset = 0; offset < item.rowSpan; offset += 1) {
                    const rowIndex = item.rowStart + offset;
                    const current = rowHeights.get(rowIndex) ?? 0;
                    rowHeights.set(rowIndex, Math.max(current, perRowHeight, autoRowHeight));
                }
            });

            if (rowHeights.size === 0) {
                rowHeights.set(1, contentHeight > 0 ? contentHeight : autoRowHeight);
            }

            const sortedRows = Array.from(rowHeights.keys()).sort((a, b) => a - b);
            const rowOffsets = new Map();
            let currentY = frameLayoutPadding.top;
            let lastRowIndex = 0;
            sortedRows.forEach((rowIndex) => {
                if (rowIndex > lastRowIndex + 1) {
                    const gapRows = rowIndex - lastRowIndex - 1;
                    currentY += gapRows * (autoRowHeight + rowGap);
                }
                rowOffsets.set(rowIndex, currentY);
                const rowHeight = rowHeights.get(rowIndex) ?? autoRowHeight;
                currentY += rowHeight + rowGap;
                lastRowIndex = rowIndex;
            });

            const rowLinePositionsSet = new Set();
            sortedRows.forEach((rowIndex) => {
                const rowTop = rowOffsets.get(rowIndex) ?? frameLayoutPadding.top;
                const rowHeight = rowHeights.get(rowIndex) ?? autoRowHeight;
                const rowBottomUnbounded = rowTop + rowHeight;
                const rowBottom = Math.min(
                    rowBottomUnbounded,
                    frame.height - frameLayoutPadding.bottom,
                );
                rowLinePositionsSet.add(rowTop);
                rowLinePositionsSet.add(rowBottom);
            });
            if (rowLinePositionsSet.size === 0) {
                rowLinePositionsSet.add(frameLayoutPadding.top);
                rowLinePositionsSet.add(frameLayoutPadding.top + contentHeight);
            }
            const rowLinePositions = Array.from(rowLinePositionsSet).sort((a, b) => a - b);
            const rowCenters = sortedRows.map((rowIndex) => {
                const rowTop = rowOffsets.get(rowIndex) ?? frameLayoutPadding.top;
                const rowHeight = rowHeights.get(rowIndex) ?? autoRowHeight;
                const rowBottomUnbounded = rowTop + rowHeight;
                const rowBottom = Math.min(
                    rowBottomUnbounded,
                    frame.height - frameLayoutPadding.bottom,
                );
                const effectiveHeight = Math.max(0, rowBottom - rowTop);
                return rowTop + effectiveHeight / 2;
            });

            gridGuides = (
                <>
                    {columnLinePositions.map((position, index) => (
                        <div
                            key={`grid-column-line-${index}`}
                            className='pointer-events-none absolute'
                            style={{
                                left: position,
                                top: frameLayoutPadding.top,
                                height: contentHeight,
                                borderLeft: '1px dashed rgba(59,130,246,0.4)',
                            }}
                        />
                    ))}
                    {rowLinePositions.map((position, index) => (
                        <div
                            key={`grid-row-line-${index}`}
                            className='pointer-events-none absolute'
                            style={{
                                top: position,
                                left: frameLayoutPadding.left,
                                width: contentWidth,
                                borderTop: '1px dashed rgba(59,130,246,0.4)',
                            }}
                        />
                    ))}
                    {columnCenters.map((center, index) => (
                        <div
                            key={`grid-column-label-${index}`}
                            className='pointer-events-none absolute -translate-x-1/2 rounded-full border border-[rgba(59,130,246,0.45)] bg-[rgba(15,23,42,0.85)] px-2 py-[2px] text-[9px] font-semibold uppercase tracking-[0.25em] text-[rgba(191,219,254,0.85)] shadow-[0_0_0_1px_rgba(59,130,246,0.35)]'
                            style={{
                                left: center,
                                top: Math.max(6, frameLayoutPadding.top - 18),
                            }}
                        >
                            C{index + 1}
                        </div>
                    ))}
                    {rowCenters.map((center, index) => (
                        <div
                            key={`grid-row-label-${index}`}
                            className='pointer-events-none absolute -translate-y-1/2 rounded-full border border-[rgba(59,130,246,0.45)] bg-[rgba(15,23,42,0.85)] px-2 py-[2px] text-[9px] font-semibold uppercase tracking-[0.25em] text-[rgba(191,219,254,0.85)] shadow-[0_0_0_1px_rgba(59,130,246,0.35)]'
                            style={{
                                top: center,
                                left: Math.max(6, frameLayoutPadding.left - 28),
                            }}
                        >
                            R{index + 1}
                        </div>
                    ))}
                </>
            );
        }

        let dropHighlight = null;
        if (
            autoLayoutPreview &&
            autoLayoutPreview.frameId === frame.id &&
            (autoLayoutPreview.parentId ?? null) === null &&
            frame.layoutMode !== 'absolute'
        ) {
            const rect = autoLayoutPreview.rect;
            if (rect) {
                dropHighlight = (
                    <div
                        className='pointer-events-none absolute rounded-[18px] border-2 border-dashed border-[rgba(236,233,254,0.78)] bg-[rgba(139,92,246,0.15)] transition-all'
                        style={{
                            left: rect.x,
                            top: rect.y,
                            width: rect.width,
                            height: rect.height,
                        }}
                    />
                );
            } else {
                const highlightId = autoLayoutPreview.beforeId ?? autoLayoutPreview.afterId ?? null;
                let highlightBounds = null;
                if (highlightId) {
                    const targetElement = frame.elements.find((item) => item.id === highlightId);
                    if (targetElement?.props) {
                        highlightBounds = {
                            x: targetElement.props.x ?? frameLayoutPadding.left,
                            y: targetElement.props.y ?? frameLayoutPadding.top,
                            width: Math.max(2, targetElement.props.width ?? 0),
                            height: Math.max(2, targetElement.props.height ?? 0),
                        };
                    }
                }
                if (!highlightBounds) {
                    highlightBounds = {
                        x: frameLayoutPadding.left,
                        y: frameLayoutPadding.top,
                        width: Math.max(0, frame.width - frameLayoutPadding.left - frameLayoutPadding.right),
                        height: Math.max(0, frame.height - frameLayoutPadding.top - frameLayoutPadding.bottom),
                    };
                }
                dropHighlight = (
                    <div
                        className='pointer-events-none absolute rounded-[18px] border-2 border-dashed border-[rgba(236,233,254,0.78)] bg-[rgba(139,92,246,0.15)] transition-all'
                        style={{
                            left: highlightBounds.x,
                            top: highlightBounds.y,
                            width: highlightBounds.width,
                            height: highlightBounds.height,
                        }}
                    />
                );
            }
        }

        layoutOverlay = (
            <div className='pointer-events-none absolute inset-0'>
                <div className='absolute inset-0 rounded-[28px] border border-dashed border-[rgba(59,130,246,0.35)]' />
                <div
                    className='pointer-events-none absolute rounded-[20px] border border-dashed border-[rgba(59,130,246,0.45)] bg-[rgba(59,130,246,0.12)]'
                    style={{
                        top: frameLayoutPadding.top,
                        left: frameLayoutPadding.left,
                        right: frameLayoutPadding.right,
                        bottom: frameLayoutPadding.bottom,
                    }}
                >
                    <div className='pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full border border-[rgba(59,130,246,0.35)] bg-[rgba(15,23,42,0.75)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-[rgba(191,219,254,0.85)] shadow-[0_10px_30px_rgba(15,23,42,0.35)]'>
                        Padding T {frameLayoutPadding.top} · R {frameLayoutPadding.right} · B {frameLayoutPadding.bottom} · L {frameLayoutPadding.left}
                    </div>
                </div>
                <div className='pointer-events-none absolute right-6 top-6 rounded-full border border-[rgba(59,130,246,0.45)] bg-[rgba(15,23,42,0.8)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-[rgba(191,219,254,0.9)] shadow-[0_0_0_1px_rgba(59,130,246,0.45)]'>
                    {frameLayoutDirectionLabel}
                </div>
                {gridGuides}
                {dropHighlight}
                {gapMarkers}
            </div>
        );
    }

    return (
        <div
            className={clsx(
                'absolute rounded-3xl border p-8 font-sans transition-shadow text-[rgba(226,232,240,0.9)] shadow-xl',
                isSelected
                    ? 'border-[rgba(139,92,246,0.75)] shadow-[0_20px_60px_rgba(139,92,246,0.35)]'
                    : 'border-[rgba(148,163,184,0.25)] shadow-[0_12px_40px_rgba(15,23,42,0.45)]',
                isPointerTool ? 'cursor-grab active:cursor-grabbing' : 'cursor-default',
            )}
            style={{
                left: frame.x,
                top: frame.y,
                width: frame.width,
                height: frame.height,
                opacity: frame.opacity ?? 1,
                ...frameBackgroundStyle,
            }}
            onPointerDown={handlePointerDown}
            onContextMenu={handleFrameContextMenu}
        >
            {layoutOverlay}
            <div className='absolute left-4 top-4 text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(148,163,184,0.65)]'>
                {frame.name}
            </div>
            {frameComments.length > 0 ? (
                <button
                    type='button'
                    onPointerDown={(event) => {
                        event.stopPropagation();
                        setSelectedFrame(frame.id);
                        setActiveToolOverlay('comment');
                    }}
                    className='absolute right-4 top-4 flex h-7 items-center gap-1 rounded-full border border-[rgba(148,163,184,0.35)] bg-[rgba(15,23,42,0.7)] px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgba(236,233,254,0.85)] shadow-[0_10px_30px_rgba(15,23,42,0.35)]'
                >
                    💬 {frameComments.length}
                </button>
            ) : null}
            <div className='relative h-full w-full pt-6'>
                {elementTree.map(({ element, children }) => (
                    <ElementNode key={element.id} element={element} frameId={frame.id} childrenNodes={children} />
                ))}
            </div>
            {mode === 'video' && frameTimelineAssets.length > 0 ? (
                <div className='pointer-events-none absolute inset-x-6 bottom-6'>
                    <div className='rounded-full border border-[rgba(59,130,246,0.35)] bg-[rgba(15,23,42,0.75)] px-4 py-2 shadow-[0_12px_32px_rgba(15,23,42,0.45)]'>
                        <div className='flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-[rgba(148,163,184,0.65)]'>
                            <span>Timeline</span>
                            <div className='h-px flex-1 bg-[rgba(59,130,246,0.35)]' />
                            <span>{timelineDurationLabel}s</span>
                        </div>
                        <TimelineBar frameId={frame.id} assets={frameTimelineAssets} totalDuration={timelineTotalDuration} getTimelineStyles={getTimelineStyles} />
                    </div>
                </div>
            ) : null}
            {showResizeHandles ? (
                <div className='pointer-events-none absolute inset-0'>
                    {RESIZE_HANDLES.map((handle) => (
                        <div
                            key={handle.key}
                            className={clsx(
                                'absolute h-3 w-3 rounded-full border border-[rgba(236,233,254,0.7)] bg-[rgba(139,92,246,0.85)] shadow-[0_0_0_2px_rgba(15,23,42,0.65)] transition-transform hover:scale-110',
                                handle.className,
                                handle.cursor,
                            )}
                            style={{ pointerEvents: 'auto' }}
                            onPointerDown={(event) => handleResizePointerDown(event, handle.key)}
                        />
                    ))}
                </div>
            ) : null}
            {marqueeRect ? (
                <div
                    className='pointer-events-none absolute rounded-lg border border-[rgba(139,92,246,0.6)] bg-[rgba(139,92,246,0.2)]'
                    style={{
                        left: marqueeRect.x,
                        top: marqueeRect.y,
                        width: marqueeRect.width,
                        height: marqueeRect.height,
                    }}
                />
            ) : null}
        </div>
    );
}
