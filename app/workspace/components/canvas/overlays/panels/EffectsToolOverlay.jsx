'use client';

import { useMemo } from 'react';
import { useCanvasStore } from '../../context/CanvasStore';

const DROP_SHADOW_VALUE = '0 24px 48px rgba(15,23,42,0.45)';
const GLOW_VALUE = '0 0 40px rgba(139,92,246,0.45)';
const BLUR_VALUE = 'blur(12px)';

export default function EffectsToolOverlay() {
    const selectedFrameId = useCanvasStore((state) => state.selectedFrameId);
    const selectedElementId = useCanvasStore((state) => state.selectedElementId);
    const frames = useCanvasStore((state) => state.frames);
    const updateElementProps = useCanvasStore((state) => state.updateElementProps);
    const setActiveToolOverlay = useCanvasStore((state) => state.setActiveToolOverlay);

    const activeFrame = useMemo(
        () => frames.find((frame) => frame.id === selectedFrameId) ?? null,
        [frames, selectedFrameId],
    );
    const activeElement = useMemo(
        () => activeFrame?.elements?.find((element) => element.id === selectedElementId) ?? null,
        [activeFrame, selectedElementId],
    );

    if (!activeFrame || !activeElement) {
        return (
            <div className='rounded-2xl border border-[rgba(148,163,184,0.25)] bg-[rgba(15,23,42,0.92)] p-4 text-sm text-[rgba(226,232,240,0.82)] shadow-2xl backdrop-blur-lg'>
                <header className='mb-3 flex items-center justify-between'>
                    <p className='text-sm font-semibold text-white'>Effects</p>
                    <button
                        type='button'
                        onClick={() => setActiveToolOverlay(null)}
                        className='rounded-lg border border-[rgba(148,163,184,0.25)] px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-[rgba(226,232,240,0.7)] transition-colors hover:border-[rgba(226,232,240,0.7)] hover:text-white'
                    >
                        Close
                    </button>
                </header>
                <p className='text-xs text-[rgba(148,163,184,0.7)]'>
                    Select an element to toggle shadows, glow, or blur effects.
                </p>
            </div>
        );
    }

    const props = activeElement.props ?? {};
    const hasShadow = props.boxShadow && props.boxShadow !== 'none';
    const hasGlow = props.boxShadow === GLOW_VALUE;
    const hasBlur = props.filter && props.filter.includes('blur');

    const toggleShadow = () => {
        const enable = !(hasShadow && !hasGlow);
        updateElementProps(
            activeFrame.id,
            activeElement.id,
            {
                boxShadow: enable ? DROP_SHADOW_VALUE : 'none',
            },
            {
                historyLabel: enable ? 'Effects: Enable shadow' : 'Effects: Disable shadow',
                source: 'overlay',
            },
        );
    };

    const toggleGlow = () => {
        const enable = !hasGlow;
        updateElementProps(
            activeFrame.id,
            activeElement.id,
            {
                boxShadow: enable ? GLOW_VALUE : 'none',
            },
            {
                historyLabel: enable ? 'Effects: Enable glow' : 'Effects: Disable glow',
                source: 'overlay',
            },
        );
    };

    const toggleBlur = () => {
        const enable = !hasBlur;
        updateElementProps(
            activeFrame.id,
            activeElement.id,
            {
                filter: enable ? BLUR_VALUE : 'none',
            },
            {
                historyLabel: enable ? 'Effects: Enable blur' : 'Effects: Disable blur',
                source: 'overlay',
            },
        );
    };

    return (
        <div className='rounded-2xl border border-[rgba(148,163,184,0.25)] bg-[rgba(15,23,42,0.92)] p-4 text-sm text-[rgba(226,232,240,0.82)] shadow-2xl backdrop-blur-lg'>
            <header className='mb-3 flex items-center justify-between'>
                <div>
                    <p className='text-sm font-semibold text-white'>Effects &amp; Filters</p>
                    <p className='text-xs text-[rgba(148,163,184,0.7)]'>Enhance the selected layer with motion-friendly effects.</p>
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
                <button
                    type='button'
                    onClick={toggleShadow}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                        hasShadow && !hasGlow
                            ? 'border-[rgba(139,92,246,0.55)] bg-[rgba(139,92,246,0.18)] text-white'
                            : 'border-[rgba(148,163,184,0.2)] bg-[rgba(30,41,59,0.65)] text-[rgba(226,232,240,0.8)] hover:border-[rgba(139,92,246,0.45)]'
                    }`}
                >
                    <p className='text-sm font-semibold'>Depth Shadow</p>
                    <p className='text-[11px] text-[rgba(148,163,184,0.8)]'>
                        Adds a soft drop shadow for realistic elevation.
                    </p>
                </button>

                <button
                    type='button'
                    onClick={toggleGlow}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                        hasGlow
                            ? 'border-[rgba(59,130,246,0.55)] bg-[rgba(59,130,246,0.2)] text-white'
                            : 'border-[rgba(148,163,184,0.2)] bg-[rgba(30,41,59,0.65)] text-[rgba(226,232,240,0.8)] hover:border-[rgba(59,130,246,0.45)]'
                    }`}
                >
                    <p className='text-sm font-semibold'>Neon Glow</p>
                    <p className='text-[11px] text-[rgba(148,163,184,0.8)]'>
                        Adds a vibrant glow around the element for emphasis.
                    </p>
                </button>

                <button
                    type='button'
                    onClick={toggleBlur}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                        hasBlur
                            ? 'border-[rgba(236,233,254,0.55)] bg-[rgba(236,233,254,0.1)] text-white'
                            : 'border-[rgba(148,163,184,0.2)] bg-[rgba(30,41,59,0.65)] text-[rgba(226,232,240,0.8)] hover:border-[rgba(236,233,254,0.45)]'
                    }`}
                >
                    <p className='text-sm font-semibold'>Glass Blur</p>
                    <p className='text-[11px] text-[rgba(148,163,184,0.8)]'>
                        Applies a background blur for glassmorphism effects.
                    </p>
                </button>
            </div>
        </div>
    );
}
