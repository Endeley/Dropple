'use client';

import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { useCanvasStore } from '../../context/CanvasStore';

const GRADIENT_PRESETS = [
    {
        id: 'aurora',
        label: 'Aurora',
        type: 'linear',
        angle: 135,
        stops: ['#8B5CF6', '#3B82F6', '#EC4899'],
    },
    {
        id: 'sunrise',
        label: 'Sunrise',
        type: 'linear',
        angle: 120,
        stops: ['#FDE68A', '#F97316', '#EA580C'],
    },
    {
        id: 'midnight',
        label: 'Midnight',
        type: 'linear',
        angle: 150,
        stops: ['#0F172A', '#1E293B', '#312E81'],
    },
    {
        id: 'neon-vapor',
        label: 'Neon Vapor',
        type: 'linear',
        angle: 135,
        stops: ['#0EA5E9', '#8B5CF6', '#F472B6'],
    },
];

const AI_COLOR_PALETTES = [
    ['#38BDF8', '#6366F1', '#F472B6'],
    ['#F59E0B', '#F97316', '#EA580C'],
    ['#10B981', '#22D3EE', '#6366F1'],
    ['#F472B6', '#F9A8D4', '#C084FC'],
    ['#0EA5E9', '#3B82F6', '#9333EA'],
];

const hashSeed = (input = '') => {
    const normalized = String(input ?? '');
    let hash = 0;
    for (let index = 0; index < normalized.length; index += 1) {
        hash = (hash << 5) - hash + normalized.charCodeAt(index);
        hash |= 0;
    }
    return Math.abs(hash);
};

const buildGradientCss = ({ type, angle, stops }) => {
    const gradientStops = (stops ?? []).map((stop, index, array) => {
        const percent = Math.round((index / Math.max(1, array.length - 1)) * 100);
        return `${stop} ${percent}%`;
    });
    if (type === 'radial') {
        return `radial-gradient(circle, ${gradientStops.join(', ')})`;
    }
    if (type === 'conic') {
        return `conic-gradient(from ${angle}deg, ${gradientStops.join(', ')})`;
    }
    return `linear-gradient(${angle}deg, ${gradientStops.join(', ')})`;
};

const createGradientFromPrompt = (prompt) => {
    const seed = hashSeed(prompt);
    const palette = AI_COLOR_PALETTES[seed % AI_COLOR_PALETTES.length];
    const baseAngle = 100 + (seed % 80);
    return {
        id: `ai-${seed}`,
        label: prompt && prompt.length > 2 ? `AI · ${prompt}` : 'AI Generated',
        type: 'linear',
        angle: baseAngle,
        stops: palette,
    };
};

export default function GradientToolOverlay() {
    const selectedFrameId = useCanvasStore((state) => state.selectedFrameId);
    const selectedElementId = useCanvasStore((state) => state.selectedElementId);
    const frames = useCanvasStore((state) => state.frames);
    const updateElementProps = useCanvasStore((state) => state.updateElementProps);
    const updateFrame = useCanvasStore((state) => state.updateFrame);
    const setActiveToolOverlay = useCanvasStore((state) => state.setActiveToolOverlay);
    const gradientLibrary = useCanvasStore((state) => state.gradientLibrary);
    const addGradientPreset = useCanvasStore((state) => state.addGradientPreset);
    const removeGradientPreset = useCanvasStore((state) => state.removeGradientPreset);

    const activeFrame = useMemo(
        () => frames.find((frame) => frame.id === selectedFrameId) ?? null,
        [frames, selectedFrameId],
    );
    const activeElement = useMemo(
        () => activeFrame?.elements?.find((element) => element.id === selectedElementId) ?? null,
        [activeFrame, selectedElementId],
    );

    const canApplyElement = Boolean(activeFrame && activeElement);
    const canApplyFrame = Boolean(activeFrame);

    const defaultPreset = GRADIENT_PRESETS[0];
    const [target, setTarget] = useState(canApplyElement ? 'element' : 'frame');
    const [activePreset, setActivePreset] = useState(defaultPreset);
    const [angle, setAngle] = useState(defaultPreset.angle);
    const [previewGradient, setPreviewGradient] = useState(buildGradientCss(defaultPreset));
    const [aiPrompt, setAiPrompt] = useState('');

    useEffect(() => {
        if (target === 'element' && !canApplyElement) {
            setTarget('frame');
        }
    }, [target, canApplyElement]);

    const handleApply = useCallback(
        (preset, angleOverride = preset.angle) => {
            if (!activeFrame) return;
            const gradientValue = buildGradientCss({ ...preset, angle: angleOverride });
            if (target === 'element' && canApplyElement && activeElement) {
                updateElementProps(
                    activeFrame.id,
                    activeElement.id,
                    { fill: gradientValue, imageUrl: null },
                    { historyLabel: `Gradient: Apply "${preset.label}"`, source: 'overlay' },
                );
            } else if (canApplyFrame) {
                updateFrame(
                    activeFrame.id,
                    {
                        backgroundFillType: 'gradient',
                        backgroundGradientType: preset.type,
                        backgroundGradientStart: preset.stops[0],
                        backgroundGradientEnd: preset.stops[preset.stops.length - 1],
                        backgroundGradientAngle: angleOverride,
                        backgroundImage: gradientValue,
                    },
                    { historyLabel: `Gradient: Apply "${preset.label}" to frame`, source: 'overlay' },
                );
            }
            setActivePreset({ ...preset, angle: angleOverride });
            setAngle(angleOverride);
            setPreviewGradient(gradientValue);
        },
        [activeFrame, activeElement, canApplyElement, canApplyFrame, target, updateElementProps, updateFrame],
    );

    const handleAngleChange = (value) => {
        const next = Number(value);
        setAngle(next);
        handleApply(activePreset, next);
    };

    const handleGenerate = () => {
        const prompt = aiPrompt.trim();
        if (!prompt) return;
        const preset = createGradientFromPrompt(prompt);
        const storedPreset = { ...preset, source: 'ai', prompt };
        addGradientPreset(storedPreset);
        setAiPrompt('');
        handleApply(storedPreset, preset.angle);
    };

    const gradientOptions = useMemo(() => [...gradientLibrary, ...GRADIENT_PRESETS], [gradientLibrary]);

    useEffect(() => {
        const exists = gradientOptions.some((preset) => preset.id === activePreset.id);
        if (!exists) {
            setActivePreset(defaultPreset);
            setAngle(defaultPreset.angle);
            setPreviewGradient(buildGradientCss(defaultPreset));
        }
    }, [activePreset.id, defaultPreset, gradientOptions]);

    return (
        <div className='rounded-2xl border border-[rgba(148,163,184,0.25)] bg-[rgba(15,23,42,0.92)] p-4 text-sm text-[rgba(226,232,240,0.82)] shadow-2xl backdrop-blur-lg'>
            <header className='mb-4 flex items-center justify-between'>
                <div>
                    <p className='text-sm font-semibold capitalize text-white'>Gradient Studio</p>
                    <p className='text-xs text-[rgba(148,163,184,0.7)]'>Preview, tweak, and apply gradients to the selected layer or frame.</p>
                </div>
                <button
                    type='button'
                    onClick={() => setActiveToolOverlay(null)}
                    className='rounded-lg border border-[rgba(148,163,184,0.25)] px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-[rgba(226,232,240,0.7)] transition-colors hover:border-[rgba(226,232,240,0.7)] hover:text-white'
                >
                    Close
                </button>
            </header>

            <div className='rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgba(30,41,59,0.65)] p-3'>
                <div className='flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.25em] text-[rgba(148,163,184,0.7)]'>
                    <span>Target</span>
                    <div className='flex items-center gap-2'>
                        <button
                            type='button'
                            onClick={() => setTarget('element')}
                            disabled={!canApplyElement}
                            className={clsx(
                                'rounded-md border px-2 py-1 text-[11px] transition-colors',
                                target === 'element'
                                    ? 'border-[rgba(236,233,254,0.75)] text-white'
                                    : 'border-[rgba(148,163,184,0.3)] text-[rgba(226,232,240,0.75)] hover:border-[rgba(236,233,254,0.6)] hover:text-white',
                                !canApplyElement && 'cursor-not-allowed opacity-50',
                            )}
                        >
                            Layer
                        </button>
                        <button
                            type='button'
                            onClick={() => setTarget('frame')}
                            disabled={!canApplyFrame}
                            className={clsx(
                                'rounded-md border px-2 py-1 text-[11px] transition-colors',
                                target === 'frame'
                                    ? 'border-[rgba(139,92,246,0.55)] text-white'
                                    : 'border-[rgba(148,163,184,0.3)] text-[rgba(226,232,240,0.75)] hover:border-[rgba(139,92,246,0.5)] hover:text-white',
                                !canApplyFrame && 'cursor-not-allowed opacity-50',
                            )}
                        >
                            Frame
                        </button>
                    </div>
                </div>
                <div className='mt-3 rounded-lg border border-[rgba(148,163,184,0.2)] bg-[rgba(8,15,35,0.85)] p-3'>
                    <div
                        className='h-24 rounded-lg border border-[rgba(148,163,184,0.25)] shadow-[inset_0_0_25px_rgba(8,15,35,0.6)]'
                        style={{ backgroundImage: previewGradient }}
                    />
                    <div className='mt-3 flex items-center gap-3 text-xs text-[rgba(191,219,254,0.85)]'>
                        <span className='uppercase tracking-[0.25em] text-[rgba(148,163,184,0.7)]'>Angle</span>
                        <input
                            type='range'
                            min={0}
                            max={360}
                            step={1}
                            value={angle}
                            onChange={(event) => handleAngleChange(event.target.value)}
                            className='flex-1 accent-[rgba(139,92,246,0.8)]'
                        />
                        <span>{angle}°</span>
                    </div>
                </div>
            </div>

            <div className='mt-4 rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgba(30,41,59,0.65)] p-3'>
                <p className='text-[11px] font-semibold uppercase tracking-[0.25em] text-[rgba(148,163,184,0.7)]'>AI Palette</p>
                <div className='mt-2 flex gap-2'>
                    <input
                        value={aiPrompt}
                        onChange={(event) => setAiPrompt(event.target.value)}
                        placeholder='e.g. sunset neon city'
                        className='flex-1 rounded-md border border-[rgba(148,163,184,0.25)] bg-[rgba(15,23,42,0.7)] px-3 py-2 text-sm text-[rgba(236,233,254,0.9)] placeholder:text-[rgba(148,163,184,0.6)] focus:border-[rgba(139,92,246,0.6)] focus:outline-none'
                    />
                    <button
                        type='button'
                        onClick={handleGenerate}
                        className='rounded-md border border-[rgba(139,92,246,0.45)] px-3 py-2 text-[11px] uppercase tracking-[0.25em] text-[rgba(236,233,254,0.85)] transition-colors hover:border-[rgba(236,233,254,0.75)] hover:text-white'
                    >
                        Generate
                    </button>
                </div>
            </div>

    const gradientOptions = [...aiGradients, ...GRADIENT_PRESETS];

            <div className='mt-4 grid grid-cols-1 gap-3'>
                {gradientOptions.map((preset) => {
                    const gradientCss = buildGradientCss(preset);
                    const isActive = preset.id === activePreset.id;
                    const isGenerated = preset.source === 'ai';
                    const descriptor = isGenerated
                        ? preset.prompt
                            ? `AI · ${preset.prompt}`
                            : 'AI generated'
                        : preset.stops.join(' · ');
                    return (
                        <div
                            key={preset.id}
                            onMouseEnter={() => setPreviewGradient(gradientCss)}
                            onMouseLeave={() => setPreviewGradient(buildGradientCss({ ...activePreset, angle }))}
                            className={clsx(
                                'rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgba(10,16,28,0.85)] p-3 transition-colors',
                                isActive ? 'border-[rgba(139,92,246,0.55)]' : 'hover:border-[rgba(139,92,246,0.45)]',
                            )}
                        >
                            <div
                                className='h-14 rounded-lg border border-[rgba(148,163,184,0.2)] shadow-[inset_0_0_18px_rgba(8,15,35,0.55)]'
                                style={{ backgroundImage: gradientCss }}
                            />
                            <div className='mt-3 flex items-center justify-between text-xs text-[rgba(226,232,240,0.85)]'>
                                <div className='min-w-0'>
                                    <p className='font-semibold'>{preset.label}</p>
                                    <p className='truncate text-[10px] uppercase tracking-[0.25em] text-[rgba(148,163,184,0.6)]'>
                                        {descriptor}
                                    </p>
                                </div>
                                <div className='flex items-center gap-2'>
                                    {isGenerated ? (
                                        <button
                                            type='button'
                                            onClick={() => removeGradientPreset(preset.id)}
                                            className='rounded-md border border-[rgba(148,163,184,0.3)] px-2 py-1 text-[10px] uppercase tracking-[0.25em] text-[rgba(148,163,184,0.75)] transition-colors hover:border-[rgba(236,233,254,0.65)] hover:text-white'
                                        >
                                            Remove
                                        </button>
                                    ) : null}
                                    <button
                                        type='button'
                                        onClick={() => handleApply(preset, preset.angle)}
                                        className='rounded-md border border-[rgba(139,92,246,0.45)] px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-[rgba(236,233,254,0.85)] transition-colors hover:border-[rgba(236,233,254,0.75)] hover:text-white'
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
