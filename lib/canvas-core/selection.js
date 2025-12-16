/* =========================================
   SELECTION GEOMETRY HELPERS
   Pure math utilities
   (NO store access, NO side effects)
========================================= */

/**
 * Checks if a point is inside a bounding box.
 */
export function isInsideBounds(x, y, bounds) {
    if (!bounds) return false;

    return x >= bounds.x && y >= bounds.y && x <= bounds.x + bounds.width && y <= bounds.y + bounds.height;
}

/**
 * Computes the bounding box for a set of selected nodes.
 * Used for:
 * - transform controls
 * - multi-select drag
 * - resize / rotate anchors
 *
 * NOTE:
 * - Rotation is intentionally ignored here (Figma-style)
 * - All values are normalized to finite numbers
 */
export function getSelectedBounds(selectedIds, nodeMap) {
    if (!selectedIds?.length) return null;

    const nodes = selectedIds.map((id) => nodeMap[id]).filter((n) => n && Number.isFinite(n.x) && Number.isFinite(n.y) && Number.isFinite(n.width) && Number.isFinite(n.height));

    if (!nodes.length) return null;

    const xs = nodes.map((n) => n.x);
    const ys = nodes.map((n) => n.y);
    const ws = nodes.map((n) => n.x + n.width);
    const hs = nodes.map((n) => n.y + n.height);

    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...ws);
    const maxY = Math.max(...hs);

    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
    };
}
