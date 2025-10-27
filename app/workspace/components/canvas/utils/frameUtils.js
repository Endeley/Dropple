'use client';

export function findFrameAtPoint(frames, point) {
    for (let i = frames.length - 1; i >= 0; i -= 1) {
        const frame = frames[i];
        if (
            point.x >= frame.x &&
            point.x <= frame.x + frame.width &&
            point.y >= frame.y &&
            point.y <= frame.y + frame.height
        ) {
            return frame;
        }
    }
    return null;
}

export function findElementAtPoint(frame, point) {
    if (!frame?.elements) return null;
    for (let index = frame.elements.length - 1; index >= 0; index -= 1) {
        const element = frame.elements[index];
        const props = element?.props ?? {};
        const elementX = frame.x + (props.x ?? 0);
        const elementY = frame.y + (props.y ?? 0);
        const width = props.width ?? 0;
        const height = props.height ?? 0;
        if (
            point.x >= elementX &&
            point.x <= elementX + width &&
            point.y >= elementY &&
            point.y <= elementY + height
        ) {
            return element;
        }
    }
    return null;
}
