// PURE FUNCTION — NO STORES, NO SIDE EFFECTS
export function computeAutoLayoutPreview(parent, nodes) {
    if (!parent || parent.layout !== 'flex') {
        return { __preview: true, parent, nodes: {} };
    }

    const { autoLayout = {}, x: parentX, y: parentY, width: parentWidth, height: parentHeight } = parent;

    const { direction = 'row', gap = 8, padding = 8, justify = 'start', align = 'start' } = autoLayout;

    const children = parent.children?.map((id) => nodes[id]).filter(Boolean) ?? [];
    if (!children.length) {
        return { __preview: true, parent, nodes: {} };
    }

    const isRow = direction === 'row';

    const mainSize = isRow ? parentWidth : parentHeight;
    const crossSize = isRow ? parentHeight : parentWidth;

    const innerMain = Math.max(0, mainSize - padding * 2 - gap * (children.length - 1));
    const innerCross = Math.max(0, crossSize - padding * 2);

    /* ---------------------------------------------
       1️⃣ Measure fixed + fill
    --------------------------------------------- */

    let fixedTotal = 0;
    let totalGrow = 0;

    children.forEach((child) => {
        const isFill = isRow ? child.sizeX === 'fill' : child.sizeY === 'fill';

        if (isFill) {
            totalGrow += child.flexGrow ?? 1;
        } else {
            fixedTotal += isRow ? (child.width ?? 0) : (child.height ?? 0);
        }
    });

    const remaining = Math.max(0, innerMain - fixedTotal);

    /* ---------------------------------------------
       2️⃣ Justify cursor start
    --------------------------------------------- */

    let cursor = padding;

    if (justify === 'center') cursor += remaining / 2;
    if (justify === 'end') cursor += remaining;
    if (justify === 'space-between' && children.length > 1) {
        gap = remaining / (children.length - 1);
    }

    /* ---------------------------------------------
       3️⃣ Layout children
    --------------------------------------------- */

    const preview = {};

    children.forEach((child) => {
        const grow = child.flexGrow ?? 1;
        const alignMode = child.alignSelf !== 'auto' ? child.alignSelf : align;

        let width = child.width ?? 1;
        let height = child.height ?? 1;

        // --- MAIN AXIS (fill) ---
        if (isRow && child.sizeX === 'fill' && totalGrow > 0) {
            width = (remaining * grow) / totalGrow;
        }

        if (!isRow && child.sizeY === 'fill' && totalGrow > 0) {
            height = (remaining * grow) / totalGrow;
        }

        // --- CROSS AXIS (stretch) ---
        if (alignMode === 'stretch') {
            if (isRow) {
                height = Math.max(child.minHeight ?? 1, Math.min(child.maxHeight ?? Infinity, innerCross));
            } else {
                width = Math.max(child.minWidth ?? 1, Math.min(child.maxWidth ?? Infinity, innerCross));
            }
        }

        let x = parentX + padding;
        let y = parentY + padding;

        if (isRow) {
            x = parentX + cursor;

            if (alignMode === 'center') {
                y = parentY + padding + (innerCross - height) / 2;
            } else if (alignMode === 'end') {
                y = parentY + padding + (innerCross - height);
            }
        } else {
            y = parentY + cursor;

            if (alignMode === 'center') {
                x = parentX + padding + (innerCross - width) / 2;
            } else if (alignMode === 'end') {
                x = parentX + padding + (innerCross - width);
            }
        }

        preview[child.id] = {
            id: child.id,
            x,
            y,
            width: Math.max(1, width),
            height: Math.max(1, height),
            __preview: true,
            __layout: 'flex',
        };

        cursor += (isRow ? width : height) + gap;
    });

    return {
        __preview: true,
        parent: {
            id: parent.id,
            x: parentX,
            y: parentY,
            width: parentWidth,
            height: parentHeight,
            autoLayout,
        },
        nodes: preview,
    };
}
