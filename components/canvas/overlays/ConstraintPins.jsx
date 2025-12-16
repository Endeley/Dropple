'use client';

import { useNodeTreeStore } from '@/zustand/nodeTreeStore';
import { useSelectionStore } from '@/zustand/selectionStore';

const PIN_SIZE = 8;

export default function ConstraintPins({ bounds }) {
    const selectedIds = useSelectionStore((s) => s.selectedIds);
    const nodes = useNodeTreeStore((s) => s.nodes);
    const updateNode = useNodeTreeStore((s) => s.updateNode);

    if (selectedIds.length !== 1) return null;

    const node = nodes[selectedIds[0]];
    if (!node || !node.parent) return null;

    const parent = nodes[node.parent];
    if (!parent) return null;

    const { constraints = {} } = node;
    const h = constraints.horizontal ?? 'left';
    const v = constraints.vertical ?? 'top';

    const toggleHorizontal = (side) => {
        let next = h;

        if (side === 'left') {
            next = h === 'left' ? 'center' : h === 'right' ? 'left-right' : 'left';
        }

        if (side === 'right') {
            next = h === 'right' ? 'center' : h === 'left' ? 'left-right' : 'right';
        }

        updateNode(node.id, {
            constraints: { ...constraints, horizontal: next },
        });
    };

    const toggleVertical = (side) => {
        let next = v;

        if (side === 'top') {
            next = v === 'top' ? 'center' : v === 'bottom' ? 'top-bottom' : 'top';
        }

        if (side === 'bottom') {
            next = v === 'bottom' ? 'center' : v === 'top' ? 'top-bottom' : 'bottom';
        }

        updateNode(node.id, {
            constraints: { ...constraints, vertical: next },
        });
    };

    return (
        <div className='absolute pointer-events-none' style={bounds}>
            {/* LEFT */}
            <Pin active={h === 'left' || h === 'left-right'} style={{ left: -PIN_SIZE, top: bounds.height / 2 - PIN_SIZE / 2 }} onClick={() => toggleHorizontal('left')} />

            {/* RIGHT */}
            <Pin active={h === 'right' || h === 'left-right'} style={{ right: -PIN_SIZE, top: bounds.height / 2 - PIN_SIZE / 2 }} onClick={() => toggleHorizontal('right')} />

            {/* TOP */}
            <Pin active={v === 'top' || v === 'top-bottom'} style={{ top: -PIN_SIZE, left: bounds.width / 2 - PIN_SIZE / 2 }} onClick={() => toggleVertical('top')} />

            {/* BOTTOM */}
            <Pin active={v === 'bottom' || v === 'top-bottom'} style={{ bottom: -PIN_SIZE, left: bounds.width / 2 - PIN_SIZE / 2 }} onClick={() => toggleVertical('bottom')} />
        </div>
    );
}

function Pin({ active, style, onClick }) {
    return (
        <div
            className={`absolute rounded-full border cursor-pointer pointer-events-auto
                ${active ? 'bg-blue-500 border-blue-600' : 'bg-white border-gray-400'}`}
            style={{
                width: PIN_SIZE,
                height: PIN_SIZE,
                ...style,
            }}
            onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onClick();
            }}
        />
    );
}
