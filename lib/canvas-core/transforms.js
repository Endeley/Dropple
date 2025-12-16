/* =========================================
   CANVAS TRANSFORMS
   Single-responsibility math helpers
   (NO store access, NO side effects)
========================================= */

const MIN_SIZE = 1;

/* -------------------------
   RESIZE HANDLE SEMANTICS
-------------------------- */

const EDGE_HANDLES = ['left', 'right', 'top', 'bottom'];
const CORNER_HANDLES = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

/**
 * Determines resize intent based on handle.
 * - edge   → constraint-driven resize
 * - corner → scale-like resize
 */
export function getResizeMode(handle) {
    if (EDGE_HANDLES.includes(handle)) return 'constraint';
    if (CORNER_HANDLES.includes(handle)) return 'scale';
    return 'constraint';
}

/* -------------------------
   TRANSLATE
-------------------------- */
export function applyTranslate(node, dx, dy) {
    if (!node) return;

    node.x = (node.x ?? 0) + dx;
    node.y = (node.y ?? 0) + dy;
}

/* -------------------------
   ROTATION
-------------------------- */
export function calculateAngle(center, point) {
    return (Math.atan2(point.y - center.y, point.x - center.x) * 180) / Math.PI;
}

export function applyRotate(node, angle) {
    if (!node) return;
    node.rotation = angle;
}

/* -------------------------
   RESIZE (Figma-safe)
-------------------------- */
export function applyResize(node, handle, dx, dy) {
    if (!node) return;

    let { x, y, width, height } = node;

    // Ensure sane defaults
    x = x ?? 0;
    y = y ?? 0;
    width = Math.max(MIN_SIZE, width ?? MIN_SIZE);
    height = Math.max(MIN_SIZE, height ?? MIN_SIZE);

    switch (handle) {
        case 'right': {
            width = Math.max(MIN_SIZE, width + dx);
            break;
        }

        case 'left': {
            const nextW = Math.max(MIN_SIZE, width - dx);
            const delta = width - nextW;
            x += delta;
            width = nextW;
            break;
        }

        case 'bottom': {
            height = Math.max(MIN_SIZE, height + dy);
            break;
        }

        case 'top': {
            const nextH = Math.max(MIN_SIZE, height - dy);
            const delta = height - nextH;
            y += delta;
            height = nextH;
            break;
        }

        case 'top-left': {
            const nextW = Math.max(MIN_SIZE, width - dx);
            const nextH = Math.max(MIN_SIZE, height - dy);
            x += width - nextW;
            y += height - nextH;
            width = nextW;
            height = nextH;
            break;
        }

        case 'top-right': {
            const nextH = Math.max(MIN_SIZE, height - dy);
            y += height - nextH;
            width = Math.max(MIN_SIZE, width + dx);
            height = nextH;
            break;
        }

        case 'bottom-left': {
            const nextW = Math.max(MIN_SIZE, width - dx);
            x += width - nextW;
            width = nextW;
            height = Math.max(MIN_SIZE, height + dy);
            break;
        }

        case 'bottom-right': {
            width = Math.max(MIN_SIZE, width + dx);
            height = Math.max(MIN_SIZE, height + dy);
            break;
        }

        default:
            return;
    }

    // Commit back to node
    node.x = x;
    node.y = y;
    node.width = width;
    node.height = height;
}
