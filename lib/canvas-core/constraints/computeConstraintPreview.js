// PURE FUNCTION — NO STORES, NO SIDE EFFECTS
export function computeConstraintPreview(parent, nodes) {
    if (!parent || !nodes) return {};

    const parentX = parent.x ?? 0;
    const parentY = parent.y ?? 0;
    const parentW = parent.width ?? 0;
    const parentH = parent.height ?? 0;

    const previewChildren = {};

    Object.values(nodes).forEach((child) => {
        if (!child || child.parent !== parent.id) return;

        const constraints = child.constraints ?? {
            horizontal: 'left',
            vertical: 'top',
        };

        const offsets = child.constraintOffsets ?? {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
        };

        let x = child.x ?? 0;
        let y = child.y ?? 0;
        let width = Math.max(1, child.width ?? 1);
        let height = Math.max(1, child.height ?? 1);

        /* ---------- HORIZONTAL ---------- */
        switch (constraints.horizontal) {
            case 'left-right':
                x = parentX + offsets.left;
                width = Math.max(1, parentW - offsets.left - offsets.right);
                break;

            case 'center':
                x = parentX + parentW / 2 - width / 2;
                break;

            case 'right':
                x = parentX + parentW - width - offsets.right;
                break;

            case 'left':
            default:
                x = parentX + offsets.left;
                break;
        }

        /* ---------- VERTICAL ---------- */
        switch (constraints.vertical) {
            case 'top-bottom':
                y = parentY + offsets.top;
                height = Math.max(1, parentH - offsets.top - offsets.bottom);
                break;

            case 'center':
                y = parentY + parentH / 2 - height / 2;
                break;

            case 'bottom':
                y = parentY + parentH - height - offsets.bottom;
                break;

            case 'top':
            default:
                y = parentY + offsets.top;
                break;
        }

        previewChildren[child.id] = {
            id: child.id,
            x,
            y,
            width,
            height,

            // Used by GhostNodes & ConstraintGuides
            constraints,
        };
    });

    return previewChildren;
}
