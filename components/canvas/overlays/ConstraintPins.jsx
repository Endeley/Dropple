'use client';

import { useNodeTreeStore } from '@/zustand/nodeTreeStore';
import { useSelectionStore } from '@/zustand/selectionStore';

const PIN_SIZE = 8;

export default function ConstraintPins({ nodeMap }) {
    const selectedIds = useSelectionStore((s) => s.selectedIds);
    const updateNode = useNodeTreeStore((s) => s.updateNode);

    if (selectedIds.length !== 1) return null;

    const node = nodeMap[selectedIds[0]];
    if (!node || !node.parent) return null;

    const parent = nodeMap[node.parent];
    if (!parent) return null;

    const c = node.constraints || { horizontal: 'left', vertical: 'top' };

    const centerX = node.x + node.width / 2;
    const centerY = node.y + node.height / 2;

    const setH = (value) =>
        updateNode(node.id, {
            constraints: { ...c, horizontal: value },
        });

    const setV = (value) =>
        updateNode(node.id, {
            constraints: { ...c, vertical: value },
        });

    return (
        <>
            {/* HORIZONTAL PINS */}
            <Pin x={node.x - PIN_SIZE * 1.5} y={centerY} active={c.horizontal === 'left'} onClick={() => setH('left')} />

            <Pin x={centerX - PIN_SIZE / 2} y={node.y - PIN_SIZE * 1.5} active={c.horizontal === 'center'} onClick={() => setH('center')} />

            <Pin x={node.x + node.width + PIN_SIZE * 0.5} y={centerY} active={c.horizontal === 'right'} onClick={() => setH('right')} />

            {/* VERTICAL PINS */}
            <Pin x={centerX} y={node.y - PIN_SIZE * 1.5} active={c.vertical === 'top'} onClick={() => setV('top')} />

            <Pin x={centerX} y={centerY} active={c.vertical === 'center'} onClick={() => setV('center')} />

            <Pin x={centerX} y={node.y + node.height + PIN_SIZE * 0.5} active={c.vertical === 'bottom'} onClick={() => setV('bottom')} />
        </>
    );
}

/* ---------------- PIN ---------------- */

function Pin({ x, y, active, onClick }) {
    return (
        <div
            onMouseDown={(e) => {
                e.stopPropagation();
                onClick();
            }}
            className={`absolute rounded-full cursor-pointer ${active ? 'bg-blue-500' : 'bg-neutral-300'}`}
            style={{
                width: PIN_SIZE,
                height: PIN_SIZE,
                left: x,
                top: y,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'auto',
            }}
        />
    );
}
