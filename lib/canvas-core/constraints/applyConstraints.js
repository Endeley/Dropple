export function applyConstraints(parent, nodes, updateNode) {
    if (!parent) return;

    const bp = parent.breakpoint || 'base';

    const parentX = parent.x ?? 0;
    const parentY = parent.y ?? 0;
    const parentW = parent.width ?? 0;
    const parentH = parent.height ?? 0;

    Object.values(nodes).forEach((child) => {
        if (!child || child.parent !== parent.id) return;

        const constraintSet = child.constraints?.[bp] ?? child.constraints?.base ?? { horizontal: 'left', vertical: 'top' };

        const offs = child.constraintOffsets || {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
        };

        let x = child.x ?? 0;
        let y = child.y ?? 0;
        let w = child.width ?? 0;
        let h = child.height ?? 0;

        /* ---------- HORIZONTAL ---------- */
        switch (constraintSet.horizontal) {
            case 'left-right':
                x = parentX + offs.left;
                w = parentW - offs.left - offs.right;
                break;
            case 'center':
                x = parentX + parentW / 2 - w / 2;
                break;
            case 'right':
                x = parentX + parentW - w - offs.right;
                break;
            case 'stretch':
                x = parentX;
                w = parentW;
                break;
            default:
                x = parentX + offs.left;
        }

        /* ---------- VERTICAL ---------- */
        switch (constraintSet.vertical) {
            case 'top-bottom':
                y = parentY + offs.top;
                h = parentH - offs.top - offs.bottom;
                break;
            case 'center':
                y = parentY + parentH / 2 - h / 2;
                break;
            case 'bottom':
                y = parentY + parentH - h - offs.bottom;
                break;
            case 'stretch':
                y = parentY;
                h = parentH;
                break;
            default:
                y = parentY + offs.top;
        }

        updateNode(child.id, {
            x,
            y,
            width: Math.max(1, w),
            height: Math.max(1, h),
        });
    });
}
