// lib/canvas-core/constraints/applyConstraints.js

export function applyConstraints(parent, children = []) {
    if (!parent) return [];

    const px = parent.x ?? 0;
    const py = parent.y ?? 0;
    const pw = parent.width ?? 0;
    const ph = parent.height ?? 0;

    return children.map((child) => {
        if (!child) return child;

        const c = child.constraints || {};
        const offs = child.constraintOffsets || { left: 0, right: 0, top: 0, bottom: 0 };

        let x = child.x ?? 0;
        let y = child.y ?? 0;
        let w = child.width ?? 0;
        let h = child.height ?? 0;

        /* HORIZONTAL */
        switch (c.horizontal) {
            case 'left-right':
                x = px + offs.left;
                w = pw - offs.left - offs.right;
                break;
            case 'center':
                x = px + pw / 2 - w / 2;
                break;
            case 'right':
                x = px + pw - w - offs.right;
                break;
            case 'stretch':
                x = px;
                w = pw;
                break;
            default:
                x = px + offs.left;
        }

        /* VERTICAL */
        switch (c.vertical) {
            case 'top-bottom':
                y = py + offs.top;
                h = ph - offs.top - offs.bottom;
                break;
            case 'center':
                y = py + ph / 2 - h / 2;
                break;
            case 'bottom':
                y = py + ph - h - offs.bottom;
                break;
            case 'stretch':
                y = py;
                h = ph;
                break;
            default:
                y = py + offs.top;
        }

        return {
            ...child,
            x,
            y,
            width: Math.max(1, w),
            height: Math.max(1, h),
        };
    });
}
