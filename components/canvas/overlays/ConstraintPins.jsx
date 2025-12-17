'use client';

import { useSelectionStore } from '@/zustand/selectionStore';
import { useNodeTreeStore } from '@/zustand/nodeTreeStore';

export default function ConstraintPins({ bounds }) {
    const selectedIds = useSelectionStore((s) => s.selectedIds);
    const nodes = useNodeTreeStore((s) => s.nodes);
    const setSizeMode = useNodeTreeStore((s) => s.setSizeMode);

    if (!bounds || selectedIds.length !== 1) return null;

    const node = nodes[selectedIds[0]];
    if (!node) return null;

    const { sizeX = 'fixed', sizeY = 'fixed' } = node;

    return (
        <>
            {/* Horizontal size */}
            <Pin x={bounds.x + bounds.width / 2} y={bounds.y - 24} label={sizeX} onClick={() => setSizeMode(node.id, 'x')} />

            {/* Vertical size */}
            <Pin x={bounds.x - 24} y={bounds.y + bounds.height / 2} label={sizeY} onClick={() => setSizeMode(node.id, 'y')} />
        </>
    );
}

/* --------------------------------------------- */

function Pin({ x, y, label, onClick }) {
    return (
        <div
            className='absolute pointer-events-auto cursor-pointer select-none'
            style={{
                left: x,
                top: y,
                transform: 'translate(-50%, -50%)',
            }}
            onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onClick();
            }}>
            <div className='px-2 py-1 text-xs rounded bg-black text-white'>{label.toUpperCase()}</div>
        </div>
    );
}
