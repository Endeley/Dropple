'use client';

import clsx from 'clsx';
import { useCanvasStore } from '../../context/CanvasStore';

export default function LayersToolOverlay() {
    const frames = useCanvasStore((state) => state.frames);
    const selectedFrameId = useCanvasStore((state) => state.selectedFrameId);
    const selectedElementId = useCanvasStore((state) => state.selectedElementId);
    const setSelectedFrame = useCanvasStore((state) => state.setSelectedFrame);
    const setSelectedElement = useCanvasStore((state) => state.setSelectedElement);
    const setActiveToolOverlay = useCanvasStore((state) => state.setActiveToolOverlay);

    const handleSelectFrame = (frameId) => {
        setSelectedFrame(frameId);
        setActiveToolOverlay(null);
    };

    const handleSelectElement = (frameId, elementId) => {
        setSelectedElement(frameId, elementId);
        setActiveToolOverlay(null);
    };

    return (
        <div className='rounded-2xl border border-[rgba(148,163,184,0.25)] bg-[rgba(15,23,42,0.92)] p-4 text-sm text-[rgba(226,232,240,0.82)] shadow-2xl backdrop-blur-lg'>
            <header className='mb-3 flex items-center justify-between'>
                <div>
                    <p className='text-sm font-semibold text-white'>Layers &amp; Hierarchy</p>
                    <p className='text-xs text-[rgba(148,163,184,0.7)]'>Navigate frames, groups, and nested elements.</p>
                </div>
                <button
                    type='button'
                    onClick={() => setActiveToolOverlay(null)}
                    className='rounded-lg border border-[rgba(148,163,184,0.25)] px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-[rgba(226,232,240,0.7)] transition-colors hover:border-[rgba(226,232,240,0.7)] hover:text-white'
                >
                    Close
                </button>
            </header>

            <div className='max-h-[60vh] space-y-2 overflow-y-auto pr-1'>
                {frames.map((frame) => (
                    <div key={frame.id} className='space-y-1 rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgba(30,41,59,0.65)] p-3'>
                        <button
                            type='button'
                            onClick={() => handleSelectFrame(frame.id)}
                            className={clsx(
                                'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors',
                                selectedFrameId === frame.id
                                    ? 'bg-[rgba(139,92,246,0.2)] text-white'
                                    : 'text-[rgba(226,232,240,0.8)] hover:bg-[rgba(148,163,184,0.12)]',
                            )}
                        >
                            <span className='text-sm font-medium'>{frame.name}</span>
                            <span className='text-[11px] uppercase tracking-[0.2em] text-[rgba(148,163,184,0.7)]'>
                                Frame
                            </span>
                        </button>
                        <ul className='space-y-1 pl-4'>
                            {frame.elements.map((element) => (
                                <li key={element.id}>
                                    <button
                                        type='button'
                                        onClick={() => handleSelectElement(frame.id, element.id)}
                                        className={clsx(
                                            'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors',
                                            selectedFrameId === frame.id && selectedElementId === element.id
                                                ? 'bg-[rgba(59,130,246,0.2)] text-[rgba(191,219,254,0.95)]'
                                                : 'text-[rgba(226,232,240,0.75)] hover:bg-[rgba(59,130,246,0.12)]',
                                        )}
                                    >
                                        <span className='font-medium'>
                                            {element.type.charAt(0).toUpperCase()}
                                            {element.type.slice(1)}
                                        </span>
                                        <span className='text-[10px] uppercase tracking-[0.25em] text-[rgba(148,163,184,0.6)]'>
                                            {element.id}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}
