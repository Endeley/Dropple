'use client';

import { useNodeTreeStore } from '@/zustand/nodeTreeStore';
import { useSelectionStore } from '@/zustand/selectionStore';

const PIN_SIZE = 8;

export default function ConstraintPins({ bounds }) {
    const selectedIds = useSelectionStore((s) => s.selectedIds);
    const nodes = useNodeTreeStore((s) => s.nodes);
    const updateNode = useNodeTreeStore((s) => s.updateNode);
    const recomputeOffsets = useNodeTreeStore((s) => s.recomputeConstraintOffsetsForNode);

    if (selectedIds.length !== 1) return null;

    const node = nodes[selectedIds[0]];
    if (!node || !node.parent) return null;

    const c = node.constraints || { horizontal: 'left', vertical: 'top' };

    /* ---------------- TOGGLES ---------------- */

    const toggleHorizontal = () => {
        const order = ['left', 'center', 'right', 'left-right', 'stretch'];
        const next = order[(order.indexOf(c.horizontal) + 1) % order.length];

        updateNode(node.id, {
            constraints: { ...c, horizontal: next },
        });

        recomputeOffsets(node.id);
    };

    const toggleVertical = () => {
        const order = ['top', 'center', 'bottom', 'top-bottom', 'stretch'];
        const next = order[(order.indexOf(c.vertical) + 1) % order.length];

        updateNode(node.id, {
            constraints: { ...c, vertical: next },
        });

        recomputeOffsets(node.id);
    };

    /* ---------------- RENDER ---------------- */

    return (
        <>
            {/* Horizontal pin */}
            <div
                onMouseDown={(e) => e.stopPropagation()}
                onClick={toggleHorizontal}
                title={`Horizontal: ${c.horizontal}`}
                style={{
                    position: 'absolute',
                    left: bounds.x + bounds.width / 2 - PIN_SIZE / 2,
                    top: bounds.y - 16,
                    width: PIN_SIZE,
                    height: PIN_SIZE,
                    background: '#6366f1',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    pointerEvents: 'auto',
                }}
            />

            {/* Vertical pin */}
            <div
                onMouseDown={(e) => e.stopPropagation()}
                onClick={toggleVertical}
                title={`Vertical: ${c.vertical}`}
                style={{
                    position: 'absolute',
                    left: bounds.x - 16,
                    top: bounds.y + bounds.height / 2 - PIN_SIZE / 2,
                    width: PIN_SIZE,
                    height: PIN_SIZE,
                    background: '#6366f1',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    pointerEvents: 'auto',
                }}
            />
        </>
    );
}
