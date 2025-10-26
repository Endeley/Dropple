'use client';

import { getHandleDirections } from './resizeUtils';

export const ALIGNMENT_THRESHOLD = 6;

function normalizeTargets(targets = []) {
    return targets
        .map((target) => ({
            left: target.left,
            right: target.right,
            centerX: target.centerX,
            top: target.top,
            bottom: target.bottom,
            centerY: target.centerY,
        }))
        .filter(
            (target) =>
                Number.isFinite(target.left) ||
                Number.isFinite(target.right) ||
                Number.isFinite(target.centerX) ||
                Number.isFinite(target.top) ||
                Number.isFinite(target.bottom) ||
                Number.isFinite(target.centerY),
        );
}

export function createFrameTargets(frames, ignoreId) {
    if (!Array.isArray(frames)) return [];
    return normalizeTargets(
        frames
            .filter((frame) => frame && frame.id !== ignoreId)
            .map((frame) => {
                const left = frame.x ?? 0;
                const top = frame.y ?? 0;
                const width = frame.width ?? 0;
                const height = frame.height ?? 0;
                return {
                    left,
                    right: left + width,
                    centerX: left + width / 2,
                    top,
                    bottom: top + height,
                    centerY: top + height / 2,
                };
            }),
    );
}

export function createElementTargets(frame, ignoreId) {
    if (!frame) return [];
    const frameLeft = frame.x ?? 0;
    const frameTop = frame.y ?? 0;
    const frameWidth = frame.width ?? 0;
    const frameHeight = frame.height ?? 0;
    const frameTargets = [
        {
            left: 0,
            right: frameWidth,
            centerX: frameWidth / 2,
            top: 0,
            bottom: frameHeight,
            centerY: frameHeight / 2,
        },
    ];

    const elementTargets = (frame.elements ?? [])
        .filter((el) => el && el.id !== ignoreId)
        .map((el) => {
            const props = el.props ?? {};
            const left = props.x ?? 0;
            const top = props.y ?? 0;
            const width = props.width ?? 0;
            const height = props.height ?? 0;
            return {
                left,
                right: left + width,
                centerX: left + width / 2,
                top,
                bottom: top + height,
                centerY: top + height / 2,
            };
        });

    return normalizeTargets([...frameTargets, ...elementTargets]);
}

export function snapRectToTargets({ rect, targets, threshold = ALIGNMENT_THRESHOLD }) {
    if (!rect) return { x: rect?.x ?? 0, y: rect?.y ?? 0, guides: [] };

    const normalizedTargets = normalizeTargets(targets);
    if (normalizedTargets.length === 0) return { x: rect.x, y: rect.y, guides: [] };

    const width = rect.width ?? 0;
    const height = rect.height ?? 0;
    const left = rect.x ?? 0;
    const right = left + width;
    const centerX = left + width / 2;
    const top = rect.y ?? 0;
    const bottom = top + height;
    const centerY = top + height / 2;

    let snappedX = left;
    let snappedY = top;
    let bestVerticalDiff = Infinity;
    let bestHorizontalDiff = Infinity;
    let verticalGuide = null;
    let horizontalGuide = null;

    normalizedTargets.forEach((target) => {
        if (Number.isFinite(target.left)) {
            const diffLeft = Math.abs(left - target.left);
            if (diffLeft < bestVerticalDiff && diffLeft <= threshold) {
                bestVerticalDiff = diffLeft;
                snappedX = target.left;
                verticalGuide = { orientation: 'vertical', position: target.left };
            }
            const diffRight = Math.abs(right - target.left);
            if (diffRight < bestVerticalDiff && diffRight <= threshold) {
                bestVerticalDiff = diffRight;
                snappedX = target.left - width;
                verticalGuide = { orientation: 'vertical', position: target.left };
            }
        }

        if (Number.isFinite(target.right)) {
            const diffLeftToRight = Math.abs(left - target.right);
            if (diffLeftToRight < bestVerticalDiff && diffLeftToRight <= threshold) {
                bestVerticalDiff = diffLeftToRight;
                snappedX = target.right;
                verticalGuide = { orientation: 'vertical', position: target.right };
            }
            const diffRightToRight = Math.abs(right - target.right);
            if (diffRightToRight < bestVerticalDiff && diffRightToRight <= threshold) {
                bestVerticalDiff = diffRightToRight;
                snappedX = target.right - width;
                verticalGuide = { orientation: 'vertical', position: target.right };
            }
        }

        if (Number.isFinite(target.centerX)) {
            const diffCenter = Math.abs(centerX - target.centerX);
            if (diffCenter < bestVerticalDiff && diffCenter <= threshold) {
                bestVerticalDiff = diffCenter;
                snappedX = target.centerX - width / 2;
                verticalGuide = { orientation: 'vertical', position: target.centerX };
            }
        }

        if (Number.isFinite(target.top)) {
            const diffTop = Math.abs(top - target.top);
            if (diffTop < bestHorizontalDiff && diffTop <= threshold) {
                bestHorizontalDiff = diffTop;
                snappedY = target.top;
                horizontalGuide = { orientation: 'horizontal', position: target.top };
            }
            const diffBottom = Math.abs(bottom - target.top);
            if (diffBottom < bestHorizontalDiff && diffBottom <= threshold) {
                bestHorizontalDiff = diffBottom;
                snappedY = target.top - height;
                horizontalGuide = { orientation: 'horizontal', position: target.top };
            }
        }

        if (Number.isFinite(target.bottom)) {
            const diffTopToBottom = Math.abs(top - target.bottom);
            if (diffTopToBottom < bestHorizontalDiff && diffTopToBottom <= threshold) {
                bestHorizontalDiff = diffTopToBottom;
                snappedY = target.bottom;
                horizontalGuide = { orientation: 'horizontal', position: target.bottom };
            }
            const diffBottomToBottom = Math.abs(bottom - target.bottom);
            if (diffBottomToBottom < bestHorizontalDiff && diffBottomToBottom <= threshold) {
                bestHorizontalDiff = diffBottomToBottom;
                snappedY = target.bottom - height;
                horizontalGuide = { orientation: 'horizontal', position: target.bottom };
            }
        }

        if (Number.isFinite(target.centerY)) {
            const diffCenter = Math.abs(centerY - target.centerY);
            if (diffCenter < bestHorizontalDiff && diffCenter <= threshold) {
                bestHorizontalDiff = diffCenter;
                snappedY = target.centerY - height / 2;
                horizontalGuide = { orientation: 'horizontal', position: target.centerY };
            }
        }
    });

    const guides = [];
    if (verticalGuide) guides.push(verticalGuide);
    if (horizontalGuide) guides.push(horizontalGuide);

    return {
        x: snappedX,
        y: snappedY,
        guides,
    };
}

export function snapResizedRectToTargets({ rect, handle, targets, threshold = ALIGNMENT_THRESHOLD }) {
    if (!rect) return { rect, guides: [] };

    const normalizedTargets = normalizeTargets(targets);
    if (normalizedTargets.length === 0) return { rect, guides: [] };

    const directions = getHandleDirections(handle);
    let left = rect.x ?? 0;
    let top = rect.y ?? 0;
    let width = rect.width ?? 0;
    let height = rect.height ?? 0;
    const right = left + width;
    const bottom = top + height;

    let verticalGuide = null;
    let horizontalGuide = null;

    const maybeSnapLeft = (value) => {
        let snapped = value;
        let bestDiff = Infinity;
        normalizedTargets.forEach((target) => {
            if (Number.isFinite(target.left)) {
                const diff = Math.abs(value - target.left);
                if (diff <= threshold && diff < bestDiff) {
                    bestDiff = diff;
                    snapped = target.left;
                    verticalGuide = { orientation: 'vertical', position: target.left };
                }
            }
            if (Number.isFinite(target.right)) {
                const diff = Math.abs(value - target.right);
                if (diff <= threshold && diff < bestDiff) {
                    bestDiff = diff;
                    snapped = target.right;
                    verticalGuide = { orientation: 'vertical', position: target.right };
                }
            }
        });
        return snapped;
    };

    const maybeSnapRight = (value) => {
        let snapped = value;
        let bestDiff = Infinity;
        normalizedTargets.forEach((target) => {
            if (Number.isFinite(target.left)) {
                const diff = Math.abs(value - target.left);
                if (diff <= threshold && diff < bestDiff) {
                    bestDiff = diff;
                    snapped = target.left;
                    verticalGuide = { orientation: 'vertical', position: target.left };
                }
            }
            if (Number.isFinite(target.right)) {
                const diff = Math.abs(value - target.right);
                if (diff <= threshold && diff < bestDiff) {
                    bestDiff = diff;
                    snapped = target.right;
                    verticalGuide = { orientation: 'vertical', position: target.right };
                }
            }
        });
        return snapped;
    };

    const maybeSnapTop = (value) => {
        let snapped = value;
        let bestDiff = Infinity;
        normalizedTargets.forEach((target) => {
            if (Number.isFinite(target.top)) {
                const diff = Math.abs(value - target.top);
                if (diff <= threshold && diff < bestDiff) {
                    bestDiff = diff;
                    snapped = target.top;
                    horizontalGuide = { orientation: 'horizontal', position: target.top };
                }
            }
            if (Number.isFinite(target.bottom)) {
                const diff = Math.abs(value - target.bottom);
                if (diff <= threshold && diff < bestDiff) {
                    bestDiff = diff;
                    snapped = target.bottom;
                    horizontalGuide = { orientation: 'horizontal', position: target.bottom };
                }
            }
        });
        return snapped;
    };

    const maybeSnapBottom = (value) => {
        let snapped = value;
        let bestDiff = Infinity;
        normalizedTargets.forEach((target) => {
            if (Number.isFinite(target.top)) {
                const diff = Math.abs(value - target.top);
                if (diff <= threshold && diff < bestDiff) {
                    bestDiff = diff;
                    snapped = target.top;
                    horizontalGuide = { orientation: 'horizontal', position: target.top };
                }
            }
            if (Number.isFinite(target.bottom)) {
                const diff = Math.abs(value - target.bottom);
                if (diff <= threshold && diff < bestDiff) {
                    bestDiff = diff;
                    snapped = target.bottom;
                    horizontalGuide = { orientation: 'horizontal', position: target.bottom };
                }
            }
        });
        return snapped;
    };

    let nextLeft = left;
    let nextRight = right;
    let nextTop = top;
    let nextBottom = bottom;

    if (directions.west) {
        nextLeft = maybeSnapLeft(left);
    }
    if (directions.east) {
        nextRight = maybeSnapRight(right);
    }
    if (directions.north) {
        nextTop = maybeSnapTop(top);
    }
    if (directions.south) {
        nextBottom = maybeSnapBottom(bottom);
    }

    if (nextRight < nextLeft) {
        const midpoint = (nextLeft + nextRight) / 2;
        nextLeft = midpoint - 1;
        nextRight = midpoint + 1;
    }
    if (nextBottom < nextTop) {
        const midpoint = (nextTop + nextBottom) / 2;
        nextTop = midpoint - 1;
        nextBottom = midpoint + 1;
    }

    const guides = [];
    if (verticalGuide) guides.push(verticalGuide);
    if (horizontalGuide) guides.push(horizontalGuide);

    return {
        rect: {
            x: directions.west ? nextLeft : left,
            y: directions.north ? nextTop : top,
            width: directions.east || directions.west ? nextRight - nextLeft : width,
            height: directions.north || directions.south ? nextBottom - nextTop : height,
        },
        guides,
    };
}
