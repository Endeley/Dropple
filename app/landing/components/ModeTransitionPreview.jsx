'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { MODE_CONFIG } from '../../workspace/components/canvas/modeConfig';

const toStartCase = (value = '') =>
    value
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());

const slugify = (value = '') =>
    value
        .toString()
        .trim()
        .replace(/[_\s]+/g, '-')
        .replace(/[^\w-]/g, '')
        .replace(/--+/g, '-')
        .replace(/^-|-$/g, '') || 'item';

const normalizeTools = (config) =>
    (config?.tools ?? []).map((tool) => {
        if (typeof tool === 'string') {
            const id = slugify(tool);
            return { id, name: toStartCase(tool), description: '' };
        }
        const name = tool.name ?? toStartCase(tool.id ?? 'Tool');
        const id = slugify(tool.id ?? name);
        return {
            id,
            name,
            description: tool.description ?? '',
        };
    });

const normalizeInspectorSections = (config) =>
    (config?.inspectorSections ?? []).map((section) => {
        if (typeof section === 'string') {
            const id = slugify(section);
            return { id, title: toStartCase(section), items: [] };
        }
        const title = section.title ?? toStartCase(section.id ?? 'Section');
        const id = slugify(section.id ?? title);
        return {
            id,
            title,
            items: Array.isArray(section.items) ? section.items : [],
        };
    });

const normalizeBottomActions = (config) => {
    const modeLabel = config?.label ?? 'this mode';
    return (config?.bottomActions ?? []).map((action) => {
        if (typeof action === 'string') {
            const id = slugify(action);
            const label = toStartCase(action);
            return {
                id,
                label,
                description: `Activate the ${label.toLowerCase()} control for ${modeLabel.toLowerCase()}.`,
            };
        }
        const label = action.label ?? toStartCase(action.id ?? 'Action');
        const id = slugify(action.id ?? label);
        return {
            id,
            label,
            description: action.description ?? `Activate the ${label.toLowerCase()} control for ${modeLabel.toLowerCase()}.`,
        };
    });
};

const DEFAULT_MODES = [
    {
        id: 'graphic',
        configId: 'graphics',
        icon: '🟣',
        title: 'Graphic Design Mode',
        shortTitle: 'Graphic',
        description:
            'Infinite canvas with vector tools, typography, and layer controls ready the moment you arrive.',
        accent: '#8B5CF6',
        background: 'rgba(139,92,246,0.28)',
        shadow: 'rgba(139,92,246,0.4)',
        statusText: 'Entering Graphic Mode',
        loader: false,
    },
    {
        id: 'uiux',
        configId: 'ux',
        icon: '🔵',
        title: 'UI • UX Design Mode',
        shortTitle: 'UI/UX',
        description: 'Frame-based interface design with responsive constraints, components, and prototype linking.',
        accent: '#3B82F6',
        background: 'rgba(59,130,246,0.28)',
        shadow: 'rgba(59,130,246,0.4)',
        statusText: 'Entering UI/UX Mode',
        loader: false,
    },
    {
        id: 'animation',
        configId: 'cartoon',
        icon: '🟠',
        title: 'Animation & Cartoon Mode',
        shortTitle: 'Animation',
        description:
            'Layered timeline with keyframes, rigging controls, and motion paths pre-wired for every asset.',
        accent: '#F97316',
        background: 'rgba(249,115,22,0.28)',
        shadow: 'rgba(249,115,22,0.4)',
        statusText: 'Entering Animation Mode',
        loader: false,
    },
    {
        id: 'podcast',
        configId: 'podcast',
        icon: '🟢',
        title: 'Podcast Mode',
        shortTitle: 'Podcast',
        description: 'Horizontal audio timeline with record, trim, fade, and AI voice tools synced to your scripts.',
        accent: '#34D399',
        background: 'rgba(52,211,153,0.26)',
        shadow: 'rgba(52,211,153,0.38)',
        statusText: 'Entering Podcast Mode',
        loader: false,
    },
    {
        id: 'video',
        configId: 'video',
        icon: '🔴',
        title: 'Video Editing Mode',
        shortTitle: 'Video',
        description: 'Multi-track video editing with overlays, transitions, captions, and synced audio beds.',
        accent: '#EF4444',
        background: 'rgba(239,68,68,0.3)',
        shadow: 'rgba(239,68,68,0.45)',
        statusText: 'Preparing Video Workspace',
        loader: true,
    },
    {
        id: 'image',
        configId: 'image',
        icon: '🟡',
        title: 'Image Editing Mode',
        shortTitle: 'Image',
        description:
            'Non-destructive image adjustments, filters, retouching, and background removal controls.',
        accent: '#FACC15',
        background: 'rgba(250,204,21,0.32)',
        shadow: 'rgba(250,204,21,0.4)',
        statusText: 'Entering Image Mode',
        loader: false,
    },
    {
        id: 'ai',
        configId: 'ai-studio',
        icon: '⚪',
        title: 'AI Studio Mode',
        shortTitle: 'AI Studio',
        description: 'Prompt-based generation for visuals, voice, and scripts with one-click sends to any mode.',
        accent: '#E5E7EB',
        background: 'rgba(209,213,219,0.45)',
        shadow: 'rgba(148,163,184,0.4)',
        statusText: 'Preparing AI Studio',
        loader: true,
    },
];

const ACTIVE_VARIANTS = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, y: -24, transition: { duration: 0.3, ease: 'easeIn' } },
};

export default function ModeTransitionPreview({ modes = DEFAULT_MODES, cycleDuration = 3200 }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const activeMode = modes[activeIndex] || DEFAULT_MODES[0];
    const configKey = activeMode.configId || activeMode.id;
    const modeConfig = useMemo(() => MODE_CONFIG[configKey] ?? null, [configKey]);
    const tools = useMemo(() => normalizeTools(modeConfig), [modeConfig]);
    const inspectorSections = useMemo(() => normalizeInspectorSections(modeConfig), [modeConfig]);
    const bottomActions = useMemo(() => normalizeBottomActions(modeConfig), [modeConfig]);

    const [activeToolId, setActiveToolId] = useState(tools[0]?.id ?? null);
    const [activeSectionId, setActiveSectionId] = useState(inspectorSections[0]?.id ?? null);
    const [activeActionId, setActiveActionId] = useState(bottomActions[0]?.id ?? null);
    const [inspectorValues, setInspectorValues] = useState({});

    useEffect(() => {
        setActiveToolId(tools[0]?.id ?? null);
        setActiveSectionId(inspectorSections[0]?.id ?? null);
        setActiveActionId(bottomActions[0]?.id ?? null);
    }, [configKey, tools, inspectorSections, bottomActions]);

    useEffect(() => {
        if (!modes.length) return;
        const timer = setInterval(() => {
            setActiveIndex((index) => (index + 1) % modes.length);
        }, cycleDuration);
        return () => clearInterval(timer);
    }, [modes.length, cycleDuration]);

    const activeTool = tools.find((tool) => tool.id === activeToolId) ?? null;
    const activeSection = inspectorSections.find((section) => section.id === activeSectionId) ?? null;
    const activeAction = bottomActions.find((action) => action.id === activeActionId) ?? null;

    const accentStyles = useMemo(
        () => ({
            background: `linear-gradient(140deg, ${activeMode.background} 0%, rgba(15,23,42,0.85) 85%)`,
            border: `1px solid ${activeMode.accent}44`,
            boxShadow: `0 40px 80px ${activeMode.shadow}`,
        }),
        [activeMode.background, activeMode.accent, activeMode.shadow],
    );

    const getInspectorValue = (sectionId, itemId) => {
        const key = `${configKey}::${sectionId}::${itemId}`;
        const current = inspectorValues[key];
        if (Number.isFinite(current)) return current;
        return 50;
    };

    const handleInspectorValueChange = (sectionId, itemId, raw) => {
        const next = Number.parseFloat(raw);
        if (Number.isNaN(next)) return;
        const key = `${configKey}::${sectionId}::${itemId}`;
        setInspectorValues((prev) => ({
            ...prev,
            [key]: Math.min(100, Math.max(0, next)),
        }));
    };

    return (
        <div
            className='flex h-full min-h-[380px] flex-col gap-5 rounded-[1.6rem] border px-5 py-6 text-left text-white backdrop-blur-sm lg:px-7 lg:py-7'
            style={accentStyles}
        >
            <div className='flex flex-wrap items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-[rgba(255,255,255,0.65)]'>
                <span className='flex items-center gap-3'>
                    <motion.span
                        key={`${activeMode.id}-dot`}
                        layoutId='mode-accent-dot'
                        className='h-3 w-3 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.45)]'
                        style={{ backgroundColor: activeMode.accent }}
                    />
                    {activeMode.shortTitle || activeMode.title}
                </span>
                <span>Adaptive Workspace</span>
            </div>

            <div className='grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)_220px]'>
                <aside className='rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(15,23,42,0.45)] p-4'>
                    <div className='text-xs font-semibold uppercase tracking-[0.25em] text-[rgba(226,232,240,0.75)]'>Toolbar</div>
                    <div className='mt-3 flex flex-col gap-2'>
                        {tools.map((tool) => {
                            const isActive = tool.id === activeToolId;
                            return (
                                <button
                                    key={tool.id}
                                    type='button'
                                    onClick={() => setActiveToolId(tool.id)}
                                    className={clsx(
                                        'w-full rounded-lg border px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.18em] transition-all',
                                        isActive
                                            ? 'border-[rgba(236,233,254,0.65)] bg-[rgba(255,255,255,0.16)] text-white shadow-[0_0_0_1px_rgba(236,233,254,0.35)]'
                                            : 'border-transparent bg-[rgba(255,255,255,0.06)] text-[rgba(226,232,240,0.82)] hover:border-[rgba(236,233,254,0.35)] hover:text-white',
                                    )}
                                >
                                    <div className='flex items-center justify-between gap-3'>
                                        <span>{tool.name}</span>
                                        {!isActive ? <span className='text-[rgba(236,233,254,0.45)]'>→</span> : null}
                                    </div>
                                    {isActive && tool.description ? (
                                        <p className='mt-2 text-[11px] font-normal normal-case tracking-normal text-[rgba(226,232,240,0.88)]'>
                                            {tool.description}
                                        </p>
                                    ) : null}
                                </button>
                            );
                        })}
                    </div>
                </aside>

                <div className='flex flex-col gap-4'>
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={activeMode.id}
                            variants={ACTIVE_VARIANTS}
                            initial='initial'
                            animate='animate'
                            exit='exit'
                            className='rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(15,23,42,0.45)] p-5'
                        >
                            <div className='inline-flex items-center gap-2 rounded-full bg-[rgba(255,255,255,0.12)] px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-white'>
                                <span>{activeMode.icon}</span>
                                <span>{activeMode.title}</span>
                            </div>
                            <p className='mt-4 text-base leading-relaxed text-[rgba(226,232,240,0.9)]'>{activeMode.description}</p>
                            <div className='mt-5 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.28em] text-[rgba(226,232,240,0.7)]'>
                                <span className='rounded-full bg-[rgba(15,23,42,0.6)] px-3 py-1 font-mono text-[0.65rem] text-[rgba(255,255,255,0.78)]'>
                                    {activeMode.statusText}
                                </span>
                                {activeMode.loader ? (
                                    <div className='relative h-1 flex-1 overflow-hidden rounded-full bg-[rgba(255,255,255,0.18)]'>
                                        <motion.span
                                            key={`${activeMode.id}-progress`}
                                            className='absolute inset-y-0 left-0 rounded-full'
                                            style={{ backgroundColor: activeMode.accent }}
                                            initial={{ width: '0%' }}
                                            animate={{ width: '100%' }}
                                            transition={{ duration: Math.max((cycleDuration - 600) / 1000, 0.6), ease: 'easeInOut' }}
                                        />
                                    </div>
                                ) : null}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {activeTool ? (
                        <div className='rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(15,23,42,0.45)] p-4'>
                            <div className='text-xs font-semibold uppercase tracking-[0.25em] text-[rgba(226,232,240,0.75)]'>Active Tool</div>
                            <p className='mt-2 text-sm font-semibold text-white'>{activeTool.name}</p>
                            {activeTool.description ? (
                                <p className='mt-2 text-[13px] leading-relaxed text-[rgba(226,232,240,0.85)]'>{activeTool.description}</p>
                            ) : null}
                        </div>
                    ) : null}

                    {activeSection && activeSection.items.length > 0 ? (
                        <div className='rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(15,23,42,0.45)] p-4 lg:hidden'>
                            <div className='text-xs font-semibold uppercase tracking-[0.25em] text-[rgba(226,232,240,0.75)]'>Inspector</div>
                            <p className='mt-2 text-sm font-semibold text-white'>{activeSection.title}</p>
                            {['export', 'code'].includes(activeSection.id) ? (
                                <div className='mt-3 space-y-2'>
                                    {activeSection.items.map((item) => (
                                        <button
                                            key={item}
                                            type='button'
                                            className='flex w-full items-center justify-between rounded-lg border border-[rgba(255,255,255,0.14)] bg-[rgba(15,23,42,0.55)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgba(236,233,254,0.88)] transition-colors hover:border-[rgba(236,233,254,0.35)] hover:bg-[rgba(139,92,246,0.2)] hover:text-white'
                                        >
                                            <span>{item}</span>
                                            <span className='text-[rgba(236,233,254,0.85)]'>
                                                {activeSection.id === 'export' ? 'Export' : 'Preview'}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <ul className='mt-3 space-y-3 text-[12px] text-[rgba(226,232,240,0.82)]'>
                                    {activeSection.items.map((item) => {
                                        const itemId = slugify(item);
                                        const value = getInspectorValue(activeSection.id, itemId);
                                        return (
                                            <li key={item} className='rounded-lg border border-[rgba(255,255,255,0.14)] bg-[rgba(15,23,42,0.55)] px-3 py-3'>
                                                <div className='flex items-center justify-between text-[11px] uppercase tracking-[0.16em]'>
                                                    <span>{item}</span>
                                                    <span className='font-semibold text-[rgba(236,233,254,0.88)]'>{Math.round(value)}%</span>
                                                </div>
                                                <div className='relative mt-2 h-2 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.12)]'>
                                                    <div
                                                        className='pointer-events-none absolute inset-0 rounded-full bg-[rgba(139,92,246,0.55)]'
                                                        style={{ width: `${value}%` }}
                                                    />
                                                    <input
                                                        type='range'
                                                        min={0}
                                                        max={100}
                                                        step={1}
                                                        value={value}
                                                        onChange={(event) =>
                                                            handleInspectorValueChange(activeSection.id, itemId, event.target.value)
                                                        }
                                                        className='absolute inset-0 h-2 w-full cursor-pointer opacity-0'
                                                        aria-label={`${item} adjustment`}
                                                    />
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    ) : null}
                </div>

                <aside className='hidden flex-col gap-2 rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(15,23,42,0.45)] p-4 lg:flex'>
                    <div className='text-xs font-semibold uppercase tracking-[0.25em] text-[rgba(226,232,240,0.75)]'>Inspector</div>
                    <div className='mt-3 flex flex-col gap-2'>
                        {inspectorSections.map((section) => {
                            const isActive = section.id === activeSectionId;
                            return (
                                <button
                                    key={section.id}
                                    type='button'
                                    onClick={() => setActiveSectionId(section.id)}
                                    className={clsx(
                                        'w-full rounded-lg border px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.18em] transition-all',
                                        isActive
                                            ? 'border-[rgba(236,233,254,0.65)] bg-[rgba(255,255,255,0.16)] text-white shadow-[0_0_0_1px_rgba(236,233,254,0.35)]'
                                            : 'border-transparent bg-[rgba(255,255,255,0.06)] text-[rgba(226,232,240,0.8)] hover:border-[rgba(236,233,254,0.35)] hover:text-white',
                                    )}
                                >
                                    <div className='flex items-center justify-between gap-3'>
                                        <span>{section.title}</span>
                                        {!isActive ? <span className='text-[rgba(236,233,254,0.45)]'>→</span> : null}
                                    </div>
                                    {isActive && section.items.length > 0 ? (
                                        ['export', 'code'].includes(section.id) ? (
                                            <div className='mt-3 space-y-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(236,233,254,0.9)]'>
                                                {section.items.map((item) => (
                                                    <button
                                                        key={item}
                                                        type='button'
                                                        className='flex w-full items-center justify-between rounded-lg border border-[rgba(255,255,255,0.14)] bg-[rgba(15,23,42,0.55)] px-3 py-2 transition-colors hover:border-[rgba(236,233,254,0.35)] hover:bg-[rgba(139,92,246,0.2)] hover:text-white'
                                                    >
                                                        <span>{item}</span>
                                                        <span className='text-[rgba(236,233,254,0.85)]'>
                                                            {section.id === 'export' ? 'Export' : 'Preview'}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <ul className='mt-3 space-y-2 text-[11px] font-normal normal-case tracking-normal text-[rgba(226,232,240,0.86)]'>
                                                {section.items.map((item) => {
                                                    const itemId = slugify(item);
                                                    const value = getInspectorValue(section.id, itemId);
                                                    return (
                                                        <li key={item} className='rounded-lg border border-[rgba(255,255,255,0.14)] bg-[rgba(15,23,42,0.55)] px-3 py-3'>
                                                            <div className='flex items-center justify-between uppercase tracking-[0.14em]'>
                                                                <span>{item}</span>
                                                                <span className='font-semibold text-[rgba(236,233,254,0.88)]'>{Math.round(value)}%</span>
                                                            </div>
                                                            <div className='relative mt-2 h-2 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.12)]'>
                                                                <div
                                                                    className='pointer-events-none absolute inset-0 rounded-full bg-[rgba(139,92,246,0.55)]'
                                                                    style={{ width: `${value}%` }}
                                                                />
                                                                <input
                                                                    type='range'
                                                                    min={0}
                                                                    max={100}
                                                                    step={1}
                                                                    value={value}
                                                                    onChange={(event) => handleInspectorValueChange(section.id, itemId, event.target.value)}
                                                                    className='absolute inset-0 h-2 w-full cursor-pointer opacity-0'
                                                                    aria-label={`${item} adjustment`}
                                                                />
                                                            </div>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        )
                                    ) : null}
                                </button>
                            );
                        })}
                    </div>
                </aside>
            </div>

            <div className='rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(15,23,42,0.45)] p-4'>
                <div className='flex flex-wrap items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[rgba(226,232,240,0.75)]'>
                    <span>Bottom Controls</span>
                    {activeAction ? <span className='text-[rgba(255,255,255,0.85)]'>{activeAction.label}</span> : null}
                </div>
                <div className='mt-3 flex flex-wrap gap-2'>
                    {bottomActions.map((action) => {
                        const isActive = action.id === activeActionId;
                        return (
                            <button
                                key={action.id}
                                type='button'
                                onClick={() => setActiveActionId(action.id)}
                                className={clsx(
                                    'rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors',
                                    isActive
                                        ? 'border-[rgba(236,233,254,0.65)] bg-[rgba(255,255,255,0.2)] text-white shadow-[0_0_0_1px_rgba(236,233,254,0.35)]'
                                        : 'border-transparent bg-[rgba(255,255,255,0.08)] text-[rgba(226,232,240,0.8)] hover:border-[rgba(236,233,254,0.35)] hover:text-white',
                                )}
                            >
                                {action.label}
                            </button>
                        );
                    })}
                </div>
                {activeAction?.description ? (
                    <p className='mt-3 text-[12px] text-[rgba(226,232,240,0.85)]'>{activeAction.description}</p>
                ) : null}
            </div>

            <div className='flex flex-wrap items-center gap-2'>
                {modes.map((mode, index) => {
                    const isActive = index === activeIndex;
                    return (
                        <button
                            key={mode.id}
                            type='button'
                            onClick={() => setActiveIndex(index)}
                            className={clsx(
                                'group flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors',
                                isActive
                                    ? 'border-[rgba(236,233,254,0.7)] bg-[rgba(255,255,255,0.16)] text-white shadow-[0_0_0_1px_rgba(236,233,254,0.35)]'
                                    : 'border-transparent bg-[rgba(255,255,255,0.08)] text-[rgba(226,232,240,0.75)] hover:border-[rgba(236,233,254,0.35)] hover:text-white',
                            )}
                        >
                            <span
                                className='flex h-2.5 w-2.5 items-center justify-center rounded-full'
                                style={{ backgroundColor: mode.accent }}
                            />
                            {mode.shortTitle || mode.title}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
