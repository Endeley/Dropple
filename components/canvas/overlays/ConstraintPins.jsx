'use client';

import { useNodeTreeStore } from '@/zustand/nodeTreeStore';
import { useSelectionStore } from '@/zustand/selectionStore';
import { useState } from 'react';
import { blendConstraints } from '@/lib/canvas-core/constraints/blendConstraints';

const PIN_SIZE = 10;

export default function ConstraintPins({ bounds }) {
    const selectedIds = useSelectionStore((s) => s.selectedIds);
    const nodes = useNodeTreeStore((s) => s.nodes);
    const updateNode = useNodeTreeStore((s) => s.updateNode);
    const recomputeOffsets = useNodeTreeStore((s) => s.recomputeConstraintOffsetsForNode);

    const [pulseKey, setPulseKey] = useState(0);

    /* -------------------------------------------------
       GUARDS (ABSOLUTELY SAFE)
    ------------------------------------------------- */
    if (!bounds) return null;
    if (!selectedIds.length) return null;

    const selectedNodes = selectedIds
        .map((id) => nodes[id])
        .filter(Boolean)
        .filter((n) => n.parent);

    if (!selectedNodes.length) return null;

    // All selected nodes must share the same parent (Figma rule)
    const parentId = selectedNodes[0].parent;
    if (!selectedNodes.every((n) => n.parent === parentId)) return null;

    /* -------------------------------------------------
       BLENDED CONSTRAINT STATE
    ------------------------------------------------- */
    const blended = blendConstraints(selectedNodes);

    const pinState = {
        left: blended.horizontal === 'left' || blended.horizontal === 'left-right',
        right: blended.horizontal === 'right' || blended.horizontal === 'left-right',
        hCenter: blended.horizontal === 'center',

        top: blended.vertical === 'top' || blended.vertical === 'top-bottom',
        bottom: blended.vertical === 'bottom' || blended.vertical === 'top-bottom',
        vCenter: blended.vertical === 'center',

        hMixed: blended.horizontal === 'mixed',
        vMixed: blended.vertical === 'mixed',
    };

    const isHStretch = blended.horizontal === 'left-right';
    const isVStretch = blended.vertical === 'top-bottom';

    /* -------------------------------------------------
       SETTERS (BULK APPLY)
    ------------------------------------------------- */
    const setHorizontal = (clicked) => {
        selectedNodes.forEach((node) => {
            const current = node.constraints?.horizontal ?? 'left';
            const next = nextHorizontal(current, clicked);

            updateNode(node.id, {
                constraints: {
                    ...node.constraints,
                    horizontal: next,
                },
                width: Math.max(1, node.width ?? 1),
                height: Math.max(1, node.height ?? 1),
            });

            recomputeOffsets(node.id);
        });

        setPulseKey((k) => k + 1);
    };

    const setVertical = (clicked) => {
        selectedNodes.forEach((node) => {
            const current = node.constraints?.vertical ?? 'top';
            const next = nextVertical(current, clicked);

            updateNode(node.id, {
                constraints: {
                    ...node.constraints,
                    vertical: next,
                },
                width: Math.max(1, node.width ?? 1),
                height: Math.max(1, node.height ?? 1),
            });

            recomputeOffsets(node.id);
        });

        setPulseKey((k) => k + 1);
    };

    const { x, y, width, height } = bounds;

    return (
        <>
            {/* -------- HORIZONTAL -------- */}
            <Pin key={`h-left-${pulseKey}`} x={x} y={y + height / 2} active={pinState.left} mixed={pinState.hMixed} pulse={isHStretch} tooltip={pinState.hMixed ? 'Mixed' : 'Left'} onClick={() => setHorizontal('left')} />

            <Pin key='h-center' x={x + width / 2} y={y + height / 2} active={pinState.hCenter} mixed={pinState.hMixed} tooltip='Center horizontally' onClick={() => setHorizontal('center')} />

            <Pin key={`h-right-${pulseKey}`} x={x + width} y={y + height / 2} active={pinState.right} mixed={pinState.hMixed} pulse={isHStretch} tooltip={isHStretch ? 'Stretch horizontally' : 'Right'} onClick={() => setHorizontal('right')} />

            {/* -------- VERTICAL -------- */}
            <Pin key={`v-top-${pulseKey}`} x={x + width / 2} y={y} active={pinState.top} mixed={pinState.vMixed} pulse={isVStretch} tooltip={pinState.vMixed ? 'Mixed' : 'Top'} onClick={() => setVertical('top')} />

            <Pin key='v-center' x={x + width / 2} y={y + height / 2} active={pinState.vCenter} mixed={pinState.vMixed} tooltip='Center vertically' onClick={() => setVertical('center')} />

            <Pin key={`v-bottom-${pulseKey}`} x={x + width / 2} y={y + height} active={pinState.bottom} mixed={pinState.vMixed} pulse={isVStretch} tooltip={isVStretch ? 'Stretch vertically' : 'Bottom'} onClick={() => setVertical('bottom')} />
        </>
    );
}

/* -------------------------------------------------
   PIN
------------------------------------------------- */
function Pin({ x, y, active, mixed, pulse, tooltip, onClick }) {
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
                className={`w-full h-full rounded-full border
                    ${pulse ? 'constraint-pulse' : ''}
                    ${mixed ? 'border-dashed bg-neutral-300' : ''}
                `}
                style={{
                    background: active && !mixed ? '#2563eb' : undefined,
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

/* -------------------------------------------------
   HELPERS
------------------------------------------------- */
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
