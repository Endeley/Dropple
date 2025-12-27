// PURE FUNCTION — NO STORES, NO SIDE EFFECTS
export function computeAutoLayoutSize(parent, children) {
    if (!parent || !children?.length) return null;

    const { autoLayout = {}, sizeX = 'fixed', sizeY = 'fixed', minWidth = 1, maxWidth = Infinity, minHeight = 1, maxHeight = Infinity } = parent;

    const { direction = 'column', gap = 8, padding = 8 } = autoLayout;

    let contentWidth = 0;
    let contentHeight = 0;

    if (direction === 'row') {
        let maxChildHeight = 0;

        children.forEach((child, i) => {
            contentWidth += child.width ?? 0;
            if (i > 0) contentWidth += gap;
            maxChildHeight = Math.max(maxChildHeight, child.height ?? 0);
        });

        contentHeight = maxChildHeight;
    } else {
        let maxChildWidth = 0;

        children.forEach((child, i) => {
            contentHeight += child.height ?? 0;
            if (i > 0) contentHeight += gap;
            maxChildWidth = Math.max(maxChildWidth, child.width ?? 0);
        });

        contentWidth = maxChildWidth;
    }

    // Include padding
    let width = contentWidth + padding * 2;
    let height = contentHeight + padding * 2;

    // ----------------------------------
    // HUG semantics (parent-driven)
    // ----------------------------------

    if (sizeX !== 'hug') {
        width = parent.width;
    }

    if (sizeY !== 'hug') {
        height = parent.height;
    }

    // ----------------------------------
    // Min / Max clamps
    // ----------------------------------

    width = Math.max(minWidth, Math.min(width, maxWidth));
    height = Math.max(minHeight, Math.min(height, maxHeight));

    return {
        width: Math.max(1, width),
        height: Math.max(1, height),
    };
}
