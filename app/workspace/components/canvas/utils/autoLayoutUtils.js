'use client';

export const DEFAULT_LAYOUT_PADDING = { top: 64, right: 64, bottom: 64, left: 64 };

export function normalizePadding(padding) {
    const base = { ...DEFAULT_LAYOUT_PADDING };
    if (!padding) return base;
    return {
        top: Number.isFinite(padding.top) ? padding.top : base.top,
        right: Number.isFinite(padding.right) ? padding.right : base.right,
        bottom: Number.isFinite(padding.bottom) ? padding.bottom : base.bottom,
        left: Number.isFinite(padding.left) ? padding.left : base.left,
    };
}

export function computeEmptyContainerPreviewRect(container) {
    const padding = container?.padding ?? DEFAULT_LAYOUT_PADDING;
    const innerLeft = padding.left ?? 0;
    const innerTop = padding.top ?? 0;
    const innerWidth = Math.max(
        0,
        (container?.width ?? 0) - (padding.left ?? 0) - (padding.right ?? 0),
    );
    const innerHeight = Math.max(
        0,
        (container?.height ?? 0) - (padding.top ?? 0) - (padding.bottom ?? 0),
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
            tentativeTop = (firstRow?.top ?? innerTop) - baseRowHeight - Math.max(4, rowGap / 2);
            tentativeBottom = tentativeTop + baseRowHeight;
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

    const highlightX = Math.max(innerLeft, Math.min(candidatePoint.x - highlightWidth / 2, innerRight - highlightWidth));

    return {
        x: highlightX,
        y: tentativeTop,
        width: highlightWidth,
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
        const column = columnMap.get(beforeId);
        highlightY = Math.max(innerTop, Math.min(column.top ?? innerTop, innerBottom));
    } else if (afterId && columnMap.has(afterId)) {
        const column = columnMap.get(afterId);
        highlightY = Math.max(innerTop, Math.min(column.bottom ?? innerTop, innerBottom));
    } else {
        highlightY = Math.max(innerTop, Math.min(candidatePoint.y - highlightHeight / 2, innerBottom - highlightHeight));
    }

    return {
        x: tentativeLeft,
        y: highlightY,
        width,
        height: highlightHeight,
    };
}

export function computeAutoLayoutDrop({
    frame,
    parentId,
    elementId,
    layoutMode,
    candidatePoint,
    container,
}) {
    if (!frame || !container) {
        return {
            index: 0,
            beforeId: null,
            afterId: null,
            ordered: [],
            previewRect: computeEmptyContainerPreviewRect(container),
        };
    }

    const siblings = (frame.elements ?? []).filter(
        (item) => (item.parentId ?? null) === (parentId ?? null) && item.id !== elementId,
    );
    if (siblings.length === 0) {
        return {
            index: 0,
            beforeId: null,
            afterId: null,
            ordered: [],
            previewRect: computeEmptyContainerPreviewRect(container),
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
    } else {
        previewRect = computeEmptyContainerPreviewRect(container);
    }

    return {
        index: targetIndex,
        beforeId,
        afterId,
        ordered,
        previewRect,
    };
}

export function resolveAutoLayoutContainer(frame, parentId = null) {
    if (!frame) return null;
    const baseOffsetX = frame.x ?? 0;
    const baseOffsetY = frame.y ?? 0;

    if (!parentId) {
        return {
            id: frame.id,
            layoutWrap: frame.layoutWrap ?? 'nowrap',
            gap: frame.layoutGap ?? 0,
            rowGap: frame.layoutRowGap ?? frame.layoutGap ?? 0,
            padding: normalizePadding(frame.layoutPadding),
            width: frame.width ?? 0,
            height: frame.height ?? 0,
            offsetX: baseOffsetX,
            offsetY: baseOffsetY,
        };
    }

    const elementMap = new Map((frame.elements ?? []).map((el) => [el.id, el]));
    let currentId = parentId;
    let offsetX = baseOffsetX;
    let offsetY = baseOffsetY;
    let containerElement = null;

    while (currentId) {
        const current = elementMap.get(currentId);
        if (!current) break;
        const props = current.props ?? {};
        offsetX += props.x ?? 0;
        offsetY += props.y ?? 0;
        containerElement = current;
        currentId = current.parentId ?? null;
    }

    if (!containerElement) return null;

    const props = containerElement.props ?? {};
    const padding = normalizePadding(containerElement.layoutPadding);
    return {
        id: containerElement.id,
        layoutWrap: containerElement.layoutWrap ?? 'nowrap',
        gap: containerElement.layoutGap ?? 0,
        rowGap: containerElement.layoutRowGap ?? containerElement.layoutGap ?? 0,
        padding,
        width: Number.isFinite(props.width) ? props.width : frame.width ?? 0,
        height: Number.isFinite(props.height) ? props.height : frame.height ?? 0,
        offsetX,
        offsetY,
    };
}

export function createContainerTargets(frame, parentId = null, ignoreId = null, container) {
    if (!frame) return [];
    const padding = container?.padding ?? DEFAULT_LAYOUT_PADDING;
    const width = container?.width ?? frame.width ?? 0;
    const height = container?.height ?? frame.height ?? 0;

    const targets = [
        {
            left: padding.left ?? 0,
            right: Math.max(0, width - (padding.right ?? 0)),
            centerX:
                (padding.left ?? 0) +
                Math.max(0, width - (padding.left ?? 0) - (padding.right ?? 0)) / 2,
            top: padding.top ?? 0,
            bottom: Math.max(0, height - (padding.bottom ?? 0)),
            centerY:
                (padding.top ?? 0) +
                Math.max(0, height - (padding.top ?? 0) - (padding.bottom ?? 0)) / 2,
        },
    ];

    const siblings = (frame.elements ?? []).filter(
        (item) =>
            (item.parentId ?? null) === (parentId ?? null) && (!ignoreId || item.id !== ignoreId),
    );

    siblings.forEach((element) => {
        const props = element.props ?? {};
        const left = props.x ?? 0;
        const top = props.y ?? 0;
        const elementWidth = props.width ?? 0;
        const elementHeight = props.height ?? 0;
        targets.push({
            left,
            right: left + elementWidth,
            centerX: left + elementWidth / 2,
            top,
            bottom: top + elementHeight,
            centerY: top + elementHeight / 2,
        });
    });

    return targets;
}
