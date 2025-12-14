// PURE FUNCTION — NO STORES, NO SIDE EFFECTS
export function computeConstraintPreview(parent, nodes) {
    if (!parent || !nodes) return null;

    const parentX = parent.x ?? 0;
    const parentY = parent.y ?? 0;
    const parentW = parent.width ?? 0;
    const parentH = parent.height ?? 0;

    const previewChildren = {};

    Object.values(nodes).forEach((child) => {
        if (!child || child.parent !== parent.id) return;

        const c = child.constraints || {};
        const o = child.constraintOffsets || {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
        };

        let x = child.x ?? 0;
        let y = child.y ?? 0;
        let w = Math.max(1, child.width ?? 1);
        let h = Math.max(1, child.height ?? 1);

        /* ---------- HORIZONTAL ---------- */
        switch (c.horizontal) {
            case 'left-right': {
                x = parentX + o.left;
                w = Math.max(1, parentW - o.left - o.right);
                break;
            }

            case 'center': {
                x = parentX + parentW / 2 - w / 2;
                break;
            }

            case 'right': {
                x = parentX + parentW - w - o.right;
                break;
            }

            case 'stretch': {
                x = parentX;
                w = Math.max(1, parentW);
                break;
            }

            case 'left':
            default: {
                x = parentX + o.left;
                break;
            }
        }

        /* ---------- VERTICAL ---------- */
        switch (c.vertical) {
            case 'top-bottom': {
                y = parentY + o.top;
                h = Math.max(1, parentH - o.top - o.bottom);
                break;
            }

            case 'center': {
                y = parentY + parentH / 2 - h / 2;
                break;
            }

            case 'bottom': {
                y = parentY + parentH - h - o.bottom;
                break;
            }

            case 'stretch': {
                y = parentY;
                h = Math.max(1, parentH);
                break;
            }

            case 'top':
            default: {
                y = parentY + o.top;
                break;
            }
        }

        previewChildren[child.id] = {
            id: child.id,
            x,
            y,
            width: w,
            height: h,
            __preview: true,
        };
    });

    return {
        __preview: true,
        parent: {
            id: parent.id,
            x: parentX,
            y: parentY,
            width: parentW,
            height: parentH,
        },
        nodes: previewChildren,
    };
}
