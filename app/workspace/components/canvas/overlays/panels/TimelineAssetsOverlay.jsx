'use client';

import { useEffect, useState } from 'react';
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

    const selectedFrameId = useCanvasStore((state) => state.selectedFrameId);
    const frames = useCanvasStore((state) => state.frames);
    const timelineAssets = useCanvasStore((state) => state.timelineAssets);
    const addTimelineAsset = useCanvasStore((state) => state.addTimelineAsset);
    const removeTimelineAsset = useCanvasStore((state) => state.removeTimelineAsset);
    const updateFrame = useCanvasStore((state) => state.updateFrame);
    const setActiveToolOverlay = useCanvasStore((state) => state.setActiveToolOverlay);

    const activeFrame = frames.find((frame) => frame.id === selectedFrameId) ?? null;
    const frameAssets = timelineAssets.filter((asset) => asset.frameId === selectedFrameId);
    const [timelineDurationInput, setTimelineDurationInput] = useState(activeFrame?.timelineDuration ?? 20);

    useEffect(() => {
        setTimelineDurationInput(activeFrame?.timelineDuration ?? 20);
    }, [activeFrame?.id, activeFrame?.timelineDuration]);

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!activeFrame || !label.trim()) return;
        addTimelineAsset({ frameId: activeFrame.id, label: label.trim(), type, duration: Number(duration) || 5 });
        setLabel('New clip');
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
                                    updateFrame(activeFrame.id, { timelineDuration: value });
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
                                    className='flex items-center justify-between rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgba(30,41,59,0.65)] px-3 py-2 text-xs'
                                >
                                    <div>
                                        <p className='font-semibold text-white'>{asset.label}</p>
                                        <p className='text-[10px] uppercase tracking-[0.25em] text-[rgba(148,163,184,0.6)]'>
                                            {asset.type} • {asset.duration}s
                                        </p>
                                    </div>
                                    <button
                                        type='button'
                                        onClick={() => removeTimelineAsset(asset.id)}
                                        className='rounded-md border border-[rgba(248,113,113,0.45)] px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-[rgba(254,202,202,0.9)] hover:border-[rgba(254,202,202,0.9)]'
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
