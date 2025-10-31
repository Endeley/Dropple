'use client';

import { useMemo } from 'react';
import { useCanvasStore } from '../../context/CanvasStore';

const Label = ({ title, description }) => (
    <div className='space-y-0.5'>
        <p className='text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--mode-text-muted)]'>{title}</p>
        {description ? <p className='text-[11px] text-[color:var(--mode-text-muted)]'>{description}</p> : null}
    </div>
);

export default function GridSettingsOverlay() {
    const gridVisible = useCanvasStore((state) => state.gridVisible);
    const toggleGrid = useCanvasStore((state) => state.toggleGrid);
    const gridSize = useCanvasStore((state) => state.gridSize);
    const setGridSize = useCanvasStore((state) => state.setGridSize);
    const rulersVisible = useCanvasStore((state) => state.rulersVisible);
    const toggleRulers = useCanvasStore((state) => state.toggleRulers);
    const setActiveToolOverlay = useCanvasStore((state) => state.setActiveToolOverlay);

    const scaleLabel = useMemo(() => `${gridSize}px`, [gridSize]);

    const handleGridSizeInput = (value) => {
        const numeric = Number(value);
        if (Number.isFinite(numeric)) {
            setGridSize(Math.max(4, Math.round(numeric)));
        }
    };

    return (
        <div className='rounded-2xl border border-[var(--mode-border)] bg-[var(--mode-panel-bg)] p-5 shadow-2xl shadow-[rgba(15,23,42,0.35)]'>
            <div className='flex items-start justify-between gap-3'>
                <div>
                    <p className='text-xs font-semibold uppercase tracking-[0.3em] text-[var(--mode-text-muted)]'>Canvas Grid &amp; Rulers</p>
                    <p className='mt-1 text-sm text-[var(--mode-text-muted)]'>Control the Fabric canvas guides, tile spacing, and on-screen rulers.</p>
                </div>
                <button
                    type='button'
                    onClick={() => setActiveToolOverlay(null)}
                    className='rounded-full border border-[var(--mode-border)] px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-[var(--mode-text-muted)] hover:border-[var(--mode-accent)] hover:text-[var(--mode-text)]'
                >
                    Close
                </button>
            </div>

            <div className='mt-5 space-y-5'>
                <section className='rounded-xl border border-[var(--mode-border)] bg-[var(--mode-sidebar-bg)]/40 p-4'>
                    <div className='flex items-center justify-between gap-3'>
                        <Label title='Grid Overlay' description='Toggle snap grid visibility on the artboard.' />
                        <button
                            type='button'
                            onClick={toggleGrid}
                            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] transition-colors ${
                                gridVisible
                                    ? 'border border-[var(--mode-accent)] bg-[var(--mode-accent-soft)] text-[var(--mode-text)]'
                                    : 'border border-[var(--mode-border)] text-[var(--mode-text-muted)] hover:border-[var(--mode-accent)] hover:text-[var(--mode-text)]'
                            }`}
                        >
                            {gridVisible ? 'Visible' : 'Hidden'}
                        </button>
                    </div>
                    <div className='mt-4 space-y-2'>
                        <div className='flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-[var(--mode-text-muted)]'>
                            <span>Grid Spacing</span>
                            <span className='text-[var(--mode-text)]'>{scaleLabel}</span>
                        </div>
                        <input
                            type='range'
                            min={4}
                            max={180}
                            step={4}
                            value={gridSize}
                            onChange={(event) => handleGridSizeInput(event.target.value)}
                            className='w-full accent-[var(--mode-accent)]'
                        />
                        <input
                            type='number'
                            value={gridSize}
                            onChange={(event) => handleGridSizeInput(event.target.value)}
                            className='w-full rounded-lg border border-[var(--mode-border)] bg-[var(--mode-panel-bg)] px-3 py-2 text-sm text-[var(--mode-text)] focus:border-[var(--mode-accent)] focus:outline-none'
                        />
                    </div>
                </section>

                <section className='rounded-xl border border-[var(--mode-border)] bg-[var(--mode-sidebar-bg)]/40 p-4'>
                    <div className='flex items-center justify-between gap-3'>
                        <Label title='Rulers' description='Show measurement rulers along the canvas edges.' />
                        <button
                            type='button'
                            onClick={toggleRulers}
                            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] transition-colors ${
                                rulersVisible
                                    ? 'border border-[var(--mode-accent)] bg-[var(--mode-accent-soft)] text-[var(--mode-text)]'
                                    : 'border border-[var(--mode-border)] text-[var(--mode-text-muted)] hover:border-[var(--mode-accent)] hover:text-[var(--mode-text)]'
                            }`}
                        >
                            {rulersVisible ? 'Enabled' : 'Disabled'}
                        </button>
                    </div>
                    <p className='mt-3 text-[11px] text-[color:var(--mode-text-muted)]'>Rulers follow your zoom level and pan offset, giving precise spacing feedback for poster layouts and print-ready artboards.</p>
                </section>
            </div>
        </div>
    );
}
