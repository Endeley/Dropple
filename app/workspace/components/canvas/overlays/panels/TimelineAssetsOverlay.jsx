'use client';

import clsx from 'clsx';
import { useCallback, useEffect, useRef, useState } from 'react';
import { nanoid } from 'nanoid';
import { useCanvasStore } from '../../context/CanvasStore';

const ASSET_TYPES = [
    { id: 'clip', label: 'Clip' },
    { id: 'audio', label: 'Audio' },
    { id: 'overlay', label: 'Overlay' },
];

export default function TimelineAssetsOverlay() {
    const [label, setLabel] = useState('New clip');
    const [type, setType] = useState('clip');
    const [duration, setDuration] = useState(5);
    const [offset, setOffset] = useState(0);
    const [thumbnail, setThumbnail] = useState(null);
    const [waveformData, setWaveformData] = useState(null);
    const [toasts, setToasts] = useState([]);
    const [toastHistory, setToastHistory] = useState([]);
    const fileInputRef = useRef(null);
    const waveformInputRef = useRef(null);

    const selectedFrameId = useCanvasStore((state) => state.selectedFrameId);
    const frames = useCanvasStore((state) => state.frames);
    const timelineAssets = useCanvasStore((state) => state.timelineAssets);
    const addTimelineAsset = useCanvasStore((state) => state.addTimelineAsset);
    const removeTimelineAsset = useCanvasStore((state) => state.removeTimelineAsset);
    const updateFrame = useCanvasStore((state) => state.updateFrame);
    const setActiveToolOverlay = useCanvasStore((state) => state.setActiveToolOverlay);
    const timelineActions = useCanvasStore((state) => state.timelineActions);
    const undoTimelineAction = useCanvasStore((state) => state.undoTimelineAction);
    const clearTimelineHistoryStore = useCanvasStore((state) => state.clearTimelineHistory);

    const activeFrame = frames.find((frame) => frame.id === selectedFrameId) ?? null;
    const frameAssets = timelineAssets.filter((asset) => asset.frameId === selectedFrameId);
    const [timelineDurationInput, setTimelineDurationInput] = useState(activeFrame?.timelineDuration ?? 20);

    useEffect(() => {
        setTimelineDurationInput(activeFrame?.timelineDuration ?? 20);
    }, [activeFrame?.id, activeFrame?.timelineDuration]);

    const addToast = useCallback((tone, message) => {
        const entry = {
            id: nanoid(6),
            tone,
            message,
            timestamp: new Date().toISOString(),
        };
        setToasts((prev) => [...prev, entry]);
        setToastHistory((prev) => [entry, ...prev].slice(0, 10));
        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== entry.id));
        }, 3500);
    }, []);

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!activeFrame || !label.trim()) return;
        addTimelineAsset({
            frameId: activeFrame.id,
            label: label.trim(),
            type,
            duration: Number(duration) || 5,
            offset: Number(offset) || 0,
            thumbnailUrl: thumbnail?.data ?? null,
            waveform: waveformData,
            historyLabel: `Timeline: Add ${type} "${label.trim()}"`,
            source: 'timeline',
        });
        setLabel('New clip');
        setOffset(0);
        setThumbnail(null);
        setWaveformData(null);
        addToast('success', `Added ${type} "${label.trim()}"`);
    };

    return (
        <div className='rounded-2xl border border-[rgba(148,163,184,0.25)] bg-[rgba(15,23,42,0.92)] p-4 text-sm text-[rgba(226,232,240,0.82)] shadow-2xl backdrop-blur-lg'>
            <header className='mb-3 flex items-center justify-between'>
                <div>
                    <p className='text-sm font-semibold text-white'>Timeline Assets</p>
                    <p className='text-xs text-[rgba(148,163,184,0.7)]'>Track clips and overlays assigned to the current frame.</p>
                </div>
                <button
                    type='button'
                    onClick={() => setActiveToolOverlay(null)}
                    className='rounded-lg border border-[rgba(148,163,184,0.25)] px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-[rgba(226,232,240,0.7)] transition-colors hover:border-[rgba(226,232,240,0.7)] hover:text-white'
                >
                    Close
                </button>
            </header>

            {!activeFrame ? (
                <p className='text-xs text-[rgba(148,163,184,0.7)]'>Select a frame to manage timeline assets.</p>
            ) : (
                <>
                    <div className='mb-3 space-y-2 rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgba(30,41,59,0.65)] p-3'>
                        <p className='text-[11px] font-semibold uppercase tracking-[0.25em] text-[rgba(148,163,184,0.7)]'>Timeline duration</p>
                        <div className='flex items-center gap-2'>
                            <input
                                type='number'
                                min={1}
                                value={timelineDurationInput}
                                onChange={(event) => setTimelineDurationInput(event.target.value)}
                                onBlur={() => {
                                    if (!activeFrame) return;
                                    const value = Number(timelineDurationInput) || 1;
                                    setTimelineDurationInput(value);
                                    updateFrame(
                                        activeFrame.id,
                                        { timelineDuration: value },
                                        { historyLabel: 'Timeline: Set duration', source: 'timeline' },
                                    );
                                }}
                                className='w-24 rounded-lg border border-[rgba(148,163,184,0.25)] bg-[rgba(15,23,42,0.7)] px-3 py-2 text-sm text-[rgba(236,233,254,0.9)]'
                            />
                            <span className='text-[11px] uppercase tracking-[0.25em] text-[rgba(148,163,184,0.6)]'>seconds</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className='space-y-2 rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgba(30,41,59,0.65)] p-3'>
                        <p className='text-[11px] font-semibold uppercase tracking-[0.25em] text-[rgba(148,163,184,0.7)]'>Add asset</p>
                        <input
                            type='text'
                            value={label}
                            onChange={(event) => setLabel(event.target.value)}
                            placeholder='Asset label'
                            className='w-full rounded-lg border border-[rgba(148,163,184,0.25)] bg-[rgba(15,23,42,0.7)] px-3 py-2 text-sm text-[rgba(236,233,254,0.9)] focus:border-[rgba(139,92,246,0.6)] focus:outline-none'
                        />
                        <div className='flex gap-2'>
                            <select
                                value={type}
                                onChange={(event) => setType(event.target.value)}
                                className='flex-1 rounded-lg border border-[rgba(148,163,184,0.25)] bg-[rgba(15,23,42,0.7)] px-3 py-2 text-sm text-[rgba(236,233,254,0.9)]'
                            >
                                {ASSET_TYPES.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <input
                                type='number'
                                min={1}
                                value={duration}
                                onChange={(event) => setDuration(event.target.value)}
                                className='w-20 rounded-lg border border-[rgba(148,163,184,0.25)] bg-[rgba(15,23,42,0.7)] px-3 py-2 text-sm text-[rgba(236,233,254,0.9)]'
                            />
                        </div>
                        <div className='flex gap-2'>
                            <div className='flex items-center gap-2 rounded-lg border border-[rgba(148,163,184,0.25)] bg-[rgba(15,23,42,0.7)] px-3 py-2 text-sm'>
                                <span className='text-[rgba(148,163,184,0.7)]'>Offset</span>
                                <input
                                    type='number'
                                    min={0}
                                    value={offset}
                                    onChange={(event) => setOffset(event.target.value)}
                                    className='w-20 rounded-md border border-[rgba(148,163,184,0.25)] bg-[rgba(15,23,42,0.7)] px-2 py-1 text-[rgba(236,233,254,0.9)]'
                                />
                                <span className='text-[10px] uppercase tracking-[0.2em] text-[rgba(148,163,184,0.65)]'>s</span>
                            </div>
                            <button
                                type='button'
                                onClick={() => fileInputRef.current?.click()}
                                className='flex-1 rounded-lg border border-[rgba(148,163,184,0.25)] bg-[rgba(15,23,42,0.7)] px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-[rgba(236,233,254,0.9)] hover:border-[rgba(236,233,254,0.8)]'
                            >
                                {thumbnail ? `Replace thumbnail${thumbnail.name ? ` (${thumbnail.name})` : ''}` : 'Upload thumbnail'}
                            </button>
                        </div>
                        {type === 'audio' ? (
                            <textarea
                                ref={waveformInputRef}
                                value={Array.isArray(waveformData) ? waveformData.join(', ') : ''}
                                onChange={(event) =>
                                    setWaveformData(
                                        event.target.value
                                            .split(',')
                                            .map((value) => Number(value.trim()))
                                            .filter((value) => Number.isFinite(value)),
                                    )
                                }
                                placeholder='Waveform data (comma separated values)'
                                className='h-20 w-full resize-y rounded-lg border border-[rgba(148,163,184,0.25)] bg-[rgba(15,23,42,0.7)] px-3 py-2 text-sm text-[rgba(236,233,254,0.9)] placeholder:text-[rgba(148,163,184,0.6)] focus:border-[rgba(139,92,246,0.6)] focus:outline-none'
                            />
                        ) : null}
                        {type === 'audio' ? (
                            <label className='flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[rgba(148,163,184,0.3)] bg-[rgba(15,23,42,0.7)] px-3 py-3 text-[11px] uppercase tracking-[0.2em] text-[rgba(236,233,254,0.9)] hover:border-[rgba(236,233,254,0.8)]'>
                                Import waveform JSON
                                <input
                                    type='file'
                                    accept='application/json'
                                    className='hidden'
                                    onChange={(event) => {
                                        const file = event.target.files?.[0];
                                        if (!file) return;
                                        const reader = new FileReader();
                                        reader.onload = () => {
                                            try {
                                                const parsed = JSON.parse(reader.result);
                                                if (Array.isArray(parsed)) {
                                                    const normalized = parsed.filter((value) => Number.isFinite(value));
                                                    setWaveformData(normalized);
                                                    addToast('success', `Waveform "${file.name}" imported`);
                                                }
                                            } catch (error) {
                                                console.error('Invalid waveform JSON', error);
                                                addToast('error', `Waveform "${file.name}" invalid JSON`);
                                            }
                                        };
                                        reader.readAsText(file);
                                    }}
                                />
                            </label>
                        ) : null}
                        {thumbnail ? (
                            <div className='rounded-lg border border-[rgba(148,163,184,0.2)] bg-[rgba(30,41,59,0.65)] p-2 text-xs text-[rgba(148,163,184,0.7)]'>
                                <span className='font-semibold text-white'>Thumbnail:</span> {thumbnail.name ?? 'Selected'}
                            </div>
                        ) : null}
                        <button
                            type='submit'
                            disabled={!label.trim()}
                            className={`w-full rounded-lg border px-3 py-2 text-[11px] uppercase tracking-[0.2em] transition-colors ${
                                label.trim()
                                    ? 'border-[rgba(139,92,246,0.55)] text-white hover:border-[rgba(236,233,254,0.85)]'
                                    : 'cursor-not-allowed border-[rgba(148,163,184,0.25)] text-[rgba(148,163,184,0.5)]'
                            }`}
                        >
                            Add asset
                        </button>
                    </form>

                    <div className='mt-3 space-y-2'>
                        {frameAssets.length === 0 ? (
                            <p className='text-[11px] uppercase tracking-[0.25em] text-[rgba(148,163,184,0.6)]'>No assets on this frame yet.</p>
                        ) : (
                            frameAssets.map((asset) => (
                                <div
                                    key={asset.id}
                                    className='flex items-center justify-between gap-3 rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgba(30,41,59,0.65)] px-3 py-2 text-xs'
                                >
                                    <div className='flex items-center gap-3'>
                                        {asset.thumbnailUrl ? (
                                            <img
                                                src={asset.thumbnailUrl}
                                                alt={asset.label}
                                                className='h-10 w-16 rounded-lg object-cover'
                                            />
                                        ) : (
                                            <div className='flex h-10 w-16 items-center justify-center rounded-lg border border-[rgba(148,163,184,0.25)] text-[10px] uppercase tracking-[0.2em] text-[rgba(148,163,184,0.6)]'>
                                                {asset.type}
                                            </div>
                                        )}
                                        <div>
                                            <p className='font-semibold text-white'>{asset.label}</p>
                                            <p className='text-[10px] uppercase tracking-[0.25em] text-[rgba(148,163,184,0.6)]'>
                                                {asset.type} • {asset.duration}s • offset {asset.offset || 0}s
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type='button'
                                        onClick={() => {
                                            removeTimelineAsset(asset.id, {
                                                historyLabel: `Timeline: Remove ${asset.type ?? 'asset'} "${asset.label}"`,
                                                source: 'timeline',
                                            });
                                            addToast('success', `Removed asset "${asset.label}"`);
                                        }}
                                        className='rounded-md border border-[rgba(248,113,113,0.45)] px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-[rgba(254,202,202,0.9)] hover:border-[rgba(254,202,202,0.9)]'
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                    <input
                        ref={fileInputRef}
                        type='file'
                        accept='image/*'
                        className='hidden'
                        onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => {
                                if (typeof reader.result === 'string') {
                                    setThumbnail({ data: reader.result, name: file.name });
                                    addToast('success', `Thumbnail "${file.name}" uploaded`);
                                }
                            };
                            reader.onerror = () => {
                                addToast('error', `Thumbnail "${file.name}" failed to upload`);
                            };
                            reader.readAsDataURL(file);
                        }}
                    />
                    <div className='mt-3 space-y-2'>
                        {toasts.map((toast) => (
                            <div
                                key={toast.id}
                                className={clsx(
                                    'flex items-center gap-2 rounded-lg border px-3 py-2 text-[11px] uppercase tracking-[0.2em] shadow-sm transition-opacity',
                                    toast.tone === 'success'
                                        ? 'border-[rgba(34,197,94,0.35)] bg-[rgba(34,197,94,0.15)] text-[rgba(220,252,231,0.9)]'
                                        : toast.tone === 'error'
                                            ? 'border-[rgba(248,113,113,0.45)] bg-[rgba(248,113,113,0.12)] text-[rgba(254,202,202,0.9)]'
                                            : 'border-[rgba(59,130,246,0.35)] bg-[rgba(59,130,246,0.15)] text-[rgba(191,219,254,0.9)]',
                                )}
                            >
                                <span>{toast.tone === 'success' ? '✅' : toast.tone === 'error' ? '⚠️' : 'ℹ️'}</span>
                                <span className='flex-1'>{toast.message}</span>
                            </div>
                        ))}
                        {toastHistory.length > 0 ? (
                            <div className='rounded-lg border border-[rgba(148,163,184,0.2)] bg-[rgba(30,41,59,0.65)] px-3 py-2 text-[11px] text-[rgba(148,163,184,0.7)]'>
                                <div className='mb-1 flex items-center justify-between'>
                                    <span className='font-semibold uppercase tracking-[0.25em] text-[rgba(226,233,254,0.85)]'>Toast history</span>
                                    <button
                                        type='button'
                                        onClick={() => setToastHistory([])}
                                        className='text-[10px] uppercase tracking-[0.2em] text-[rgba(148,163,184,0.65)] hover:text-[rgba(236,233,254,0.85)]'
                                    >
                                        Clear
                                    </button>
                                </div>
                                <ul className='space-y-1'>
                                    {toastHistory.map((entry) => (
                                        <li key={entry.id} className='flex items-center gap-2 text-[rgba(148,163,184,0.75)]'>
                                            <span>{entry.tone === 'success' ? '✅' : '⚠️'}</span>
                                            <span className='flex-1'>{entry.message}</span>
                                            <span className='text-[9px] uppercase tracking-[0.2em]'>
                                                {new Date(entry.timestamp).toLocaleTimeString()}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}
                        <div className='rounded-lg border border-[rgba(148,163,184,0.2)] bg-[rgba(15,23,42,0.65)] px-3 py-2 text-[11px] text-[rgba(148,163,184,0.75)]'>
                            <div className='mb-1 flex items-center justify-between'>
                                <span className='font-semibold uppercase tracking-[0.25em] text-[rgba(226,233,254,0.85)]'>Timeline history</span>
                                <div className='flex items-center gap-2'>
                                    <button
                                        type='button'
                                        onClick={() => {
                                            const undone = undoTimelineAction();
                                            if (undone) {
                                                const label = undone.after?.label || undone.before?.label || 'asset';
                                                addToast('info', `Undid ${undone.type} for "${label}"`);
                                            }
                                        }}
                                        className='rounded-md border border-[rgba(59,130,246,0.45)] px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-[rgba(191,219,254,0.9)] hover:border-[rgba(191,219,254,0.9)]'
                                    >
                                        Undo last
                                    </button>
                                    <button
                                        type='button'
                                        onClick={() => clearTimelineHistoryStore()}
                                        className='text-[10px] uppercase tracking-[0.2em] text-[rgba(148,163,184,0.65)] hover:text-[rgba(236,233,254,0.85)]'
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                            {timelineActions.length === 0 ? (
                                <p className='text-[10px] uppercase tracking-[0.2em] text-[rgba(148,163,184,0.6)]'>No recorded actions.</p>
                            ) : (
                                <ul className='space-y-1'>
                                    {timelineActions
                                        .slice()
                                        .reverse()
                                        .map((action) => (
                                            <li key={action.id} className='flex items-center gap-2'>
                                                <span>
                                                    {action.type === 'add'
                                                        ? '➕'
                                                        : action.type === 'remove'
                                                            ? '🗑️'
                                                            : '✏️'}
                                                </span>
                                                <span className='flex-1 text-[rgba(226,233,254,0.85)]'>
                                                    {action.type === 'add'
                                                        ? `Added "${action.after?.label}"`
                                                        : action.type === 'remove'
                                                            ? `Removed "${action.before?.label}"`
                                                            : `Updated "${action.after?.label ?? action.before?.label}"`}
                                                </span>
                                                <span className='text-[9px] uppercase tracking-[0.2em] text-[rgba(148,163,184,0.6)]'>
                                                    {new Date(action.timestamp).toLocaleTimeString()}
                                                </span>
                                            </li>
                                        ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
