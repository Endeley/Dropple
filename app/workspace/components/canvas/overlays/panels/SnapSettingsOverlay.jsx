'use client';

import { useMemo } from 'react';
import { useCanvasStore } from '../../context/CanvasStore';

const Toggle = ({ active, onClick, label, description }) => (
    <button
        type='button'
        onClick={onClick}
        className={`w-full rounded-xl border px-3 py-2 text-left transition-colors ${
            active
                ? 'border-[var(--mode-accent)] bg-[var(--mode-accent-soft)] text-[var(--mode-text)]'
                : 'border-[var(--mode-border)] text-[var(--mode-text-muted)] hover:border-[var(--mode-accent)] hover:text-[var(--mode-text)]'
        }`}
    >
        <p className='text-xs font-semibold uppercase tracking-[0.28em]'>{label}</p>
        {description ? <p className='mt-1 text-[11px] text-[var(--mode-text-muted)]'>{description}</p> : null}
    </button>
);

export default function SnapSettingsOverlay() {
    const snapToGrid = useCanvasStore((state) => state.snapToGrid);
    const toggleSnapToGrid = useCanvasStore((state) => state.toggleSnapToGrid);
    const snapToCenters = useCanvasStore((state) => state.snapToCenters);
    const toggleSnapToCenters = useCanvasStore((state) => state.toggleSnapToCenters);
    const snapToGuides = useCanvasStore((state) => state.snapToGuides);
    const toggleSnapToGuides = useCanvasStore((state) => state.toggleSnapToGuides);
    const setActiveToolOverlay = useCanvasStore((state) => state.setActiveToolOverlay);

    const activeCount = useMemo(
        () => [snapToGrid, snapToCenters, snapToGuides].filter(Boolean).length,
        [snapToGrid, snapToCenters, snapToGuides],
    );

    return (
        <div className='rounded-2xl border border-[var(--mode-border)] bg-[var(--mode-panel-bg)] p-5 shadow-2xl shadow-[rgba(15,23,42,0.35)]'>
            <div className='flex items-start justify-between gap-3'>
                <div>
                    <p className='text-xs font-semibold uppercase tracking-[0.3em] text-[var(--mode-text-muted)]'>Snapping Controls</p>
                    <p className='mt-1 text-sm text-[var(--mode-text-muted)]'>Decide how shapes, paths, and text blocks magnetise to the grid, guides, and frame centers.</p>
                </div>
                <button
                    type='button'
                    onClick={() => setActiveToolOverlay(null)}
                    className='rounded-full border border-[var(--mode-border)] px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-[var(--mode-text-muted)] hover:border-[var(--mode-accent)] hover:text-[var(--mode-text)]'
                >
                    Close
                </button>
            </div>

            <p className='mt-4 text-[11px] uppercase tracking-[0.28em] text-[var(--mode-text-muted)]'>Active: {activeCount}/3</p>

            <div className='mt-4 space-y-3'>
                <Toggle
                    active={snapToGrid}
                    onClick={toggleSnapToGrid}
                    label='Snap to Grid'
                    description='Use the visible grid spacing for precise alignment and even padding.'
                />
                <Toggle
                    active={snapToCenters}
                    onClick={toggleSnapToCenters}
                    label='Snap to Frame Center'
                    description='Magnetise elements to the horizontal and vertical midlines of the active artboard.'
                />
                <Toggle
                    active={snapToGuides}
                    onClick={toggleSnapToGuides}
                    label='Show Smart Guides'
                    description='Preview suggested AI guide rails when balancing layouts and running auto-layout.'
                />
            </div>
        </div>
    );
}
