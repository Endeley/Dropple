'use client';

import { useEffect, useRef, useState } from 'react';
import { MODE_CONFIG } from './modeConfig';
import { useCanvasStore } from './context/CanvasStore';
import { useHistoryStatus } from './history/useHistoryStatus';

const MIN_SCALE = 0.25;
const MAX_SCALE = 4;
const SCALE_INCREMENT = 0.1;
const DEFAULT_POSITION = Object.freeze({ x: 0, y: 0 });
const NOOP = () => {};

const clampScale = (value) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));

export default function CanvasControls() {
    const mode = useCanvasStore((state) => state.mode);
    const frames = useCanvasStore((state) => state.frames);
    const selectedFrameId = useCanvasStore((state) => state.selectedFrameId);
    const scale = useCanvasStore((state) => state.scale ?? 1);
    const position = useCanvasStore((state) => state.position) ?? DEFAULT_POSITION;
    const prototypeMode = useCanvasStore((state) => state.prototypeMode);
    const activeOverlay = useCanvasStore((state) => state.activeToolOverlay);
    const gridVisible = useCanvasStore((state) => state.gridVisible);
    const setScale = useCanvasStore((state) => state.setScale) ?? NOOP;
    const setPosition = useCanvasStore((state) => state.setPosition) ?? NOOP;
    const setPrototypeMode = useCanvasStore((state) => state.setPrototypeMode) ?? NOOP;
    const setActivePrototypeFrameId = useCanvasStore((state) => state.setActivePrototypeFrameId) ?? NOOP;
    const setActiveToolOverlay = useCanvasStore((state) => state.setActiveToolOverlay) ?? NOOP;
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
        setActiveToolOverlay(activeOverlay === id ? null : id);
    };

    const formattedScale = Math.round(clampScale(scale) * 100);

    return (
        <footer className='pointer-events-auto fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center text-[var(--mode-text)]'>
            <div className='relative'>
                <div
                    className='flex items-center gap-4 rounded-2xl border px-5 py-3 text-xs shadow-lg shadow-[var(--mode-border)] backdrop-blur'
                    style={{ background: 'var(--mode-toolbar-bg)', borderColor: 'var(--mode-border)', color: 'var(--mode-text-muted)' }}>
                    <div className='flex items-center gap-2'>
                        <button
                            type='button'
                            onClick={handleUndo}
                            disabled={!canUndo}
                            title='Undo (⌘Z)'
                            className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-colors ${
                                canUndo
                                    ? 'hover:bg-[var(--mode-accent-soft)]'
                                    : 'cursor-not-allowed opacity-60'
                            }`}
                            style={{ color: canUndo ? 'var(--mode-text)' : 'var(--mode-text-muted)' }}>
                            ↩️ Undo
                        </button>
                        <button
                            type='button'
                            onClick={handleRedo}
                            disabled={!canRedo}
                            title='Redo (⇧⌘Z)'
                            className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-colors ${
                                canRedo
                                    ? 'hover:bg-[var(--mode-accent-soft)]'
                                    : 'cursor-not-allowed opacity-60'
                            }`}
                            style={{ color: canRedo ? 'var(--mode-text)' : 'var(--mode-text-muted)' }}>
                            Redo ↪️
                        </button>
                    </div>
                    <div
                        className='flex items-center gap-3 rounded-xl border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em]'
                        style={{ borderColor: 'var(--mode-border)', background: 'var(--mode-panel-bg)', color: 'var(--mode-text-muted)' }}>
                        <span>Zoom {formattedScale}%</span>
                        <div className='flex items-center gap-2'>
                            <button
                                type='button'
                                onClick={() => handleZoomIncrement(-1)}
                                className='grid h-6 w-6 place-items-center rounded-md border transition-colors hover:bg-[var(--mode-accent-soft)]'
                                style={{ borderColor: 'var(--mode-border)', color: 'var(--mode-text)' }}
                                aria-label='Zoom out'>
                                −
                            </button>
                            <input
                                type='range'
                                min={MIN_SCALE}
                                max={MAX_SCALE}
                                step={0.05}
                                value={clampScale(scale)}
                                onChange={handleZoomChange}
                                className='h-1 w-24 cursor-pointer accent-[var(--mode-accent-hex)]'
                                aria-label='Zoom level'
                            />
                            <button
                                type='button'
                                onClick={() => handleZoomIncrement(1)}
                                className='grid h-6 w-6 place-items-center rounded-md border transition-colors hover:bg-[var(--mode-accent-soft)]'
                                style={{ borderColor: 'var(--mode-border)', color: 'var(--mode-text)' }}
                                aria-label='Zoom in'>
                                +
                            </button>
                        </div>
                        <span>Pan {Math.round(position.x)}×{Math.round(position.y)}</span>
                        <button
                            type='button'
                            onClick={handleReset}
                            className='rounded-lg border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-[var(--mode-accent-soft)]'
                            style={{ borderColor: 'var(--mode-border)', color: 'var(--mode-text)' }}>
                            Reset
                        </button>
                        <button
                            type='button'
                            onClick={handlePrototypeToggle}
                            className='rounded-lg border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-[var(--mode-accent-soft)]'
                            style={{
                                borderColor: prototypeMode ? 'var(--mode-accent)' : 'var(--mode-border)',
                                color: prototypeMode ? 'var(--mode-text)' : 'var(--mode-text-muted)',
                                background: prototypeMode ? 'var(--mode-accent-soft)' : 'transparent',
                            }}>
                            {prototypeMode ? 'Exit Prototype' : 'Prototype'}
                        </button>
                    </div>
                    <nav className='flex items-center gap-2'>
                    {actions.map((action) => {
                        const id = action.id ?? action;
                        const label = action.label ?? action;
                        const isActive =
                            id === 'grid'
                                ? gridVisible || activeOverlay === 'grid'
                                : id === 'snapping'
                                    ? activeOverlay === 'snapping'
                                    : id === 'ai-layout'
                                        ? activeOverlay === 'ai-layout'
                                        : activeOverlay === id;
                        return (
                            <button
                                key={id}
                                type='button'
                                onClick={() => handleActionClick(id)}
                                className={`rounded-xl px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                                    isActive
                                        ? 'bg-[var(--mode-accent)] text-[var(--mode-text)] shadow-[0_0_0_1px_var(--mode-accent-soft)]'
                                        : 'text-[var(--mode-text-muted)] hover:bg-[var(--mode-accent-soft)] hover:text-[var(--mode-text)]'
                                }`}
                            >
                                {label}
                            </button>
                        );
                    })}
                    </nav>
                </div>
                {historyToast ? (
                    <div className='pointer-events-none absolute -top-12 left-1/2 min-w-[220px] -translate-x-1/2 rounded-lg border border-[var(--mode-border)] bg-[var(--mode-panel-bg)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--mode-text)] shadow-lg shadow-[var(--mode-border)] transition-opacity'>
                        {historyToast.message}
                    </div>
                ) : null}
            </div>
        </footer>
    );
}
