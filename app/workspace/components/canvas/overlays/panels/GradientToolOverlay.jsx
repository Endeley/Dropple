'use client';

import { useMemo } from 'react';
import { useCanvasStore } from '../../context/CanvasStore';

const GRADIENT_PRESETS = [
    {
        label: 'Aurora',
        value: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 50%, #EC4899 100%)',
    },
    {
        label: 'Sunrise',
        value: 'linear-gradient(135deg, #FDE68A 0%, #F97316 48%, #EA580C 100%)',
    },
    {
        label: 'Midnight',
        value: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #312E81 100%)',
    },
    {
        label: 'Neon Vapor',
        value: 'linear-gradient(135deg, #0EA5E9 0%, #8B5CF6 45%, #F472B6 100%)',
    },
];

export default function GradientToolOverlay() {
    const selectedFrameId = useCanvasStore((state) => state.selectedFrameId);
    const selectedElementId = useCanvasStore((state) => state.selectedElementId);
    const frames = useCanvasStore((state) => state.frames);
    const updateElementProps = useCanvasStore((state) => state.updateElementProps);
    const updateFrame = useCanvasStore((state) => state.updateFrame);
    const setActiveToolOverlay = useCanvasStore((state) => state.setActiveToolOverlay);

    const activeFrame = useMemo(
        () => frames.find((frame) => frame.id === selectedFrameId) ?? null,
        [frames, selectedFrameId],
    );
    const activeElement = useMemo(
        () => activeFrame?.elements?.find((element) => element.id === selectedElementId) ?? null,
        [activeFrame, selectedElementId],
    );

    const handleApplyToElement = (gradient) => {
        if (!activeFrame || !activeElement) return;
        updateElementProps(activeFrame.id, activeElement.id, { fill: gradient, imageUrl: null });
    };

    const handleApplyToFrame = (gradient) => {
        if (!activeFrame) return;
        updateFrame(activeFrame.id, {
            backgroundColor: 'transparent',
            backgroundImage: gradient,
        });
    };

    const canApplyElement = Boolean(activeFrame && activeElement);
    const canApplyFrame = Boolean(activeFrame);

    return (
        <div className='rounded-2xl border border-[rgba(148,163,184,0.25)] bg-[rgba(15,23,42,0.92)] p-4 text-sm text-[rgba(226,232,240,0.82)] shadow-2xl backdrop-blur-lg'>
            <header className='mb-3 flex items-center justify-between'>
                <div>
                    <p className='text-sm font-semibold capitalize text-white'>Gradient & Color</p>
                    <p className='text-xs text-[rgba(148,163,184,0.7)]'>Apply presets to selected layer or frame background.</p>
                </div>
                <button
                    type='button'
                    onClick={() => setActiveToolOverlay(null)}
                    className='rounded-lg border border-[rgba(148,163,184,0.25)] px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-[rgba(226,232,240,0.7)] transition-colors hover:border-[rgba(226,232,240,0.7)] hover:text-white'
                >
                    Close
                </button>
            </header>
            <div className='space-y-3'>
                {GRADIENT_PRESETS.map((preset) => (
                    <div
                        key={preset.label}
                        className='rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgba(30,41,59,0.65)] p-3'
                    >
                        <div
                            className='h-16 w-full rounded-lg border border-[rgba(148,163,184,0.15)]'
                            style={{ backgroundImage: preset.value }}
                        />
                        <div className='mt-3 flex items-center justify-between'>
                            <span className='text-xs font-medium text-white'>{preset.label}</span>
                            <div className='flex gap-2'>
                                <button
                                    type='button'
                                    disabled={!canApplyElement}
                                    onClick={() => handleApplyToElement(preset.value)}
                                    className={`rounded-lg border px-3 py-1 text-[11px] uppercase tracking-[0.2em] transition-colors ${
                                        canApplyElement
                                            ? 'border-[rgba(139,92,246,0.45)] text-[rgba(236,233,254,0.85)] hover:border-[rgba(236,233,254,0.85)] hover:text-white'
                                            : 'cursor-not-allowed border-[rgba(148,163,184,0.2)] text-[rgba(148,163,184,0.5)]'
                                    }`}
                                >
                                    Element
                                </button>
                                <button
                                    type='button'
                                    disabled={!canApplyFrame}
                                    onClick={() => handleApplyToFrame(preset.value)}
                                    className={`rounded-lg border px-3 py-1 text-[11px] uppercase tracking-[0.2em] transition-colors ${
                                        canApplyFrame
                                            ? 'border-[rgba(59,130,246,0.45)] text-[rgba(191,219,254,0.9)] hover:border-[rgba(191,219,254,0.85)] hover:text-white'
                                            : 'cursor-not-allowed border-[rgba(148,163,184,0.2)] text-[rgba(148,163,184,0.5)]'
                                    }`}
                                >
                                    Frame
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {!canApplyFrame ? (
                <p className='mt-4 text-[11px] uppercase tracking-[0.25em] text-[rgba(148,163,184,0.6)]'>
                    Select a frame or element to apply a gradient.
                </p>
            ) : null}
        </div>
    );
}
