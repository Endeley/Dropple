'use client';

import { useEffect, useRef, useState } from 'react';
import { MODE_CONFIG } from './modeConfig';
import { useCanvasStore } from './context/CanvasStore';
import { useHistoryStatus } from './history/useHistoryStatus';

const MIN_SCALE = 0.25;
const MAX_SCALE = 4;
const SCALE_INCREMENT = 0.1;

const clampScale = (value) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));

export default function CanvasControls() {
    const mode = useCanvasStore((state) => state.mode);
    const frames = useCanvasStore((state) => state.frames);
    const selectedFrameId = useCanvasStore((state) => state.selectedFrameId);
    const scale = useCanvasStore((state) => state.scale);
    const position = useCanvasStore((state) => state.position);
    const prototypeMode = useCanvasStore((state) => state.prototypeMode);
    const activeOverlay = useCanvasStore((state) => state.activeToolOverlay);
    const gridVisible = useCanvasStore((state) => state.gridVisible);
    const setScale = useCanvasStore((state) => state.setScale);
    const setPosition = useCanvasStore((state) => state.setPosition);
    const setPrototypeMode = useCanvasStore((state) => state.setPrototypeMode);
    const setActivePrototypeFrameId = useCanvasStore((state) => state.setActivePrototypeFrameId);
    const setActiveToolOverlay = useCanvasStore((state) => state.setActiveToolOverlay);
    const toggleGrid = useCanvasStore((state) => state.toggleGrid);
    const undoCanvas = useCanvasStore((state) => state.undoCanvas);
    const redoCanvas = useCanvasStore((state) => state.redoCanvas);
    const { canUndo, canRedo } = useHistoryStatus();
    const [historyToast, setHistoryToast] = useState(null);
    const toastTimeoutRef = useRef(null);

    const modeConfig = MODE_CONFIG[mode] ?? MODE_CONFIG.design;
    const actions = modeConfig.bottomActions ?? [];

    const handleReset = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    const handlePrototypeToggle = () => {
        if (!prototypeMode) {
            const frameId = selectedFrameId ?? frames[0]?.id ?? null;
            if (frameId) {
                setActivePrototypeFrameId(frameId);
            }
        }
        setPrototypeMode(!prototypeMode);
    };

    const handleZoomIncrement = (direction) => {
        setScale((prev) => clampScale(prev + direction * SCALE_INCREMENT));
    };

    const handleZoomChange = (event) => {
        const next = clampScale(Number.parseFloat(event.target.value));
        setScale(next);
    };

    const formatHistoryLabel = (label) => {
        if (!label) return 'last change';
        if (label.toLowerCase() === 'change') return 'last change';
        return label;
    };

    const showHistoryToast = (verb, label) => {
        const message = `${verb} ${formatHistoryLabel(label)}`;
        setHistoryToast({ id: Date.now(), message });
        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
        }
        toastTimeoutRef.current = setTimeout(() => setHistoryToast(null), 2200);
    };

    const handleUndo = () => {
        const label = undoCanvas();
        if (!label) return;
        showHistoryToast('Undid', label);
    };

    const handleRedo = () => {
        const label = redoCanvas();
        if (!label) return;
        showHistoryToast('Redid', label);
    };

    useEffect(
        () => () => {
            if (toastTimeoutRef.current) {
                clearTimeout(toastTimeoutRef.current);
            }
        },
        [],
    );

    const handleActionClick = (id) => {
        if (id === 'grid') {
            toggleGrid();
            return;
        }
        setActiveToolOverlay(activeOverlay === id ? null : id);
    };

    const formattedScale = Math.round(clampScale(scale) * 100);

    return (
        <footer className='pointer-events-auto fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center'>
            <div className='relative'>
                <div className='flex items-center gap-4 rounded-2xl border border-[rgba(148,163,184,0.25)] bg-[rgba(15,23,42,0.85)] px-5 py-3 text-xs text-[rgba(226,232,240,0.78)] shadow-lg shadow-[rgba(15,23,42,0.25)] backdrop-blur'>
                    <div className='flex items-center gap-2'>
                    <button
                        type='button'
                        onClick={handleUndo}
                        disabled={!canUndo}
                        title='Undo (⌘Z)'
                        className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-colors ${
                            canUndo
                                ? 'text-[rgba(226,232,240,0.82)] hover:bg-[rgba(59,130,246,0.18)] hover:text-white'
                                : 'text-[rgba(148,163,184,0.5)] cursor-not-allowed'
                        }`}
                    >
                        ↩️ Undo
                    </button>
                    <button
                        type='button'
                        onClick={handleRedo}
                        disabled={!canRedo}
                        title='Redo (⇧⌘Z)'
                        className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-colors ${
                            canRedo
                                ? 'text-[rgba(226,232,240,0.82)] hover:bg-[rgba(59,130,246,0.18)] hover:text-white'
                                : 'text-[rgba(148,163,184,0.5)] cursor-not-allowed'
                        }`}
                    >
                        Redo ↪️
                    </button>
                </div>
                    <div className='flex items-center gap-3 rounded-xl border border-[rgba(148,163,184,0.18)] bg-[rgba(15,23,42,0.65)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgba(148,163,184,0.75)]'>
                    <span>Zoom {formattedScale}%</span>
                    <div className='flex items-center gap-2'>
                        <button
                            type='button'
                            onClick={() => handleZoomIncrement(-1)}
                            className='grid h-6 w-6 place-items-center rounded-md border border-[rgba(148,163,184,0.3)] text-[rgba(226,232,240,0.8)] hover:border-[rgba(236,233,254,0.6)] hover:text-white'
                            aria-label='Zoom out'
                        >
                            −
                        </button>
                        <input
                            type='range'
                            min={MIN_SCALE}
                            max={MAX_SCALE}
                            step={0.05}
                            value={clampScale(scale)}
                            onChange={handleZoomChange}
                            className='h-1 w-24 cursor-pointer accent-[rgba(139,92,246,0.8)]'
                            aria-label='Zoom level'
                        />
                        <button
                            type='button'
                            onClick={() => handleZoomIncrement(1)}
                            className='grid h-6 w-6 place-items-center rounded-md border border-[rgba(148,163,184,0.3)] text-[rgba(226,232,240,0.8)] hover:border-[rgba(236,233,254,0.6)] hover:text-white'
                            aria-label='Zoom in'
                        >
                            +
                        </button>
                    </div>
                    <span>Pan {Math.round(position.x)}×{Math.round(position.y)}</span>
                    <button
                        type='button'
                        onClick={handleReset}
                        className='rounded-lg border border-[rgba(139,92,246,0.45)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[rgba(236,233,254,0.88)] transition-colors hover:border-[rgba(236,233,254,0.85)]'
                    >
                        Reset
                    </button>
                    <button
                        type='button'
                        onClick={handlePrototypeToggle}
                        className={`rounded-lg border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors ${
                            prototypeMode
                                ? 'border-[rgba(59,130,246,0.55)] bg-[rgba(59,130,246,0.18)] text-[rgba(191,219,254,0.95)] hover:border-[rgba(191,219,254,0.85)]'
                                : 'border-[rgba(148,163,184,0.3)] text-[rgba(226,232,240,0.78)] hover:border-[rgba(236,233,254,0.65)] hover:text-white'
                        }`}
                    >
                        {prototypeMode ? 'Exit Prototype' : 'Prototype'}
                    </button>
                </div>
                    <nav className='flex items-center gap-2'>
                    {actions.map((action) => {
                        const id = action.id ?? action;
                        const label = action.label ?? action;
                        const isActive = id === 'grid' ? gridVisible : activeOverlay === id;
                        return (
                            <button
                                key={id}
                                type='button'
                                onClick={() => handleActionClick(id)}
                                className={`rounded-xl px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                                    isActive
                                        ? 'bg-[var(--color-primary)] text-white shadow-[0_0_0_1px_rgba(236,233,254,0.35)]'
                                        : 'text-[rgba(226,232,240,0.78)] hover:bg-[rgba(59,130,246,0.18)] hover:text-white'
                                }`}
                            >
                                {label}
                            </button>
                        );
                    })}
                    </nav>
                </div>
                {historyToast ? (
                    <div className='pointer-events-none absolute -top-12 left-1/2 min-w-[220px] -translate-x-1/2 rounded-lg border border-[rgba(148,163,184,0.35)] bg-[rgba(15,23,42,0.9)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgba(236,233,254,0.88)] shadow-lg shadow-[rgba(15,23,42,0.35)] transition-opacity'>
                        {historyToast.message}
                    </div>
                ) : null}
            </div>
        </footer>
    );
}
