'use client';

import { useNodeTreeStore } from '@/zustand/nodeTreeStore';
import { useSelectionStore } from '@/zustand/selectionStore';
import { useToolStore } from '@/zustand/toolStore';

const snap = (v, gridSize, enabled) => (enabled ? Math.round(v / gridSize) * gridSize : v);

const getOffsets = (node, bp) =>
    node.constraintOffsets?.[bp] ??
    node.constraintOffsets?.base ?? {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    };

export default function ConstraintsPanel() {
    const selectedIds = useSelectionStore((s) => s.selectedIds);
    const nodes = useNodeTreeStore((s) => s.nodes);
    const updateNode = useNodeTreeStore((s) => s.updateNode);

    const snapToGrid = useToolStore((s) => s.snapToGrid);
    const gridSize = useToolStore((s) => s.gridSize);

    if (!selectedIds.length) return null;

    const selectedNodes = selectedIds.map((id) => nodes[id]).filter(Boolean);
    const parent = nodes[selectedNodes[0]?.parent];
    if (!parent || !selectedNodes.every((n) => n.parent === parent.id)) {
        return <div className='text-sm text-gray-400'>Select nodes with same parent</div>;
    }

    const bp = parent.breakpoint || 'base';
    const offsets = blendOffsets(selectedNodes, bp);

    const apply = (side, value) => {
        const snapped = snap(Math.max(0, Number(value) || 0), gridSize, snapToGrid);

        selectedNodes.forEach((n) =>
            updateNode(n.id, {
                constraintOffsets: {
                    ...(n.constraintOffsets || {}),
                    [bp]: {
                        ...getOffsets(n, bp),
                        [side]: snapped,
                    },
                },
            })
        );
    };

    return (
        <div className='space-y-2'>
            <div className='text-xs text-gray-500'>Breakpoint: {bp}</div>

            {['left', 'right', 'top', 'bottom'].map((side) => (
                <Row key={side} label={side}>
                    <OffsetInput value={offsets[side]} onChange={(v) => apply(side, v)} />
                </Row>
            ))}
        </div>
    );
}

/* helpers */

function blendOffsets(nodes, bp) {
    const result = {};
    ['left', 'right', 'top', 'bottom'].forEach((k) => {
        const values = nodes.map((n) => getOffsets(n, bp)[k]);
        const uniq = [...new Set(values)];
        result[k] = uniq.length === 1 ? uniq[0] : 'mixed';
    });
    return result;
}

function OffsetInput({ value, onChange }) {
    if (value === 'mixed') {
        return <input disabled value='—' className='w-full px-2 py-1 border rounded text-gray-400' />;
    }
    return <input type='number' className='w-full px-2 py-1 border rounded' value={value} onChange={(e) => onChange(e.target.value)} />;
}

function Row({ label, children }) {
    return (
        <div className='flex items-center gap-2'>
            <span className='w-14 text-sm capitalize'>{label}</span>
            {children}
        </div>
    );
}
