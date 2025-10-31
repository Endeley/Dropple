'use client';

import { useMemo, useState } from 'react';
import { useCanvasStore } from '../../context/CanvasStore';

const clampInt = (value, min, max) => {
    const numeric = Math.round(Number(value));
    if (Number.isNaN(numeric)) return min;
    return Math.max(min, Math.min(max, numeric));
};

const summariseElements = (elements = []) => {
    const counts = elements.reduce((acc, element) => {
        const key = element.type ?? 'element';
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
    }, {});
    return Object.entries(counts)
        .map(([key, count]) => `${count}× ${key}`)
        .join(', ');
};

export default function AiBalanceOverlay() {
    const frames = useCanvasStore((state) => state.frames);
    const selectedFrameId = useCanvasStore((state) => state.selectedFrameId);
    const previewAutoLayoutSuggestion = useCanvasStore((state) => state.previewAutoLayoutSuggestion);
    const applyAutoLayoutPreview = useCanvasStore((state) => state.applyAutoLayoutPreview);
    const clearAutoLayoutPreview = useCanvasStore((state) => state.clearAutoLayoutPreview);
    const setActiveToolOverlay = useCanvasStore((state) => state.setActiveToolOverlay);

    const activeFrame = useMemo(
        () => frames.find((frame) => frame.id === selectedFrameId) ?? null,
        [frames, selectedFrameId],
    );

    const [columns, setColumns] = useState(4);
    const [rows, setRows] = useState(3);
    const [suggestion, setSuggestion] = useState('');
    const [loadingSuggestion, setLoadingSuggestion] = useState(false);
    const [error, setError] = useState(null);

    const canOperate = Boolean(activeFrame);

    const handlePreview = () => {
        if (!canOperate) return;
        previewAutoLayoutSuggestion({ frameId: activeFrame.id, columns, rows, duration: 0 });
    };

    const handleApply = () => {
        if (!canOperate) return;
        applyAutoLayoutPreview({ frameId: activeFrame.id, columns, rows });
        setActiveToolOverlay(null);
    };

    const handleReset = () => {
        clearAutoLayoutPreview();
        setSuggestion('');
        setError(null);
    };

    const requestSuggestion = async () => {
        if (!canOperate) return;
        try {
            setLoadingSuggestion(true);
            setError(null);
            const summary = summariseElements(activeFrame.elements ?? []);
            const layoutContext = `Frame ${activeFrame.name ?? activeFrame.id} size ${Math.round(activeFrame.width ?? 0)}x${Math.round(activeFrame.height ?? 0)}. Contains ${activeFrame.elements?.length ?? 0} elements (${summary}). Target layout: ${columns} columns x ${rows} rows for a marketing graphic.`;
            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'layoutSuggestion', layoutContext }),
            });
            if (!response.ok) {
                throw new Error('Unable to fetch AI suggestion');
            }
            const data = await response.json();
            setSuggestion(data.suggestions ?? 'AI did not return a suggestion.');
        } catch (err) {
            setError(err.message ?? 'Unknown error');
        } finally {
            setLoadingSuggestion(false);
        }
    };

    return (
        <div className='rounded-2xl border border-[var(--mode-border)] bg-[var(--mode-panel-bg)] p-5 shadow-2xl shadow-[rgba(15,23,42,0.35)]'>
            <div className='flex items-start justify-between gap-3'>
                <div>
                    <p className='text-xs font-semibold uppercase tracking-[0.3em] text-[var(--mode-text-muted)]'>AI Smart Balance</p>
                    <p className='mt-1 text-sm text-[var(--mode-text-muted)]'>Let Dropple distribute elements into a balanced grid, or ask for AI layout suggestions before applying.</p>
                </div>
                <button
                    type='button'
                    onClick={() => setActiveToolOverlay(null)}
                    className='rounded-full border border-[var(--mode-border)] px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-[var(--mode-text-muted)] hover:border-[var(--mode-accent)] hover:text-[var(--mode-text)]'
                >
                    Close
                </button>
            </div>

            {!canOperate ? (
                <p className='mt-5 rounded-xl border border-dashed border-[var(--mode-border)] bg-[var(--mode-sidebar-bg)]/40 p-4 text-[12px] text-[var(--mode-text-muted)]'>Select a frame to preview AI balance settings.</p>
            ) : (
                <>
                    <div className='mt-5 grid grid-cols-2 gap-3'>
                        <label className='flex flex-col gap-2 rounded-xl border border-[var(--mode-border)] bg-[var(--mode-sidebar-bg)]/40 p-3 text-xs uppercase tracking-[0.25em] text-[var(--mode-text-muted)]'>
                            Columns
                            <input
                                type='number'
                                min={1}
                                max={8}
                                step={1}
                                value={columns}
                                onChange={(event) => setColumns(clampInt(event.target.value, 1, 8))}
                                className='w-full rounded-lg border border-[var(--mode-border)] bg-[var(--mode-panel-bg)] px-3 py-2 text-sm text-[var(--mode-text)] focus:border-[var(--mode-accent)] focus:outline-none'
                            />
                        </label>
                        <label className='flex flex-col gap-2 rounded-xl border border-[var(--mode-border)] bg-[var(--mode-sidebar-bg)]/40 p-3 text-xs uppercase tracking-[0.25em] text-[var(--mode-text-muted)]'>
                            Rows
                            <input
                                type='number'
                                min={1}
                                max={8}
                                step={1}
                                value={rows}
                                onChange={(event) => setRows(clampInt(event.target.value, 1, 8))}
                                className='w-full rounded-lg border border-[var(--mode-border)] bg-[var(--mode-panel-bg)] px-3 py-2 text-sm text-[var(--mode-text)] focus:border-[var(--mode-accent)] focus:outline-none'
                            />
                        </label>
                    </div>

                    <div className='mt-4 flex flex-wrap gap-2'>
                        <button
                            type='button'
                            onClick={handlePreview}
                            disabled={!canOperate}
                            className='rounded-lg border border-[var(--mode-border)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--mode-text)] transition-colors hover:border-[var(--mode-accent)] disabled:cursor-not-allowed disabled:opacity-60'
                        >
                            Preview Guides
                        </button>
                        <button
                            type='button'
                            onClick={handleApply}
                            disabled={!canOperate}
                            className='rounded-lg border border-[var(--mode-accent)] bg-[var(--mode-accent-soft)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--mode-text)] transition-colors disabled:cursor-not-allowed disabled:opacity-60'
                        >
                            Apply Balance
                        </button>
                        <button
                            type='button'
                            onClick={handleReset}
                            className='rounded-lg border border-[var(--mode-border)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--mode-text-muted)] transition-colors hover:border-[var(--mode-accent)] hover:text-[var(--mode-text)]'
                        >
                            Clear Preview
                        </button>
                        <button
                            type='button'
                            onClick={requestSuggestion}
                            disabled={!canOperate || loadingSuggestion}
                            className='rounded-lg border border-[var(--mode-border)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--mode-text)] transition-colors hover:border-[var(--mode-accent)] disabled:cursor-not-allowed disabled:opacity-60'
                        >
                            {loadingSuggestion ? 'Contacting AI…' : 'AI Suggestion'}
                        </button>
                    </div>

                    {(suggestion || error) && (
                        <div className='mt-4 rounded-xl border border-[var(--mode-border)] bg-[var(--mode-sidebar-bg)]/40 p-4 text-sm text-[var(--mode-text)]'>
                            {error ? (
                                <p className='text-[var(--mode-text-muted)]'>⚠️ {error}</p>
                            ) : (
                                <pre className='whitespace-pre-wrap text-[var(--mode-text)]'>{suggestion}</pre>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
