'use client';

import { useMemo, useState } from 'react';
import { useCanvasStore } from '../../context/CanvasStore';

export default function PrototypeLinkOverlay() {
    const frames = useCanvasStore((state) => state.frames);
    const frameLinks = useCanvasStore((state) => state.frameLinks);
    const selectedFrameId = useCanvasStore((state) => state.selectedFrameId);
    const selectedElementId = useCanvasStore((state) => state.selectedElementId);
    const setElementLink = useCanvasStore((state) => state.setElementLink);
    const addFrameLink = useCanvasStore((state) => state.addFrameLink);
    const removeFrameLink = useCanvasStore((state) => state.removeFrameLink);
    const chainFrames = useCanvasStore((state) => state.chainFrames);
    const setActiveToolOverlay = useCanvasStore((state) => state.setActiveToolOverlay);

    const [selectedChain, setSelectedChain] = useState([]);

    const activeFrame = useMemo(
        () => frames.find((frame) => frame.id === selectedFrameId) ?? null,
        [frames, selectedFrameId],
    );
    const activeElement = useMemo(
        () => activeFrame?.elements?.find((element) => element.id === selectedElementId) ?? null,
        [activeFrame, selectedElementId],
    );

    const linkedFrames = useMemo(
        () => frameLinks.filter((link) => link.from === selectedFrameId),
        [frameLinks, selectedFrameId],
    );

    const handleElementLinkChange = (event) => {
        if (!activeFrame || !activeElement) return;
        const value = event.target.value || null;
        setElementLink(activeFrame.id, activeElement.id, value);
    };

    const handleAddFrameLink = (targetId) => {
        if (!selectedFrameId || !targetId) return;
        addFrameLink(selectedFrameId, targetId);
    };

    const toggleFrameInChain = (frameId) => {
        setSelectedChain((prev) =>
            prev.includes(frameId) ? prev.filter((id) => id !== frameId) : [...prev, frameId],
        );
    };

    const chainSelectedFrames = () => {
        if (!selectedFrameId || selectedChain.length === 0) return;
        const orderedTargets = frames
            .filter((frame) => selectedChain.includes(frame.id))
            .sort((a, b) => (a.x ?? 0) - (b.x ?? 0))
            .map((frame) => frame.id);
        const sequence = [selectedFrameId, ...orderedTargets];
        chainFrames(sequence);
        setSelectedChain([]);
    };

    return (
        <div className='rounded-2xl border border-[rgba(148,163,184,0.25)] bg-[rgba(15,23,42,0.92)] p-4 text-sm text-[rgba(226,232,240,0.82)] shadow-2xl backdrop-blur-lg'>
            <header className='mb-3 flex items-center justify-between'>
                <div>
                    <p className='text-sm font-semibold text-white'>Prototype Linking</p>
                    <p className='text-xs text-[rgba(148,163,184,0.7)]'>
                        Connect frames and hotspots for prototype flows.
                    </p>
                </div>
                <button
                    type='button'
                    onClick={() => setActiveToolOverlay(null)}
                    className='rounded-lg border border-[rgba(148,163,184,0.25)] px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-[rgba(226,232,240,0.7)] transition-colors hover:border-[rgba(226,232,240,0.7)] hover:text-white'
                >
                    Close
                </button>
            </header>

            {activeElement ? (
                <div className='mb-4 space-y-2 rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgba(30,41,59,0.65)] p-3'>
                    <p className='text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(148,163,184,0.7)]'>
                        Selected element link
                    </p>
                    <select
                        value={activeElement.props?.linkTarget ?? ''}
                        onChange={handleElementLinkChange}
                        className='w-full rounded-lg border border-[rgba(148,163,184,0.25)] bg-[rgba(15,23,42,0.7)] px-3 py-2 text-sm text-[rgba(236,233,254,0.9)] focus:border-[rgba(139,92,246,0.6)] focus:outline-none'
                    >
                        <option value=''>No link</option>
                        {frames
                            .filter((frame) => frame.id !== selectedFrameId)
                            .map((frame) => (
                                <option key={frame.id} value={frame.id}>
                                    {frame.name}
                                </option>
                            ))}
                    </select>
                </div>
            ) : (
                <p className='mb-4 text-xs text-[rgba(148,163,184,0.7)]'>
                    Select an element to assign a hotspot link.
                </p>
            )}

            {activeFrame ? (
                <div className='space-y-3 rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgba(30,41,59,0.65)] p-3'>
                    <p className='text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(148,163,184,0.7)]'>
                        Frame transitions
                    </p>
                    <div className='space-y-2'>
                        {frames
                            .filter((frame) => frame.id !== selectedFrameId)
                            .map((frame) => {
                                const existingLink = linkedFrames.find((link) => link.to === frame.id);
                                const selectedForChain = selectedChain.includes(frame.id);
                                return (
                                    <div
                                        key={frame.id}
                                        className='flex items-center justify-between gap-2 rounded-lg border border-[rgba(148,163,184,0.15)] bg-[rgba(15,23,42,0.6)] px-3 py-2 text-xs'
                                    >
                                        <label className='flex items-center gap-2 text-[rgba(226,232,240,0.82)]'>
                                            <input
                                                type='checkbox'
                                                checked={selectedForChain}
                                                onChange={() => toggleFrameInChain(frame.id)}
                                                className='h-3 w-3 rounded border-[rgba(148,163,184,0.35)] bg-[rgba(15,23,42,0.7)] text-[rgba(139,92,246,0.85)] focus:ring-[rgba(139,92,246,0.5)]'
                                            />
                                            <span>{frame.name}</span>
                                        </label>
                                        {existingLink ? (
                                            <button
                                                type='button'
                                                onClick={() => removeFrameLink(selectedFrameId, frame.id)}
                                                className='rounded-md border border-[rgba(248,113,113,0.45)] px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-[rgba(254,202,202,0.9)] hover:border-[rgba(254,202,202,0.9)]'
                                            >
                                                Remove
                                            </button>
                                        ) : (
                                            <button
                                                type='button'
                                                onClick={() => handleAddFrameLink(frame.id)}
                                                className='rounded-md border border-[rgba(59,130,246,0.45)] px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-[rgba(191,219,254,0.9)] hover:border-[rgba(191,219,254,0.85)]'
                                            >
                                                Link
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                    <button
                        type='button'
                        disabled={selectedChain.length < 1}
                        onClick={chainSelectedFrames}
                        className={`mt-3 w-full rounded-lg border px-3 py-2 text-[11px] uppercase tracking-[0.2em] transition-colors ${
                            selectedChain.length >= 1
                                ? 'border-[rgba(59,130,246,0.55)] text-[rgba(191,219,254,0.95)] hover:border-[rgba(191,219,254,0.85)] hover:text-white'
                                : 'cursor-not-allowed border-[rgba(148,163,184,0.25)] text-[rgba(148,163,184,0.5)]'
                        }`}
                    >
                        Auto chain selected
                    </button>
                </div>
            ) : (
                <p className='text-xs text-[rgba(148,163,184,0.7)]'>Select a frame to manage transitions.</p>
            )}
        </div>
    );
}
