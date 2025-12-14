'use client';

import { useNodeTreeStore } from '@/zustand/nodeTreeStore';
import { useSelectionStore } from '@/zustand/selectionStore';
import { useState } from 'react';

const PIN_SIZE = 10;

export default function ConstraintPins({ bounds }) {
    const selectedIds = useSelectionStore((s) => s.selectedIds);
    const nodes = useNodeTreeStore((s) => s.nodes);
    const updateNode = useNodeTreeStore((s) => s.updateNode);
    const recomputeOffsets = useNodeTreeStore((s) => s.recomputeConstraintOffsetsForNode);

    const [pulseKey, setPulseKey] = useState(0);

    // 🔒 STRICT guards (no crashes, ever)
    if (!bounds) return null;
    if (selectedIds.length !== 1) return null;

    const node = nodes[selectedIds[0]];
    if (!node || !node.parent) return null;

    const constraints = node.constraints || {};
    const pinState = getPinState(constraints);

    const isHStretch = constraints.horizontal === 'left-right';
    const isVStretch = constraints.vertical === 'top-bottom';

    /* ---------------- SETTERS ---------------- */

   const setHorizontal = (clicked) => {
       const current = constraints.horizontal ?? 'left';
       const next = nextHorizontal(current, clicked);

       updateNode(node.id, {
           constraints: { ...constraints, horizontal: next },
           width: Math.max(1, node.width ?? 1),
           height: Math.max(1, node.height ?? 1),
       });

       // ✅ recompute using ID (correct)
       recomputeOffsets(node.id);

       if (next === 'left-right' && current !== 'left-right') {
           setPulseKey((k) => k + 1);
       }
   };


   const setVertical = (clicked) => {
       const current = constraints.vertical ?? 'top';
       const next = nextVertical(current, clicked);

       updateNode(node.id, {
           constraints: { ...constraints, vertical: next },
           width: Math.max(1, node.width ?? 1),
           height: Math.max(1, node.height ?? 1),
       });

       recomputeOffsets(node.id);

       if (next === 'top-bottom' && current !== 'top-bottom') {
           setPulseKey((k) => k + 1);
       }
   };


    const { x, y, width, height } = bounds;

    return (
        <>
            {/* -------- HORIZONTAL -------- */}
            <Pin key={`h-left-${pulseKey}`} x={x} y={y + height / 2} active={pinState.left} pulse={isHStretch} tooltip='Left' onClick={() => setHorizontal('left')} />

            <Pin key='h-center' x={x + width / 2} y={y + height / 2} active={pinState.hCenter} tooltip='Center horizontally' onClick={() => setHorizontal('center')} />

            <Pin key={`h-right-${pulseKey}`} x={x + width} y={y + height / 2} active={pinState.right} pulse={isHStretch} tooltip={isHStretch ? 'Stretch horizontally' : 'Right'} onClick={() => setHorizontal('right')} />

            {/* -------- VERTICAL -------- */}
            <Pin key={`v-top-${pulseKey}`} x={x + width / 2} y={y} active={pinState.top} pulse={isVStretch} tooltip='Top' onClick={() => setVertical('top')} />

            <Pin key='v-center' x={x + width / 2} y={y + height / 2} active={pinState.vCenter} tooltip='Center vertically' onClick={() => setVertical('center')} />

            <Pin key={`v-bottom-${pulseKey}`} x={x + width / 2} y={y + height} active={pinState.bottom} pulse={isVStretch} tooltip={isVStretch ? 'Stretch vertically' : 'Bottom'} onClick={() => setVertical('bottom')} />
        </>
    );
}

/* ---------------------------------- */

function Pin({ x, y, active, pulse, tooltip, onClick }) {
    return (
        <div
            className='absolute pointer-events-auto group'
            style={{
                left: x - PIN_SIZE / 2,
                top: y - PIN_SIZE / 2,
                width: PIN_SIZE,
                height: PIN_SIZE,
            }}
            onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClick();
            }}>
            <div
                className={`w-full h-full rounded-full border ${pulse ? 'constraint-pulse' : ''}`}
                style={{
                    background: active ? '#2563eb' : '#e5e7eb',
                    borderColor: '#94a3b8',
                }}
            />
            <PinTooltip label={tooltip} />
        </div>
    );
}

function PinTooltip({ label }) {
    return (
        <div className='absolute left-1/2 -top-7 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none'>
            <div className='px-2 py-1 rounded text-[10px] bg-neutral-900 text-white whitespace-nowrap shadow'>{label}</div>
        </div>
    );
}

/* ---------------------------------- */

function getPinState(constraints) {
    const h = constraints?.horizontal ?? 'left';
    const v = constraints?.vertical ?? 'top';

    return {
        left: h === 'left' || h === 'left-right',
        right: h === 'right' || h === 'left-right',
        hCenter: h === 'center',
        top: v === 'top' || v === 'top-bottom',
        bottom: v === 'bottom' || v === 'top-bottom',
        vCenter: v === 'center',
    };
}

function nextHorizontal(current, clicked) {
    if (clicked === 'center') return 'center';
    if (current === 'left-right') return clicked;

    if ((current === 'left' && clicked === 'right') || (current === 'right' && clicked === 'left')) {
        return 'left-right';
    }
    return clicked;
}

function nextVertical(current, clicked) {
    if (clicked === 'center') return 'center';
    if (current === 'top-bottom') return clicked;

    if ((current === 'top' && clicked === 'bottom') || (current === 'bottom' && clicked === 'top')) {
        return 'top-bottom';
    }
    return clicked;
}
