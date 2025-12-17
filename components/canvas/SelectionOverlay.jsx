'use client';

import { useMemo } from 'react';
import { useSelectionStore } from '@/zustand/selectionStore';
import { getSelectedBounds } from '@/lib/canvas-core/selection';

import TransformControls from './TransformControls';

/**
 * SelectionOverlay
 * ----------------
 * Pure selection UI.
 * - Computes selection bounds
 * - Renders transform controls
 * - NO constraint visualization
 */

export default function SelectionOverlay({ nodeMap = {}, onResizeStart, onRotateStart }) {
    const selectedIds = useSelectionStore((s) => s.selectedIds);

    const bounds = useMemo(() => {
        if (!selectedIds.length) return null;
        return getSelectedBounds(selectedIds, nodeMap);
    }, [selectedIds, nodeMap]);

    if (!bounds) return null;

    return (
        <div className='absolute inset-0 pointer-events-none z-50'>
            {/* Resize + rotate controls */}
            <TransformControls bounds={bounds} onResizeStart={onResizeStart} onRotateStart={onRotateStart} />
        </div>
    );
}
