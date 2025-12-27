'use client';

import { useNodeTreeStore } from '@/runtime/stores/nodeTreeStore';
import { useSelectionStore } from '@/runtime/stores/selectionStore';

const PIN_SIZE = 8;

export default function BreakpointPins({ bounds }) {
    const selectedIds = useSelectionStore((s) => s.selectedIds);
    const nodes = useNodeTreeStore((s) => s.nodes);
    const updateNode = useNodeTreeStore((s) => s.updateNode);

    if (!bounds || selectedIds.length !== 1) return null;

    const frame = nodes[selectedIds[0]];
    if (!frame || frame.type !== 'frame') return null;

    const breakpoints = frame.breakpoints || [];

    return (
        <>
            {breakpoints.map((bp) => {
                const x = bounds.x + bp.width;

                return (
                    <div
                        key={bp.id}
                        className='absolute pointer-events-auto group'
                        style={{
                            left: x - PIN_SIZE / 2,
                            top: bounds.y - 14,
                            width: PIN_SIZE,
                            height: PIN_SIZE,
                        }}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                        }}>
                        <div className='w-full h-full rounded-full bg-emerald-500 border border-emerald-700' />
                        <div className='absolute left-1/2 -top-6 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-[10px] bg-neutral-900 text-white px-1 rounded'>{bp.width}px</div>
                    </div>
                );
            })}
        </>
    );
}
