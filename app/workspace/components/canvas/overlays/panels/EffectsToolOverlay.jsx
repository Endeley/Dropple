'use client';

import { useEffect, useMemo, useState } from 'react';
import { useCanvasStore } from '../../context/CanvasStore';

const clamp01 = (value) => Math.min(1, Math.max(0, value ?? 0));

const parseShadowStrength = (value) => {
    if (typeof value !== 'string' || !value.includes('15,23,42')) return 0.6;
    const match = value.match(/rgba\(15,23,42,([\d.]+)\)/);
    if (!match) return 0.6;
    const alpha = Number(match[1]);
    return clamp01((alpha - 0.2) / 0.55);
};

const parseGlowStrength = (value) => {
    if (typeof value !== 'string' || !value.includes('139,92,246')) return 0.6;
    const match = value.match(/rgba\(139,92,246,([\d.]+)\)/);
    if (!match) return 0.6;
    const alpha = Number(match[1]);
    return clamp01((alpha - 0.25) / 0.55);
};

const buildShadowValue = (strength) => {
    const clamped = clamp01(strength);
    const blur = 18 + clamped * 42;
    const alpha = 0.2 + clamped * 0.55;
    return `0 24px ${Math.round(blur)}px rgba(15,23,42,${alpha.toFixed(2)})`;
};

const buildGlowValue = (strength) => {
    const clamped = clamp01(strength);
    const blur = 18 + clamped * 48;
    const alpha = 0.25 + clamped * 0.55;
    return `0 0 ${Math.round(blur)}px rgba(139,92,246,${alpha.toFixed(2)})`;
};

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
    const [shadowStrength, setShadowStrength] = useState(() => parseShadowStrength(props.boxShadow));
    const [glowStrength, setGlowStrength] = useState(() => parseGlowStrength(props.boxShadow));
    const [blurAmount, setBlurAmount] = useState(() => {
        const match = (props.filter ?? '').match(/blur\((\d+(?:\.\d+)?)px\)/);
        return match ? Number(match[1]) : 0;
    });

    useEffect(() => {
        setShadowStrength(parseShadowStrength(props.boxShadow));
        setGlowStrength(parseGlowStrength(props.boxShadow));
        const match = (props.filter ?? '').match(/blur\((\d+(?:\.\d+)?)px\)/);
        setBlurAmount(match ? Number(match[1]) : 0);
    }, [props.boxShadow, props.filter]);

    const previewStyle = useMemo(
        () => ({
            boxShadow: props.boxShadow ?? 'none',
            filter: props.filter ?? 'none',
            backgroundImage:
                'linear-gradient(135deg, rgba(59,130,246,0.35) 0%, rgba(139,92,246,0.35) 100%)',
            borderRadius: '18px',
        }),
        [props.boxShadow, props.filter],
    );
    const hasShadow = typeof props.boxShadow === 'string' && props.boxShadow.includes('15,23,42');
    const hasGlow = typeof props.boxShadow === 'string' && props.boxShadow.includes('139,92,246');
    const hasBlur = blurAmount > 0;

    const toggleShadow = () => {
        const enable = !hasShadow;
        const nextStrength = enable ? (shadowStrength > 0 ? shadowStrength : 0.6) : shadowStrength;
        const value = enable ? buildShadowValue(nextStrength) : 'none';
        if (enable) {
            setShadowStrength(nextStrength);
        }
        updateElementProps(
            activeFrame.id,
            activeElement.id,
            {
                boxShadow: value,
            },
            {
                historyLabel: enable ? 'Effects: Enable shadow' : 'Effects: Disable shadow',
                source: 'overlay',
            },
        );
    };

    const toggleGlow = () => {
        const enable = !hasGlow;
        const nextStrength = enable ? (glowStrength > 0 ? glowStrength : 0.6) : glowStrength;
        const value = enable ? buildGlowValue(nextStrength) : 'none';
        if (enable) {
            setGlowStrength(nextStrength);
        }
        updateElementProps(
            activeFrame.id,
            activeElement.id,
            {
                boxShadow: value,
            },
            {
                historyLabel: enable ? 'Effects: Enable glow' : 'Effects: Disable glow',
                source: 'overlay',
            },
        );
    };

    const handleShadowChange = (value) => {
        const amount = clamp01((Number(value) || 0) / 100);
        setShadowStrength(amount);
        updateElementProps(
            activeFrame.id,
            activeElement.id,
            {
                boxShadow: amount > 0 ? buildShadowValue(amount) : 'none',
            },
            {
                historyLabel: 'Effects: Adjust shadow',
                source: 'overlay',
            },
        );
    };

    const handleGlowChange = (value) => {
        const amount = clamp01((Number(value) || 0) / 100);
        setGlowStrength(amount);
        updateElementProps(
            activeFrame.id,
            activeElement.id,
            {
                boxShadow: amount > 0 ? buildGlowValue(amount) : 'none',
            },
            {
                historyLabel: 'Effects: Adjust glow',
                source: 'overlay',
            },
        );
    };

    const toggleBlur = () => {
        const enable = !(blurAmount > 0);
        const nextAmount = enable ? Math.max(blurAmount, 12) : 0;
        setBlurAmount(nextAmount);
        updateElementProps(
            activeFrame.id,
            activeElement.id,
            {
                filter: enable ? `blur(${nextAmount}px)` : 'none',
            },
            {
                historyLabel: enable ? 'Effects: Enable blur' : 'Effects: Disable blur',
                source: 'overlay',
            },
        );
    };

    const handleBlurChange = (value) => {
        const amount = Math.max(0, Number(value) || 0);
        setBlurAmount(amount);
        updateElementProps(
            activeFrame.id,
            activeElement.id,
            {
                filter: amount > 0 ? `blur(${amount}px)` : 'none',
            },
            {
                historyLabel: 'Effects: Adjust blur',
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

            <div className='mb-4 rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgba(30,41,59,0.65)] p-3'>
                <p className='text-[11px] uppercase tracking-[0.25em] text-[rgba(148,163,184,0.7)]'>Live Preview</p>
                <div
                    className='mt-3 h-20 w-full rounded-xl border border-[rgba(148,163,184,0.25)] bg-[rgba(8,15,35,0.9)]'
                    style={previewStyle}
                />
            </div>

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

            <div className='mt-4 space-y-3'>
                <div className='rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgba(30,41,59,0.65)] p-3'>
                    <div className='flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-[rgba(148,163,184,0.7)]'>
                        <span>Shadow Strength</span>
                        <span>{Math.round(shadowStrength * 100)}%</span>
                    </div>
                    <input
                        type='range'
                        min={0}
                        max={100}
                        step={5}
                        value={Math.round(shadowStrength * 100)}
                        onChange={(event) => handleShadowChange(event.target.value)}
                        disabled={!hasShadow}
                        className={`mt-2 w-full accent-[rgba(139,92,246,0.75)] ${!hasShadow ? 'pointer-events-none opacity-40' : ''}`}
                    />
                </div>
                <div className='rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgba(30,41,59,0.65)] p-3'>
                    <div className='flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-[rgba(148,163,184,0.7)]'>
                        <span>Glow Strength</span>
                        <span>{Math.round(glowStrength * 100)}%</span>
                    </div>
                    <input
                        type='range'
                        min={0}
                        max={100}
                        step={5}
                        value={Math.round(glowStrength * 100)}
                        onChange={(event) => handleGlowChange(event.target.value)}
                        disabled={!hasGlow}
                        className={`mt-2 w-full accent-[rgba(236,233,254,0.75)] ${!hasGlow ? 'pointer-events-none opacity-40' : ''}`}
                    />
                </div>
                <div className='rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgba(30,41,59,0.65)] p-3'>
                    <div className='flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-[rgba(148,163,184,0.7)]'>
                        <span>Blur Amount</span>
                        <span>{blurAmount}px</span>
                    </div>
                    <input
                        type='range'
                        min={0}
                        max={40}
                        step={1}
                        value={blurAmount}
                        onChange={(event) => handleBlurChange(event.target.value)}
                        disabled={!hasBlur}
                        className={`mt-2 w-full accent-[rgba(139,92,246,0.75)] ${!hasBlur ? 'pointer-events-none opacity-40' : ''}`}
                    />
                </div>
            </div>
        </div>
    );
}
