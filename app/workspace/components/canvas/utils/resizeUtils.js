'use client';

export const SNAP_STEP = 8;
export const FRAME_MIN_SIZE = 160;
export const ELEMENT_MIN_SIZE = 32;

export const RESIZE_HANDLES = [
    { key: 'nw', className: 'left-0 top-0 -translate-x-1/2 -translate-y-1/2', cursor: 'cursor-nw-resize' },
    { key: 'n', className: 'left-1/2 top-0 -translate-x-1/2 -translate-y-1/2', cursor: 'cursor-n-resize' },
    { key: 'ne', className: 'right-0 top-0 translate-x-1/2 -translate-y-1/2', cursor: 'cursor-ne-resize' },
    { key: 'e', className: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2', cursor: 'cursor-e-resize' },
    { key: 'se', className: 'right-0 bottom-0 translate-x-1/2 translate-y-1/2', cursor: 'cursor-se-resize' },
    { key: 's', className: 'left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2', cursor: 'cursor-s-resize' },
    { key: 'sw', className: 'left-0 bottom-0 -translate-x-1/2 translate-y-1/2', cursor: 'cursor-sw-resize' },
    { key: 'w', className: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2', cursor: 'cursor-w-resize' },
];

export function snapValue(value, step = SNAP_STEP) {
    if (!Number.isFinite(value) || step <= 0) return value;
    return Math.round(value / step) * step;
}

export function getHandleDirections(handleKey) {
    const key = handleKey || '';
    return {
        north: key.includes('n'),
        south: key.includes('s'),
        east: key.includes('e'),
        west: key.includes('w'),
    };
}

export function computeResizedBox({ start, handle, deltaX, deltaY, minWidth, minHeight, snap = SNAP_STEP }) {
    const { north, south, east, west } = getHandleDirections(handle);

    const startLeft = start.x ?? 0;
    const startTop = start.y ?? 0;
    const startWidth = Number.isFinite(start.width) ? start.width : minWidth;
    const startHeight = Number.isFinite(start.height) ? start.height : minHeight;

    let left = startLeft;
    let right = startLeft + startWidth;
    let top = startTop;
    let bottom = startTop + startHeight;

    if (west) left = startLeft + deltaX;
    if (east) right = startLeft + startWidth + deltaX;
    if (north) top = startTop + deltaY;
    if (south) bottom = startTop + startHeight + deltaY;

    const enforceMinSize = () => {
        if (right - left < minWidth) {
            if (west && !east) {
                left = right - minWidth;
            } else if (east && !west) {
                right = left + minWidth;
            } else {
                const center = (left + right) / 2;
                left = center - minWidth / 2;
                right = center + minWidth / 2;
            }
        }

        if (bottom - top < minHeight) {
            if (north && !south) {
                top = bottom - minHeight;
            } else if (south && !north) {
                bottom = top + minHeight;
            } else {
                const middle = (top + bottom) / 2;
                top = middle - minHeight / 2;
                bottom = middle + minHeight / 2;
            }
        }
    };

    enforceMinSize();

    if (snap > 1) {
        if (west) left = snapValue(left, snap);
        if (east) right = snapValue(right, snap);
        if (north) top = snapValue(top, snap);
        if (south) bottom = snapValue(bottom, snap);
        enforceMinSize();
    }

    const width = Math.max(minWidth, right - left);
    const height = Math.max(minHeight, bottom - top);

    return {
        x: left,
        y: top,
        width,
        height,
    };
}
