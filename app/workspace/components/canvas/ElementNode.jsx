'use client';

import clsx from 'clsx';
import { useMemo, useRef } from 'react';
import { useCanvasStore } from './context/CanvasStore';
import {
    createElementTargets,
    snapRectToTargets,
    snapResizedRectToTargets,
} from './utils/alignmentUtils';
import { ELEMENT_MIN_SIZE, RESIZE_HANDLES, computeResizedBox } from './utils/resizeUtils';

const baseClass = 'absolute select-none';

const DEFAULT_LAYOUT_PADDING = { top: 64, right: 64, bottom: 64, left: 64 };

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

function computeAutoLayoutDrop({ frame, parentId, elementId, layoutMode, candidatePoint, container }) {
    if (!frame) {
        return {
            index: 0,
            beforeId: null,
            afterId: null,
            ordered: [],
            previewRect: null,
        };
    }

    const siblings = frame.elements.filter((item) => (item.parentId ?? null) === parentId && item.id !== elementId);
    if (siblings.length === 0) {
        return {
            index: 0,
            beforeId: null,
            afterId: null,
            ordered: [],
            previewRect: container
                ? computeEmptyContainerPreviewRect(container)
                : null,
        };
    }

    const ordered = siblings
        .map((item, index) => {
            const props = item.props ?? {};
            const width = Number.isFinite(props.width) ? props.width : 0;
            const height = Number.isFinite(props.height) ? props.height : 0;
            const centerX = (props.x ?? 0) + width / 2;
            const centerY = (props.y ?? 0) + height / 2;
            return {
                id: item.id,
                originalIndex: index,
                centerX,
                centerY,
                width,
                height,
                props,
            };
        })
        .sort((a, b) => {
            if (layoutMode === 'flex-row') {
                if (Math.abs(a.centerY - b.centerY) > 1) {
                    return a.centerY - b.centerY;
                }
                return a.centerX - b.centerX;
            }
            if (layoutMode === 'flex-column') {
                if (Math.abs(a.centerX - b.centerX) > 1) {
                    return a.centerX - b.centerX;
                }
                return a.centerY - b.centerY;
            }
            // grid and any future layout: row-major (y, then x)
            if (Math.abs(a.centerY - b.centerY) < 1) {
                return a.centerX - b.centerX;
            }
            return a.centerY - b.centerY;
        });

    let targetIndex = ordered.length;
    for (let index = 0; index < ordered.length; index += 1) {
        const sibling = ordered[index];
        if (layoutMode === 'flex-row') {
            if (candidatePoint.y < sibling.centerY - Math.max(8, sibling.height / 3)) {
                targetIndex = Math.max(0, index - 1);
                break;
            }
            if (candidatePoint.y > sibling.centerY + Math.max(8, sibling.height / 3)) {
                continue;
            }
            if (candidatePoint.x < sibling.centerX) {
                targetIndex = index;
                break;
            }
        } else if (layoutMode === 'flex-column') {
            if (candidatePoint.x < sibling.centerX - Math.max(8, sibling.width / 3)) {
                targetIndex = Math.max(0, index - 1);
                break;
            }
            if (candidatePoint.x > sibling.centerX + Math.max(8, sibling.width / 3)) {
                continue;
            }
            if (candidatePoint.y < sibling.centerY) {
                targetIndex = index;
                break;
            }
        } else {
            const rowThreshold = Math.max(24, sibling.height / 2);
            const sameRow = Math.abs(candidatePoint.y - sibling.centerY) <= rowThreshold;
            if (!sameRow && candidatePoint.y < sibling.centerY) {
                targetIndex = index;
                break;
            }
            if (sameRow && candidatePoint.x < sibling.centerX) {
                targetIndex = index;
                break;
            }
        }
    }

    const beforeId = targetIndex < ordered.length ? ordered[targetIndex].id : null;
    const afterId = targetIndex > 0 ? ordered[targetIndex - 1].id : null;

    let previewRect = null;
    if (container) {
        if (layoutMode === 'flex-row') {
            previewRect = computeFlexRowPreviewRect({
                container,
                ordered,
                beforeId,
                afterId,
                candidatePoint,
            });
        } else if (layoutMode === 'flex-column') {
            previewRect = computeFlexColumnPreviewRect({
                container,
                ordered,
                beforeId,
                afterId,
                candidatePoint,
            });
        }
    }

    return {
        index: targetIndex,
        beforeId,
        afterId,
        ordered,
        previewRect,
    };
}

function computeEmptyContainerPreviewRect(container) {
    const padding = container.padding ?? {};
    const innerLeft = padding.left ?? 0;
    const innerTop = padding.top ?? 0;
    const innerWidth = Math.max(
        0,
        (container.width ?? 0) - (padding.left ?? 0) - (padding.right ?? 0),
    );
    const innerHeight = Math.max(
        0,
        (container.height ?? 0) - (padding.top ?? 0) - (padding.bottom ?? 0),
    );
    return {
        x: innerLeft,
        y: innerTop,
        width: innerWidth,
        height: innerHeight,
    };
}

function buildFlexRowGroups(ordered, threshold) {
    const rows = [];
    const rowMap = new Map();
    let currentRow = null;

    const sortedByY = [...ordered].sort((a, b) => a.centerY - b.centerY);
    sortedByY.forEach((item) => {
        const top = item.props?.y ?? 0;
        const bottom = top + (item.props?.height ?? 0);
        if (!currentRow || top - currentRow.bottom > threshold) {
            currentRow = {
                top,
                bottom,
                items: [],
            };
            rows.push(currentRow);
        } else {
            currentRow.top = Math.min(currentRow.top, top);
            currentRow.bottom = Math.max(currentRow.bottom, bottom);
        }
        currentRow.items.push(item);
        rowMap.set(item.id, currentRow);
    });

    return { rows, rowMap };
}

function computeFlexRowPreviewRect({ container, ordered, beforeId, afterId, candidatePoint }) {
    const padding = container.padding ?? {};
    const innerLeft = padding.left ?? 0;
    const innerRight = Math.max(innerLeft, (container.width ?? 0) - (padding.right ?? 0));
    const innerTop = padding.top ?? 0;
    const innerBottom = Math.max(innerTop, (container.height ?? 0) - (padding.bottom ?? 0));
    const gap = container.gap ?? 0;
    const rowGap = container.rowGap ?? gap;
    const wrapMode = container.layoutWrap ?? 'nowrap';

    const highlightWidth = Math.max(6, Math.min(16, gap || 12));
    const groupThreshold = Math.max(12, rowGap || gap || 16);
    const { rows, rowMap } = buildFlexRowGroups(ordered, groupThreshold);
    const defaultRowHeight =
        rows.length > 0
            ? rows.reduce((acc, row) => acc + Math.max(24, row.bottom - row.top), 0) / rows.length
            : Math.max(40, innerBottom - innerTop);

    const targetRowFromIds = beforeId && rowMap.has(beforeId)
        ? rowMap.get(beforeId)
        : afterId && rowMap.has(afterId)
            ? rowMap.get(afterId)
            : null;

    const rowCandidate = rows.find(
        (row) =>
            candidatePoint.y >= row.top - groupThreshold &&
            candidatePoint.y <= row.bottom + groupThreshold,
    );

    let rowForPreview = targetRowFromIds ?? rowCandidate ?? null;
    let baseRowHeight = rowForPreview
        ? Math.max(24, rowForPreview.bottom - rowForPreview.top)
        : defaultRowHeight;

    let tentativeTop;
    let tentativeBottom;

    if (rowForPreview) {
        tentativeTop = rowForPreview.top;
        tentativeBottom = rowForPreview.bottom;

        if (wrapMode !== 'nowrap') {
            if (candidatePoint.y < rowForPreview.top - groupThreshold) {
                tentativeBottom = rowForPreview.top - Math.max(4, rowGap / 2);
                tentativeTop = tentativeBottom - baseRowHeight;
            } else if (candidatePoint.y > rowForPreview.bottom + groupThreshold) {
                tentativeTop = rowForPreview.bottom + Math.max(4, rowGap / 2);
                tentativeBottom = tentativeTop + baseRowHeight;
            }
        }
    } else if (rows.length > 0) {
        const firstRow = rows[0];
        const lastRow = rows[rows.length - 1];
        if (wrapMode === 'wrap-reverse') {
            tentativeBottom = (firstRow?.top ?? innerTop) - Math.max(4, rowGap / 2);
            tentativeTop = tentativeBottom - baseRowHeight;
        } else {
            tentativeTop = (lastRow?.bottom ?? innerTop) + Math.max(4, rowGap / 2);
            tentativeBottom = tentativeTop + baseRowHeight;
        }
    } else {
        tentativeTop = innerTop;
        tentativeBottom = innerTop + baseRowHeight;
    }

    const availableHeight = Math.max(1, innerBottom - innerTop);
    const clampedHeight = Math.max(4, Math.min(Math.abs(tentativeBottom - tentativeTop), availableHeight));
    tentativeTop = Math.max(innerTop, Math.min(tentativeTop, innerBottom - clampedHeight));
    const height = clampedHeight;

    let highlightX;
    if (beforeId && rowMap.has(beforeId)) {
        const before = ordered.find((item) => item.id === beforeId);
        highlightX = (before?.props?.x ?? innerLeft) - highlightWidth / 2;
        if (
            wrapMode !== 'nowrap' &&
            candidatePoint.y > (rowMap.get(beforeId)?.bottom ?? candidatePoint.y) + groupThreshold
        ) {
            highlightX = innerLeft;
        }
    } else if (afterId && rowMap.has(afterId)) {
        const after = ordered.find((item) => item.id === afterId);
        highlightX =
            (after?.props?.x ?? innerLeft) +
            (after?.props?.width ?? 0) -
            highlightWidth / 2;
        if (
            wrapMode !== 'nowrap' &&
            candidatePoint.y > (rowMap.get(afterId)?.bottom ?? candidatePoint.y) + groupThreshold
        ) {
            highlightX = innerLeft;
        }
    } else {
        highlightX = candidatePoint.x - highlightWidth / 2;
    }

    const availableWidth = Math.max(1, innerRight - innerLeft);
    const width = Math.min(Math.max(4, highlightWidth), availableWidth);
    highlightX = Math.max(innerLeft, Math.min(highlightX, innerLeft + availableWidth - width));

    return {
        x: highlightX,
        y: tentativeTop,
        width,
        height,
    };
}

function buildFlexColumnGroups(ordered, threshold) {
    const columns = [];
    const columnMap = new Map();
    let currentColumn = null;

    const sortedByX = [...ordered].sort((a, b) => a.centerX - b.centerX);
    sortedByX.forEach((item) => {
        const left = item.props?.x ?? 0;
        const right = left + (item.props?.width ?? 0);
        if (!currentColumn || left - currentColumn.right > threshold) {
            currentColumn = {
                left,
                right,
                items: [],
            };
            columns.push(currentColumn);
        } else {
            currentColumn.left = Math.min(currentColumn.left, left);
            currentColumn.right = Math.max(currentColumn.right, right);
        }
        currentColumn.items.push(item);
        columnMap.set(item.id, currentColumn);
    });

    return { columns, columnMap };
}

function computeFlexColumnPreviewRect({ container, ordered, beforeId, afterId, candidatePoint }) {
    const padding = container.padding ?? {};
    const innerLeft = padding.left ?? 0;
    const innerRight = Math.max(innerLeft, (container.width ?? 0) - (padding.right ?? 0));
    const innerTop = padding.top ?? 0;
    const innerBottom = Math.max(innerTop, (container.height ?? 0) - (padding.bottom ?? 0));
    const gap = container.gap ?? 0;
    const rowGap = container.rowGap ?? gap;
    const wrapMode = container.layoutWrap ?? 'nowrap';

    const highlightHeight = Math.max(6, Math.min(16, rowGap || gap || 12));
    const groupThreshold = Math.max(12, gap || rowGap || 16);

    const { columns, columnMap } = buildFlexColumnGroups(ordered, groupThreshold);
    const defaultColumnWidth =
        columns.length > 0
            ? columns.reduce((acc, col) => acc + Math.max(24, col.right - col.left), 0) /
              columns.length
            : Math.max(40, innerRight - innerLeft);

    const targetColumnFromIds = beforeId && columnMap.has(beforeId)
        ? columnMap.get(beforeId)
        : afterId && columnMap.has(afterId)
            ? columnMap.get(afterId)
            : null;

    const columnCandidate = columns.find(
        (column) =>
            candidatePoint.x >= column.left - groupThreshold &&
            candidatePoint.x <= column.right + groupThreshold,
    );

    let columnForPreview = targetColumnFromIds ?? columnCandidate ?? null;
    let baseColumnWidth = columnForPreview
        ? Math.max(24, columnForPreview.right - columnForPreview.left)
        : defaultColumnWidth;

    let tentativeLeft;
    let tentativeRight;

    if (columnForPreview) {
        tentativeLeft = columnForPreview.left;
        tentativeRight = columnForPreview.right;

        if (wrapMode !== 'nowrap') {
            if (candidatePoint.x < columnForPreview.left - groupThreshold) {
                tentativeRight = columnForPreview.left - Math.max(4, gap / 2);
                tentativeLeft = tentativeRight - baseColumnWidth;
            } else if (candidatePoint.x > columnForPreview.right + groupThreshold) {
                tentativeLeft = columnForPreview.right + Math.max(4, gap / 2);
                tentativeRight = tentativeLeft + baseColumnWidth;
            }
        }
    } else if (columns.length > 0) {
        const firstColumn = columns[0];
        const lastColumn = columns[columns.length - 1];
        if (wrapMode === 'wrap-reverse') {
            tentativeLeft = (firstColumn?.left ?? innerLeft) - baseColumnWidth - Math.max(4, gap / 2);
            tentativeRight = tentativeLeft + baseColumnWidth;
        } else {
            tentativeLeft = (lastColumn?.right ?? innerLeft) + Math.max(4, gap / 2);
            tentativeRight = tentativeLeft + baseColumnWidth;
        }
    } else {
        tentativeLeft = innerLeft;
        tentativeRight = innerLeft + baseColumnWidth;
    }

    const availableWidth = Math.max(1, innerRight - innerLeft);
    const clampedWidth = Math.max(4, Math.min(Math.abs(tentativeRight - tentativeLeft), availableWidth));
    tentativeLeft = Math.max(innerLeft, Math.min(tentativeLeft, innerRight - clampedWidth));
    const width = clampedWidth;

    let highlightY;
    if (beforeId && columnMap.has(beforeId)) {
        const before = ordered.find((item) => item.id === beforeId);
        highlightY = (before?.props?.y ?? innerTop) - highlightHeight / 2;
        if (
            wrapMode !== 'nowrap' &&
            candidatePoint.x > (columnMap.get(beforeId)?.right ?? candidatePoint.x) + groupThreshold
        ) {
            highlightY = innerTop;
        }
    } else if (afterId && columnMap.has(afterId)) {
        const after = ordered.find((item) => item.id === afterId);
        highlightY =
            (after?.props?.y ?? innerTop) +
            (after?.props?.height ?? 0) -
            highlightHeight / 2;
        if (
            wrapMode !== 'nowrap' &&
            candidatePoint.x > (columnMap.get(afterId)?.right ?? candidatePoint.x) + groupThreshold
        ) {
            highlightY = innerTop;
        }
    } else {
        highlightY = candidatePoint.y - highlightHeight / 2;
    }

    const availableHeight = Math.max(1, innerBottom - innerTop);
    const height = Math.min(Math.max(4, highlightHeight), availableHeight);
    highlightY = Math.max(innerTop, Math.min(highlightY, innerTop + availableHeight - height));

    return {
        x: tentativeLeft,
        y: highlightY,
        width,
        height,
    };
}

export default function ElementNode({ element, frameId, childrenNodes = [] }) {
    const selectedTool = useCanvasStore((state) => state.selectedTool);
    const selectedFrameId = useCanvasStore((state) => state.selectedFrameId);
    const selectedElementIds = useCanvasStore((state) => state.selectedElementIds);
    const scale = useCanvasStore((state) => state.scale);
    const prototypeMode = useCanvasStore((state) => state.prototypeMode);
    const setSelectedElement = useCanvasStore((state) => state.setSelectedElement);
    const toggleElementSelection = useCanvasStore((state) => state.toggleElementSelection);
    const updateElementProps = useCanvasStore((state) => state.updateElementProps);
    const reorderElement = useCanvasStore((state) => state.reorderElement);
    const comments = useCanvasStore((state) => state.comments);
    const setActiveToolOverlay = useCanvasStore((state) => state.setActiveToolOverlay);
    const setContextMenu = useCanvasStore((state) => state.setContextMenu);
    const frame = useCanvasStore((state) => state.frames.find((item) => item.id === frameId));
    const setElementLayout = useCanvasStore((state) => state.setElementLayout);
    const setAutoLayoutPreview = useCanvasStore((state) => state.setAutoLayoutPreview);
    const clearAutoLayoutPreview = useCanvasStore((state) => state.clearAutoLayoutPreview);
    const autoLayoutPreview = useCanvasStore((state) => state.autoLayoutPreview);

    const dragStateRef = useRef(null);
    const resizeStateRef = useRef(null);

    if (!element) return null;

    const props = element.props ?? {};
    const isPointerTool = !selectedTool || selectedTool === 'pointer';
    const isSelected = selectedFrameId === frameId && selectedElementIds.includes(element.id);
    const hasLink = Boolean(props.linkTarget);
    const elementComments = useMemo(
        () =>
            comments.filter(
                (comment) => comment.frameId === frameId && comment.elementId === element.id,
            ),
        [comments, frameId, element.id],
    );
    const hasComments = elementComments.length > 0;
    const parentLayoutMode = useMemo(() => {
        if (!frame) return 'absolute';
        if (element.parentId) {
            const parent = frame.elements.find((item) => item.id === element.parentId);
            return parent?.layoutMode ?? 'absolute';
        }
        return frame.layoutMode ?? 'absolute';
    }, [frame, element.parentId]);

    const isAutoLayoutParent = parentLayoutMode && parentLayoutMode !== 'absolute';
    const isFlexParent = parentLayoutMode === 'flex-row' || parentLayoutMode === 'flex-column';

    const hasWidth = Number.isFinite(props.width);
    const hasHeight = Number.isFinite(props.height);

    let sizePermitted = hasWidth && hasHeight;
    if (isFlexParent) {
        sizePermitted = parentLayoutMode === 'flex-row' ? hasWidth : hasHeight;
    } else if (isAutoLayoutParent) {
        sizePermitted = false;
    }

    const canResize =
        isSelected && isPointerTool && !prototypeMode && sizePermitted;

    const startAbsoluteDrag = (event) => {
        dragStateRef.current = {
            startX: event.clientX,
            startY: event.clientY,
            elementX: props.x ?? 0,
            elementY: props.y ?? 0,
            pointerId: event.pointerId,
            target: event.currentTarget,
        };

        event.currentTarget.setPointerCapture?.(event.pointerId);

        const handlePointerMove = (moveEvent) => {
            if (!dragStateRef.current) return;

            if ((moveEvent.buttons & 1) === 0) {
                handlePointerUp();
                return;
            }

            const storeApi = useCanvasStore.getState();
            const frameState = storeApi.getFrameById(frameId);
            const elementState =
                frameState?.elements?.find((el) => el.id === element.id) ?? element;

            const deltaX = (moveEvent.clientX - dragStateRef.current.startX) / (scale || 1);
            const deltaY = (moveEvent.clientY - dragStateRef.current.startY) / (scale || 1);

            const width = elementState?.props?.width ?? props.width ?? ELEMENT_MIN_SIZE;
            const height = elementState?.props?.height ?? props.height ?? ELEMENT_MIN_SIZE;

            const candidateRect = {
                x: dragStateRef.current.elementX + deltaX,
                y: dragStateRef.current.elementY + deltaY,
                width,
                height,
            };

            const targets = createElementTargets(frameState, element.id);
            const snapped = snapRectToTargets({ rect: candidateRect, targets });
            const offsetGuides = (snapped.guides ?? []).map((guide) => {
                const basePosition = guide.position ?? 0;
                const frameOffset =
                    guide.orientation === 'vertical'
                        ? frameState?.x ?? 0
                        : frameState?.y ?? 0;
                return { ...guide, position: basePosition + frameOffset };
            });
            storeApi.setActiveGuides(offsetGuides);

            updateElementProps(frameId, element.id, {
                x: snapped.x,
                y: snapped.y,
            });
        };

        const handlePointerUp = () => {
            useCanvasStore.getState().clearActiveGuides();
            clearAutoLayoutPreview();
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

    const startAutoLayoutDrag = (event, frameState, parentId, parentLayoutMode) => {
        const elementWidth = Number.isFinite(props.width) ? props.width : ELEMENT_MIN_SIZE;
        const elementHeight = Number.isFinite(props.height) ? props.height : ELEMENT_MIN_SIZE;
        const siblings = frameState?.elements.filter((item) => (item.parentId ?? null) === parentId) ?? [];
        const initialIndex = siblings.findIndex((item) => item.id === element.id);

        const resolveContainerMeta = (sourceFrame) => {
            if (!sourceFrame) return null;
            if (parentId) {
                const parentElement = sourceFrame.elements.find((item) => item.id === parentId);
                if (!parentElement) return null;
                const parentPadding = normalizePadding(parentElement.layoutPadding);
                const parentProps = parentElement.props ?? {};
                return {
                    id: parentElement.id,
                    layoutWrap: parentElement.layoutWrap ?? 'nowrap',
                    gap: parentElement.layoutGap ?? 0,
                    rowGap: parentElement.layoutRowGap ?? parentElement.layoutGap ?? 0,
                    padding: parentPadding,
                    width: Number.isFinite(parentProps.width) ? parentProps.width : sourceFrame.width,
                    height: Number.isFinite(parentProps.height) ? parentProps.height : sourceFrame.height,
                };
            }
            const framePadding = normalizePadding(sourceFrame.layoutPadding);
            return {
                id: sourceFrame.id,
                layoutWrap: sourceFrame.layoutWrap ?? 'nowrap',
                gap: sourceFrame.layoutGap ?? 0,
                rowGap: sourceFrame.layoutRowGap ?? sourceFrame.layoutGap ?? 0,
                padding: framePadding,
                width: sourceFrame.width,
                height: sourceFrame.height,
            };
        };

        dragStateRef.current = {
            pointerId: event.pointerId,
            startClientX: event.clientX,
            startClientY: event.clientY,
            elementX: props.x ?? 0,
            elementY: props.y ?? 0,
            elementWidth,
            elementHeight,
            parentId,
            parentLayoutMode,
            initialIndex: initialIndex >= 0 ? initialIndex : 0,
            targetIndex: initialIndex >= 0 ? initialIndex : 0,
            target: event.currentTarget,
            deltaX: 0,
            deltaY: 0,
            liveIndex: initialIndex >= 0 ? initialIndex : 0,
        };

        event.currentTarget.setPointerCapture?.(event.pointerId);

        const handlePointerMove = (moveEvent) => {
            const current = dragStateRef.current;
            if (!current) return;

            if ((moveEvent.buttons & 1) === 0) {
                handlePointerUp(moveEvent);
                return;
            }

            moveEvent.preventDefault();

            const deltaX = (moveEvent.clientX - current.startClientX) / (scale || 1);
            const deltaY = (moveEvent.clientY - current.startClientY) / (scale || 1);
            current.deltaX = deltaX;
            current.deltaY = deltaY;

            const latestFrame = useCanvasStore.getState().getFrameById(frameId);
            const containerMeta = resolveContainerMeta(latestFrame);
            if (!containerMeta) {
                current.targetIndex = current.initialIndex;
                clearAutoLayoutPreview();
                return;
            }
            const candidatePoint = {
                x: current.elementX + deltaX + Math.max(current.elementWidth, 1) / 2,
                y: current.elementY + deltaY + Math.max(current.elementHeight, 1) / 2,
            };
            const drop = computeAutoLayoutDrop({
                frame: latestFrame,
                parentId,
                elementId: element.id,
                layoutMode: parentLayoutMode,
                candidatePoint,
                container: containerMeta,
            });
            current.targetIndex = drop.index;
            setAutoLayoutPreview({
                frameId,
                parentId,
                beforeId: drop.beforeId,
                afterId: drop.afterId,
                layoutMode: parentLayoutMode,
                rect: drop.previewRect ?? null,
            });

            if (drop.index !== current.liveIndex) {
                reorderElement(frameId, element.id, drop.index);
                current.liveIndex = drop.index;
            }
        };

        const handlePointerUp = (upEvent) => {
            useCanvasStore.getState().clearActiveGuides();
            clearAutoLayoutPreview();
            const current = dragStateRef.current;
            if (current?.pointerId != null && current?.target) {
                current.target.releasePointerCapture?.(current.pointerId);
            }
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
            if (!current) return;

            const deltaX =
                current.deltaX ?? (upEvent ? (upEvent.clientX - current.startClientX) / (scale || 1) : 0);
            const deltaY =
                current.deltaY ?? (upEvent ? (upEvent.clientY - current.startClientY) / (scale || 1) : 0);

            const latestFrame = useCanvasStore.getState().getFrameById(frameId);
            const containerMeta = resolveContainerMeta(latestFrame);
            if (!containerMeta) {
                dragStateRef.current = null;
                return;
            }
            const candidatePoint = {
                x: current.elementX + deltaX + Math.max(current.elementWidth, 1) / 2,
                y: current.elementY + deltaY + Math.max(current.elementHeight, 1) / 2,
            };
            const drop = computeAutoLayoutDrop({
                frame: latestFrame,
                parentId,
                elementId: element.id,
                layoutMode: parentLayoutMode,
                candidatePoint,
                container: containerMeta,
            });

            if (drop.index !== current.liveIndex) {
                reorderElement(frameId, element.id, drop.index);
            }

            if (drop.index !== current.initialIndex) {
                // ensure final index persisted; reorderElement handles reflow
            }

            dragStateRef.current = null;
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
    };

    const handlePointerDown = (event) => {
        event.stopPropagation();
        if (!frameId || !element.id) return;
        if (prototypeMode) return;

        useCanvasStore.getState().clearActiveGuides();
        clearAutoLayoutPreview();

        const additive = event.shiftKey || event.metaKey || event.ctrlKey;

        if (additive) {
            toggleElementSelection(frameId, element.id);
        } else {
            setSelectedElement(frameId, element.id);
        }

        if (!isPointerTool || event.button !== 0 || additive) return;
        if (event.button !== 0) return;

        const storeApi = useCanvasStore.getState();
        const frameState = frame ?? storeApi.getFrameById(frameId);
        if (!frameState) return;

        const parentId = element.parentId ?? null;
        const isAutoLayoutParent = parentLayoutMode && parentLayoutMode !== 'absolute';

        if (isAutoLayoutParent) {
            startAutoLayoutDrag(event, frameState, parentId, parentLayoutMode);
        } else {
            startAbsoluteDrag(event);
        }
    };

    const handleContextMenu = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const viewport = event.currentTarget.closest('[data-canvas-viewport]');
        if (!viewport) return;
        const rect = viewport.getBoundingClientRect();
        const storeState = useCanvasStore.getState();
        const canvasPoint = {
            x: (event.clientX - rect.left - storeState.position.x) / storeState.scale,
            y: (event.clientY - rect.top - storeState.position.y) / storeState.scale,
        };
        storeState.setContextMenu({
            type: 'element',
            frameId,
            elementId: element.id,
            position: { x: event.clientX, y: event.clientY },
            canvasPoint,
        });
    };

    const handleResizePointerDown = (event, handleKey) => {
        event.stopPropagation();
        if (!frameId || !element.id) return;
        if (!isPointerTool || prototypeMode) return;

        dragStateRef.current = null;
        setSelectedElement(frameId, element.id);
        useCanvasStore.getState().clearActiveGuides();

        const pointerId = event.pointerId;
        const startBox = {
            x: props.x ?? 0,
            y: props.y ?? 0,
            width: Number.isFinite(props.width) ? props.width : ELEMENT_MIN_SIZE,
            height: Number.isFinite(props.height) ? props.height : ELEMENT_MIN_SIZE,
        };

        resizeStateRef.current = {
            pointerId,
            handle: handleKey,
            startX: event.clientX,
            startY: event.clientY,
            target: event.currentTarget,
            startBox,
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
            const frameState = storeApi.getFrameById(frameId);

            const deltaX = (moveEvent.clientX - current.startX) / (scale || 1);
            const deltaY = (moveEvent.clientY - current.startY) / (scale || 1);

            const candidate = computeResizedBox({
                start: current.startBox,
                handle: current.handle,
                deltaX,
                deltaY,
                minWidth: ELEMENT_MIN_SIZE,
                minHeight: ELEMENT_MIN_SIZE,
            });

            const targets = createElementTargets(frameState, element.id);
            const snapped = snapResizedRectToTargets({
                rect: candidate,
                handle: current.handle,
                targets,
            });
            const offsetGuides = (snapped.guides ?? []).map((guide) => {
                const basePosition = guide.position ?? 0;
                const frameOffset =
                    guide.orientation === 'vertical'
                        ? frameState?.x ?? 0
                        : frameState?.y ?? 0;
                return { ...guide, position: basePosition + frameOffset };
            });
            storeApi.setActiveGuides(offsetGuides);

            updateElementProps(frameId, element.id, snapped.rect);
            if (isFlexParent) {
                if (parentLayoutMode === 'flex-row') {
                    setElementLayout(frameId, element.id, {
                        basis: Math.max(ELEMENT_MIN_SIZE, snapped.rect.width),
                        grow: 0,
                    });
                } else if (parentLayoutMode === 'flex-column') {
                    setElementLayout(frameId, element.id, {
                        basis: Math.max(ELEMENT_MIN_SIZE, snapped.rect.height),
                        grow: 0,
                    });
                }
            }
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

    const commonStyle = useMemo(() => {
        const scaleX = Number.isFinite(props.scaleX) ? props.scaleX : 1;
        const scaleY = Number.isFinite(props.scaleY) ? props.scaleY : 1;
        const skewX = Number.isFinite(props.skewX) ? props.skewX : 0;
        const skewY = Number.isFinite(props.skewY) ? props.skewY : 0;
        const rotation = Number.isFinite(props.rotation) ? props.rotation : 0;
        const transforms = [];
        if (rotation) transforms.push(`rotate(${rotation}deg)`);
        if (skewX || skewY) transforms.push(`skew(${skewX}deg, ${skewY}deg)`);
        if (scaleX !== 1 || scaleY !== 1) transforms.push(`scale(${scaleX}, ${scaleY})`);
        const transform = transforms.length > 0 ? transforms.join(' ') : undefined;

        const fillType = props.fillType ?? (props.imageUrl ? 'image' : 'solid');
        const gradientType = props.gradientType ?? 'linear';
        const gradientStart = props.gradientStart ?? props.fill ?? '#8B5CF6';
        const gradientEnd = props.gradientEnd ?? '#3B82F6';
        const gradientAngle = Number.isFinite(props.gradientAngle) ? props.gradientAngle : 45;

        let backgroundColor;
        let backgroundImage;
        let backgroundRepeat;
        let backgroundSize = props.backgroundFit ?? 'cover';
        let backgroundPosition = 'center';

        if (props.imageUrl && (fillType === 'image' || fillType === 'pattern')) {
            backgroundImage = `url(${props.imageUrl})`;
            backgroundRepeat = fillType === 'pattern' ? props.patternRepeat ?? 'repeat' : 'no-repeat';
            if (fillType === 'pattern') {
                const patternScale = Number.isFinite(props.patternScale) ? props.patternScale : 1;
                backgroundSize = `${Math.max(patternScale, 0.01) * 100}%`;
                backgroundPosition = `${props.patternOffsetX ?? 0}px ${props.patternOffsetY ?? 0}px`;
            }
        } else if (fillType === 'gradient') {
            if (gradientType === 'linear') {
                backgroundImage = `linear-gradient(${gradientAngle}deg, ${gradientStart} 0%, ${gradientEnd} 100%)`;
            } else if (gradientType === 'radial') {
                backgroundImage = `radial-gradient(circle, ${gradientStart} 0%, ${gradientEnd} 100%)`;
            } else if (gradientType === 'conic') {
                backgroundImage = `conic-gradient(from ${gradientAngle}deg, ${gradientStart}, ${gradientEnd})`;
            }
        } else if (props.fill) {
            backgroundColor = props.fill;
        }

        const shadowColor = props.shadowColor;
        const shadowOffsetX = Number.isFinite(props.shadowOffsetX) ? props.shadowOffsetX : 0;
        const shadowOffsetY = Number.isFinite(props.shadowOffsetY) ? props.shadowOffsetY : 0;
        const shadowBlur = Number.isFinite(props.shadowBlur) ? props.shadowBlur : 0;
        const shadowSpread = Number.isFinite(props.shadowSpread) ? props.shadowSpread : 0;
        const glowColor = props.glowColor;
        const glowBlur = Number.isFinite(props.glowBlur) ? props.glowBlur : 0;
        const shadows = [];
        if (shadowColor && (shadowBlur || shadowOffsetX || shadowOffsetY || shadowSpread)) {
            shadows.push(`${shadowOffsetX}px ${shadowOffsetY}px ${shadowBlur}px ${shadowSpread}px ${shadowColor}`);
        }
        if (glowColor) {
            shadows.push(`0 0 ${Math.max(glowBlur, 1)}px ${glowColor}`);
        }
        const boxShadow = shadows.length > 0 ? shadows.join(', ') : undefined;

        const filterParts = [];
        if (Number.isFinite(props.blur) && props.blur > 0) filterParts.push(`blur(${props.blur}px)`);
        if (Number.isFinite(props.brightness) && props.brightness !== 100)
            filterParts.push(`brightness(${props.brightness}%)`);
        if (Number.isFinite(props.contrast) && props.contrast !== 100)
            filterParts.push(`contrast(${props.contrast}%)`);
        if (Number.isFinite(props.saturation) && props.saturation !== 100)
            filterParts.push(`saturate(${props.saturation}%)`);
        if (Number.isFinite(props.hueRotate) && props.hueRotate !== 0)
            filterParts.push(`hue-rotate(${props.hueRotate}deg)`);
        const filter = filterParts.length > 0 ? filterParts.join(' ') : undefined;

        let borderRadius;
        if (props.cornerRadius != null) {
            if (typeof props.cornerRadius === 'object') {
                const {
                    topLeft = 0,
                    topRight = 0,
                    bottomRight = 0,
                    bottomLeft = 0,
                } = props.cornerRadius;
                borderRadius = `${topLeft}px ${topRight}px ${bottomRight}px ${bottomLeft}px`;
            } else if (Number.isFinite(props.cornerRadius)) {
                borderRadius = `${props.cornerRadius}px`;
            }
        }
        const border =
            props.stroke && props.strokeWidth
                ? `${props.strokeWidth}px solid ${props.stroke}`
                : undefined;

        return {
            left: props.x ?? 0,
            top: props.y ?? 0,
            width: props.width,
            height: props.height,
            transform,
            transformOrigin: props.transformOrigin ?? '50% 50%',
            opacity: props.opacity ?? 1,
            borderRadius,
            border,
            textAlign: props.align,
            backgroundColor,
            backgroundImage,
            backgroundSize,
            backgroundRepeat,
            backgroundPosition,
            backgroundBlendMode: props.backgroundBlendMode ?? undefined,
            boxShadow,
            filter,
            mixBlendMode:
                props.blendMode && props.blendMode !== 'normal' ? props.blendMode : undefined,
            visibility: props.visible === false ? 'hidden' : 'visible',
        };
    }, [
        props.align,
        props.backgroundFit,
        props.blur,
        props.blendMode,
        props.brightness,
        props.cornerRadius,
        props.contrast,
        props.fill,
        props.fillType,
        props.glowBlur,
        props.glowColor,
        props.gradientAngle,
        props.gradientEnd,
        props.gradientStart,
        props.gradientType,
        props.height,
        props.hueRotate,
        props.imageUrl,
        props.opacity,
        props.patternOffsetX,
        props.patternOffsetY,
        props.patternRepeat,
        props.patternScale,
        props.rotation,
        props.saturation,
        props.scaleX,
        props.scaleY,
        props.shadowBlur,
        props.shadowColor,
        props.shadowOffsetX,
        props.shadowOffsetY,
        props.shadowSpread,
        props.skewX,
        props.skewY,
        props.stroke,
        props.strokeWidth,
        props.transformOrigin,
        props.visible,
        props.width,
        props.x,
        props.y,
    ]);

    const linkBadge = hasLink ? (
        <span className='pointer-events-none absolute right-2 top-2 rounded-full border border-[rgba(59,130,246,0.35)] bg-[rgba(59,130,246,0.15)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[rgba(148,163,184,0.85)]'>
            Link
        </span>
    ) : null;
    const commentBadge = hasComments ? (
        <button
            type='button'
            onPointerDown={(event) => {
                event.stopPropagation();
                setSelectedElement(frameId, element.id);
                setActiveToolOverlay('comment');
            }}
            className='absolute left-2 top-2 flex h-6 items-center gap-1 rounded-full border border-[rgba(148,163,184,0.35)] bg-[rgba(15,23,42,0.7)] px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[rgba(236,233,254,0.85)]'
        >
            💬 {elementComments.length}
        </button>
    ) : null;

    const allowedHandles = useMemo(() => {
        if (!canResize) return [];
        if (!isAutoLayoutParent) return RESIZE_HANDLES;
        if (parentLayoutMode === 'flex-row') {
            return RESIZE_HANDLES.filter((handle) => ['e', 'w'].includes(handle.key)).map((handle) => ({
                ...handle,
                orientation: 'horizontal',
            }));
        }
        if (parentLayoutMode === 'flex-column') {
            return RESIZE_HANDLES.filter((handle) => ['n', 's'].includes(handle.key)).map((handle) => ({
                ...handle,
                orientation: 'vertical',
            }));
        }
        return [];
    }, [canResize, isAutoLayoutParent, parentLayoutMode]);

    const resizeHandles =
        canResize && frameId && element.id && allowedHandles.length
            ? (
                <div className='pointer-events-none absolute inset-0'>
                    {allowedHandles.map((handle) => (
                        <div
                            key={`${element.id}-${handle.key}`}
                            className={clsx(
                                'absolute flex h-4 w-4 items-center justify-center rounded-full border border-[rgba(236,233,254,0.7)] bg-[rgba(59,130,246,0.9)] text-[8px] font-semibold uppercase tracking-[0.2em] text-[rgba(236,233,254,0.95)] shadow-[0_0_0_2px_rgba(15,23,42,0.55)] transition-transform hover:scale-110',
                                handle.className,
                                handle.cursor,
                            )}
                            style={{ pointerEvents: 'auto' }}
                            onPointerDown={(event) => handleResizePointerDown(event, handle.key)}
                        />
                    ))}
                </div>
            )
            : null;

    const axisBadge = isSelected && isFlexParent && canResize
        ? (
              <div className='pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 rounded-full border border-[rgba(139,92,246,0.35)] bg-[rgba(15,23,42,0.82)] px-2 py-[2px] text-[9px] font-semibold uppercase tracking-[0.25em] text-[rgba(236,233,254,0.9)] shadow-[0_6px_18px_rgba(15,23,42,0.5)]'>
                  {parentLayoutMode === 'flex-row' ? 'Resize Width' : 'Resize Height'}
              </div>
          )
        : null;

    const basisValue = useMemo(() => {
        if (!isFlexParent) return null;
        const layout = element.layout ?? {};
        if (Number.isFinite(layout.basis)) return layout.basis;
        if (parentLayoutMode === 'flex-row') return Number.isFinite(props.width) ? props.width : null;
        if (parentLayoutMode === 'flex-column') return Number.isFinite(props.height) ? props.height : null;
        return null;
    }, [element.layout, isFlexParent, parentLayoutMode, props.height, props.width]);

    const showBasisBadge = isSelected && isFlexParent && element.type !== 'group';
    const basisBadge = showBasisBadge ? (
        <div className='pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-[rgba(139,92,246,0.35)] bg-[rgba(15,23,42,0.85)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[rgba(236,233,254,0.92)] shadow-[0_8px_24px_rgba(15,23,42,0.5)]'>
            <span>{parentLayoutMode === 'flex-row' ? 'Flex Width' : 'Flex Height'}</span>
            <span>{basisValue !== null ? `${Math.round(basisValue)}px` : 'Auto'}</span>
        </div>
    ) : null;

    switch (element.type) {
        case 'rect':
        case 'image':
            return (
                <div
                    className={clsx(
                        baseClass,
                        'relative rounded-2xl border border-transparent transition-shadow',
                        isPointerTool ? 'cursor-grab active:cursor-grabbing' : 'cursor-default',
                        {
                            'shadow-[0_0_0_2px_rgba(139,92,246,0.75)]': isSelected,
                        },
                    )}
                    style={{
                        ...commonStyle,
                    }}
                    onPointerDown={handlePointerDown}
                    onContextMenu={handleContextMenu}
                >
                    {linkBadge}
                    {basisBadge}
                    {resizeHandles}
                    {commentBadge}
                </div>
            );
        case 'text':
            {
                const textFillType = props.textFillType ?? 'solid';
                const textColor = props.fill ?? '#ECE9FE';
                const textGradientStart = props.textGradientStart ?? textColor;
                const textGradientEnd = props.textGradientEnd ?? textColor;
                const textGradientAngle = Number.isFinite(props.textGradientAngle)
                    ? props.textGradientAngle
                    : 45;
                const textShadowColor = props.textShadowColor;
                const textShadowX = Number.isFinite(props.textShadowX) ? props.textShadowX : 0;
                const textShadowY = Number.isFinite(props.textShadowY) ? props.textShadowY : 0;
                const textShadowBlur = Number.isFinite(props.textShadowBlur) ? props.textShadowBlur : 0;
                const computedTextShadow =
                    textShadowColor && textShadowColor !== 'transparent'
                        ? `${textShadowX}px ${textShadowY}px ${textShadowBlur}px ${textShadowColor}`
                        : undefined;
                const textStyle = {
                    ...commonStyle,
                    backgroundColor: 'transparent',
                    backgroundImage:
                        textFillType === 'gradient'
                            ? `linear-gradient(${textGradientAngle}deg, ${textGradientStart} 0%, ${textGradientEnd} 100%)`
                            : 'none',
                    backgroundClip: textFillType === 'gradient' ? 'text' : undefined,
                    WebkitBackgroundClip: textFillType === 'gradient' ? 'text' : undefined,
                    color: textFillType === 'gradient' ? 'transparent' : textColor,
                    fontSize: props.fontSize,
                    fontFamily: props.fontFamily,
                    fontWeight:
                        props.fontWeight ??
                        (props.fontStyle?.includes('bold') ? '600' : undefined),
                    fontStyle: props.fontStyle?.includes('italic') ? 'italic' : undefined,
                    lineHeight: props.lineHeight,
                    letterSpacing: props.letterSpacing,
                    textTransform: props.textTransform ?? 'none',
                    textShadow: computedTextShadow,
                };
            return (
                <div
                    className={clsx(
                        baseClass,
                        'relative whitespace-pre-wrap font-sans text-[rgba(236,233,254,0.92)]',
                        isPointerTool ? 'cursor-text lg:cursor-grab lg:active:cursor-grabbing' : 'cursor-text',
                        {
                            'shadow-[0_0_0_2px_rgba(139,92,246,0.6)]': isSelected,
                        },
                    )}
                    style={textStyle}
                    onPointerDown={handlePointerDown}
                    onContextMenu={handleContextMenu}
                >
                    {props.text}
                    {linkBadge}
                    {basisBadge}
                    {resizeHandles}
                    {commentBadge}
                </div>
            );
            }
        case 'group': {
            const layoutMode = element.layoutMode ?? 'absolute';
            const layoutGap = Number.isFinite(element.layoutGap) ? element.layoutGap : 0;
            const layoutPadding = normalizePadding(element.layoutPadding);
            const showLayoutOverlay = isSelected && layoutMode !== 'absolute';
            const layoutDirectionLabel = layoutMode === 'flex-row' ? 'Auto Layout · Row' : 'Auto Layout · Column';

            let gapMarkers = null;
            if (showLayoutOverlay && layoutGap > 0 && childrenNodes.length > 1) {
                const childDescriptors = childrenNodes
                    .map(({ element: child }) => ({
                        id: child.id,
                        props: child.props ?? {},
                    }))
                    .filter((item) => Number.isFinite(item.props.x) && Number.isFinite(item.props.y));

                if (layoutMode === 'flex-column') {
                    const sorted = [...childDescriptors].sort(
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
                                key={`gap-${current.id}-${next.id}`}
                                className='pointer-events-none absolute left-0 right-0 flex items-center justify-center text-[10px] font-semibold uppercase tracking-[0.25em]'
                                style={{
                                    top: currentBottom,
                                    height: gapSize,
                                    paddingLeft: layoutPadding.left,
                                    paddingRight: layoutPadding.right,
                                }}
                            >
                                <span className='rounded-full border border-[rgba(139,92,246,0.35)] bg-[rgba(139,92,246,0.15)] px-2 py-0.5 text-[rgba(236,233,254,0.75)]'>
                                    Gap {Math.round(gapSize)}
                                </span>
                            </div>,
                        );
                    }
                    gapMarkers = markers;
                } else if (layoutMode === 'flex-row') {
                    const sorted = [...childDescriptors].sort(
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
                                key={`gap-${current.id}-${next.id}`}
                                className='pointer-events-none absolute top-0 bottom-0 flex items-center justify-center text-[10px] font-semibold uppercase tracking-[0.25em]'
                                style={{
                                    left: currentRight,
                                    width: gapSize,
                                    paddingTop: layoutPadding.top,
                                    paddingBottom: layoutPadding.bottom,
                                }}
                            >
                                <span className='rotate-90 rounded-full border border-[rgba(139,92,246,0.35)] bg-[rgba(139,92,246,0.15)] px-2 py-0.5 text-[rgba(236,233,254,0.75)]'>
                                    Gap {Math.round(gapSize)}
                                </span>
                            </div>,
                        );
                    }
                    gapMarkers = markers;
                }
            }

            let dropHighlight = null;
            if (
                showLayoutOverlay &&
                autoLayoutPreview &&
                autoLayoutPreview.frameId === frameId &&
                autoLayoutPreview.parentId === element.id
            ) {
                const rect = autoLayoutPreview.rect;
                if (rect) {
                    dropHighlight = (
                        <div
                            className='pointer-events-none absolute rounded-[14px] border-2 border-dashed border-[rgba(236,233,254,0.72)] bg-[rgba(139,92,246,0.14)] transition-all'
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
                        const childNode = childrenNodes.find((node) => node.element.id === highlightId);
                        const childProps = childNode?.element?.props;
                        if (childProps) {
                            highlightBounds = {
                                x: childProps.x ?? layoutPadding.left,
                                y: childProps.y ?? layoutPadding.top,
                                width: Math.max(2, childProps.width ?? 0),
                                height: Math.max(2, childProps.height ?? 0),
                            };
                        }
                    }
                    if (!highlightBounds) {
                        highlightBounds = {
                            x: layoutPadding.left,
                            y: layoutPadding.top,
                            width: Math.max(0, (props.width ?? 0) - layoutPadding.left - layoutPadding.right),
                            height: Math.max(0, (props.height ?? 0) - layoutPadding.top - layoutPadding.bottom),
                        };
                    }

                    dropHighlight = (
                        <div
                            className='pointer-events-none absolute rounded-[14px] border-2 border-dashed border-[rgba(236,233,254,0.72)] bg-[rgba(139,92,246,0.14)] transition-all'
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

            const paddingOverlay = showLayoutOverlay ? (
                <div
                    className='pointer-events-none absolute rounded-xl border border-dashed border-[rgba(139,92,246,0.35)] bg-[rgba(139,92,246,0.1)]'
                    style={{
                        top: layoutPadding.top,
                        left: layoutPadding.left,
                        right: layoutPadding.right,
                        bottom: layoutPadding.bottom,
                    }}
                >
                    <div className='pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 rounded-full border border-[rgba(139,92,246,0.3)] bg-[rgba(236,233,254,0.08)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-[rgba(236,233,254,0.7)]'>
                        Padding T {layoutPadding.top} · R {layoutPadding.right} · B {layoutPadding.bottom} · L {layoutPadding.left}
                    </div>
                </div>
            ) : null;

            const layoutBadge = showLayoutOverlay ? (
                <div className='pointer-events-none absolute right-2 top-2 rounded-full border border-[rgba(139,92,246,0.45)] bg-[rgba(15,23,42,0.8)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-[rgba(236,233,254,0.8)] shadow-[0_0_0_1px_rgba(139,92,246,0.35)]'>
                    {layoutDirectionLabel}
                </div>
            ) : null;

            return (
                <div
                    className={clsx(
                        baseClass,
                        'rounded-2xl border border-dashed border-[rgba(148,163,184,0.25)] bg-transparent transition-shadow',
                        'relative',
                        isPointerTool ? 'cursor-grab active:cursor-grabbing' : 'cursor-default',
                        {
                            'shadow-[0_0_0_2px_rgba(139,92,246,0.75)]': isSelected,
                        },
                    )}
                    style={commonStyle}
                    onPointerDown={handlePointerDown}
                    onContextMenu={handleContextMenu}
                >
                    {showLayoutOverlay ? (
                        <div className='pointer-events-none absolute inset-0'>
                            {paddingOverlay}
                            {gapMarkers}
                            {dropHighlight}
                            {layoutBadge}
                        </div>
                    ) : null}
                    {linkBadge}
                    {commentBadge}
                    {resizeHandles}
                    {childrenNodes.map(({ element: child, children }) => (
                        <ElementNode key={child.id} element={child} frameId={frameId} childrenNodes={children} />
                    ))}
                </div>
            );
        }
        default:
            return null;
    }
}
