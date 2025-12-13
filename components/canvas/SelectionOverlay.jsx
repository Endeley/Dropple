'use client';

import { useMemo } from 'react';
import TransformControls from './TransformControls';
import { getSelectedBounds } from '@/lib/canvas-core/selection';
import { useSelectionStore } from '@/zustand/selectionStore';
import ConstraintPins from './ConstraintPins';
export default function SelectionOverlay({ nodeMap = {}, onResizeStart, onRotateStart }) {
    const selectedIds = useSelectionStore((s) => s.selectedIds);

    const bounds = useMemo(() => {
        return getSelectedBounds(selectedIds, nodeMap);
    }, [selectedIds, nodeMap]);

    if (!bounds) return null;

    return (
        <div className='absolute inset-0 pointer-events-none z-50'>
            <TransformControls bounds={bounds} onResizeStart={onResizeStart} onRotateStart={onRotateStart} />
            <ConstraintPins bounds={bounds} />
        </div>
    );
}
