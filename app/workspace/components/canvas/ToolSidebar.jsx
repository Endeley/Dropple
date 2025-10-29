'use client';

import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MODE_CONFIG } from './modeConfig';
import { useCanvasStore } from './context/CanvasStore';
import { getElementLabel } from './utils/elementFactory';

const POINTER_TOOLS = new Set([
    'pointer',
    'frame',
    'shape',
    'rect',
    'text',
    'image',
    'ai-generator',
    'canvas',
    'scene',
    'segment',
    'clip',
    'overlay',
    'component',
    'character',
    'script',
]);

const OVERLAY_TOOLS = {
    gradient: 'gradient',
    effects: 'effects',
    layers: 'layers',
    components: 'components',
    link: 'link',
    timeline: 'timeline',
};

const ELEMENT_ICONS = {
    text: '🅣',
    rect: '▭',
    shape: '▭',
    image: '🖼️',
    component: '🧩',
    overlay: '🌀',
    clip: '🎞️',
    script: '📝',
    character: '🎭',
    group: '🗂️',
};

const ELEMENT_LABELS = {
    text: 'Text',
    rect: 'Rectangle',
    shape: 'Rectangle',
    image: 'Image',
    component: 'Component',
    overlay: 'Overlay',
    clip: 'Clip',
    script: 'Script',
    character: 'Character',
    group: 'Group',
};

const DEFAULT_WAVEFORM = [0.24, 0.48, -0.4, -0.62, 0.32, 0.58, -0.26, 0.18, 0.42, -0.36, 0.51, -0.22, 0.33, 0.6, -0.41];
const TIMELINE_MODES = new Set(['animation', 'video', 'podcast']);
const DEFAULT_ASSET_FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'favorites', label: 'Favorites' },
    { id: 'canvas', label: 'Canvas' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'ai', label: 'AI' },
    { id: 'uploads', label: 'Uploads' },
];
const AI_GENERATOR_OPTIONS = [
    { id: 'image', label: 'Visual' },
    { id: 'component', label: 'Component' },
    { id: 'audio', label: 'Audio' },
    { id: 'overlay', label: 'Overlay' },
];

const AI_MODE_INTENTS = {
    image: {
        mode: 'image',
        badge: 'AI Visual',
        message: 'Opening Image mode so you can refine the generated visual…',
    },
    component: {
        mode: 'ux',
        badge: 'Component',
        message: 'Switching to UI/UX mode for component layout & code preview…',
    },
    audio: {
        mode: 'podcast',
        badge: 'Audio',
        message: 'Routing to Podcast mode to edit the generated audio timeline…',
    },
    overlay: {
        mode: 'video',
        badge: 'Timeline',
        message: 'Loading Video mode to place the overlay on timeline tracks…',
    },
};

const formatCategoryLabel = (value) => {
    if (!value) return 'Misc';
    const normalized = value.replace(/[-_]/g, ' ').trim();
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

function buildElementTree(elements, parentId = null) {
    if (!Array.isArray(elements)) return [];
    return elements
        .filter((element) => (element.parentId ?? null) === parentId)
        .map((element) => ({
            element,
            children: buildElementTree(elements, element.id),
        }));
}

function getFramePreviewStyle(frame) {
    const fillType = frame.backgroundFillType ?? (frame.backgroundImage ? 'image' : 'solid');
    const baseColor = frame.backgroundColor ?? '#0F172A';
    const layers = [];
    const sizes = [];
    const repeats = [];
    const positions = [];

    if (fillType === 'gradient') {
        const gradientType = frame.backgroundGradientType ?? 'linear';
        const start = frame.backgroundGradientStart ?? '#8B5CF6';
        const end = frame.backgroundGradientEnd ?? '#3B82F6';
        const angle = frame.backgroundGradientAngle ?? 45;
        let gradient;
        switch (gradientType) {
            case 'radial':
                gradient = `radial-gradient(circle, ${start} 0%, ${end} 100%)`;
                break;
            case 'conic':
                gradient = `conic-gradient(from ${angle}deg, ${start}, ${end})`;
                break;
            case 'linear':
            default:
                gradient = `linear-gradient(${angle}deg, ${start} 0%, ${end} 100%)`;
                break;
        }
        layers.push(gradient);
        sizes.push('cover');
        repeats.push('no-repeat');
        positions.push('center');
    } else if (fillType === 'image' && frame.backgroundImage) {
        layers.push(`url(${frame.backgroundImage})`);
        sizes.push(frame.backgroundFit ?? 'cover');
        repeats.push('no-repeat');
        positions.push('center');
    } else if (fillType === 'pattern' && frame.backgroundImage) {
        const scale = Math.max(frame.backgroundPatternScale ?? 1, 0.01) * 100;
        layers.push(`url(${frame.backgroundImage})`);
        sizes.push(`${scale}%`);
        repeats.push(frame.backgroundPatternRepeat ?? 'repeat');
        positions.push(`${frame.backgroundPatternOffsetX ?? 0}px ${frame.backgroundPatternOffsetY ?? 0}px`);
    }

    return {
        backgroundColor: baseColor,
        backgroundImage: layers.length ? layers.join(', ') : undefined,
        backgroundSize: layers.length ? sizes.join(', ') : undefined,
        backgroundRepeat: layers.length ? repeats.join(', ') : undefined,
        backgroundPosition: layers.length ? positions.join(', ') : undefined,
        backgroundBlendMode: layers.length ? frame.backgroundBlendMode ?? 'normal' : undefined,
    };
}

export default function ToolSidebar() {
    const mode = useCanvasStore((state) => state.mode);
    const frames = useCanvasStore((state) => state.frames);
    const selectedTool = useCanvasStore((state) => state.selectedTool);
    const activeToolOverlay = useCanvasStore((state) => state.activeToolOverlay);
    const selectedFrameId = useCanvasStore((state) => state.selectedFrameId);
    const selectedElementIds = useCanvasStore((state) => state.selectedElementIds);
    const assetLibrary = useCanvasStore((state) => state.assetLibrary);
    const timelineAssets = useCanvasStore((state) => state.timelineAssets);
    const uploadAssetToLibrary = useCanvasStore((state) => state.uploadAssetToLibrary);
    const generateAiAsset = useCanvasStore((state) => state.generateAiAsset);
    const placeAssetOnFrame = useCanvasStore((state) => state.placeAssetOnFrame);
    const placeAssetOnTimeline = useCanvasStore((state) => state.placeAssetOnTimeline);
    const toggleAssetFavorite = useCanvasStore((state) => state.toggleAssetFavorite);
    const removeAssetFromLibrary = useCanvasStore((state) => state.removeAssetFromLibrary);
    const setTimelinePlayhead = useCanvasStore((state) => state.setTimelinePlayhead);
    const playTimeline = useCanvasStore((state) => state.playTimeline);
    const updateFrame = useCanvasStore((state) => state.updateFrame);
    const renameElement = useCanvasStore((state) => state.renameElement);
    const setSelectedTool = useCanvasStore((state) => state.setSelectedTool);
    const setActiveToolOverlay = useCanvasStore((state) => state.setActiveToolOverlay);
    const setSelectedFrame = useCanvasStore((state) => state.setSelectedFrame);
    const setSelectedElement = useCanvasStore((state) => state.setSelectedElement);
    const setPosition = useCanvasStore((state) => state.setPosition);
    const setScale = useCanvasStore((state) => state.setScale);
    const sendModeIntent = useCanvasStore((state) => state.sendModeIntent);

    const modeConfig = MODE_CONFIG[mode] ?? MODE_CONFIG.design;
    const tools = modeConfig.tools ?? [];

    const [editingTarget, setEditingTarget] = useState(null);
    const [draftName, setDraftName] = useState('');
    const [assetFilter, setAssetFilter] = useState('all');
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiKind, setAiKind] = useState('image');
    const uploadInputRef = useRef(null);

    const isTimelineMode = TIMELINE_MODES.has(mode);
    const hasPendingGeneration = useMemo(
        () => assetLibrary.some((asset) => asset.source === 'ai' && asset.status !== 'ready'),
        [assetLibrary],
    );
    const [isGenerating, setIsGenerating] = useState(hasPendingGeneration);

    useEffect(() => {
        setIsGenerating(hasPendingGeneration);
    }, [hasPendingGeneration]);

    const frameTrees = useMemo(
        () =>
            frames.map((frame) => ({
                frame,
                nodes: buildElementTree(frame.elements ?? []),
            })),
        [frames],
    );
    const assetFilters = useMemo(() => {
        const entries = new Map(DEFAULT_ASSET_FILTERS.map((item) => [item.id, item]));
        assetLibrary.forEach((asset) => {
            const baseCategory =
                asset.category ?? (asset.type === 'timeline' ? 'timeline' : 'canvas');
            const normalized = (baseCategory ?? 'misc').toLowerCase();
            if (!entries.has(normalized)) {
                entries.set(normalized, { id: normalized, label: formatCategoryLabel(normalized) });
            }
            if (asset.source === 'ai' && !entries.has('ai')) {
                entries.set('ai', { id: 'ai', label: 'AI' });
            }
            if (asset.source === 'upload' && !entries.has('uploads')) {
                entries.set('uploads', { id: 'uploads', label: 'Uploads' });
            }
        });
        return Array.from(entries.values());
    }, [assetLibrary]);
    const filteredAssets = useMemo(() => {
        return assetLibrary.filter((asset) => {
            if (assetFilter === 'all') return true;
            if (assetFilter === 'favorites') return Boolean(asset.favorite);
            if (assetFilter === 'timeline') return asset.type === 'timeline';
            if (assetFilter === 'canvas') return asset.type !== 'timeline';
            if (assetFilter === 'ai') return asset.source === 'ai';
            if (assetFilter === 'uploads') return asset.source === 'upload';
            const category =
                (asset.category ?? (asset.type === 'timeline' ? 'timeline' : 'canvas')).toLowerCase();
            return category === assetFilter;
        });
    }, [assetLibrary, assetFilter]);
    const orderedAssets = useMemo(() => {
        const clone = [...filteredAssets];
        clone.sort((a, b) => {
            if (Boolean(b.favorite) !== Boolean(a.favorite)) {
                return Number(b.favorite) - Number(a.favorite);
            }
            const aTimestamp = a.metadata?.lastUsedAt ?? a.createdAt ?? '';
            const bTimestamp = b.metadata?.lastUsedAt ?? b.createdAt ?? '';
            return (bTimestamp ?? '').localeCompare(aTimestamp ?? '');
        });
        return clone;
    }, [filteredAssets]);
    const aiHistory = useMemo(() => {
        const seen = new Set();
        const prompts = [];
        orderedAssets.forEach((asset) => {
            if (asset.source !== 'ai') return;
            const prompt = asset.metadata?.aiPrompt;
            if (!prompt || seen.has(prompt)) return;
            seen.add(prompt);
            prompts.push(prompt);
        });
        return prompts.slice(0, 5);
    }, [orderedAssets]);

    const beginEditFrame = (frame) => {
        setEditingTarget({ type: 'frame', frameId: frame.id });
        setDraftName(frame.name ?? '');
    };

    const beginEditElement = (frameId, element) => {
        setEditingTarget({ type: 'element', frameId, elementId: element.id });
        setDraftName(getElementLabel(element));
    };

    const cancelEditing = () => {
        setEditingTarget(null);
        setDraftName('');
    };

    const commitEditing = () => {
        if (!editingTarget) return;
        const value = draftName.trim();
        if (editingTarget.type === 'frame') {
            updateFrame(editingTarget.frameId, { name: value || 'Untitled Frame' }, { historyLabel: 'Rename frame', source: 'sidebar' });
        } else if (editingTarget.type === 'element') {
            renameElement(editingTarget.frameId, editingTarget.elementId, value);
        }
        cancelEditing();
    };

    const handleNameKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            commitEditing();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            cancelEditing();
        }
    };

    const handleFocusFrame = useCallback(
        (frame) => {
            if (!frame) return;
            setSelectedFrame(frame.id);
            setScale(1);
            const nextPosition = {
                x: Math.round(-frame.x + 160),
                y: Math.round(-frame.y + 140),
            };
            setPosition(nextPosition);
        },
        [setPosition, setScale, setSelectedFrame],
    );

    const handleUploadClick = useCallback(() => {
        uploadInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback(
        (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    uploadAssetToLibrary({
                        name: file.name,
                        dataUrl: reader.result,
                        mime: file.type,
                    });
                }
            };
            reader.onloadend = () => {
                if (event.target) {
                    event.target.value = '';
                }
            };
            reader.readAsDataURL(file);
        },
        [uploadAssetToLibrary],
    );

    const handleGenerateAsset = useCallback(() => {
        const prompt = aiPrompt.trim();
        if (!prompt) return;
        const intent = AI_MODE_INTENTS[aiKind];
        if (intent) {
            sendModeIntent(intent.mode, {
                source: 'ai',
                badge: intent.badge,
                message: intent.message,
                payload: { prompt, kind: aiKind },
            });
        }
        setIsGenerating(true);
        generateAiAsset({ prompt, kind: aiKind });
        setAiPrompt('');
    }, [aiPrompt, aiKind, generateAiAsset, sendModeIntent]);

    const handleAssetPlace = useCallback(
        (asset, target = 'auto') => {
            if (!asset) return;
            let frameId = selectedFrameId ?? frames[0]?.id ?? null;
            if (!frameId && frames.length > 0) {
                frameId = frames[0].id;
                setSelectedFrame(frameId);
            }
            if (!frameId) return;
            if (target === 'timeline' || (target === 'auto' && asset.type === 'timeline')) {
                const label = placeAssetOnTimeline(asset.id, frameId, {});
                if (label) {
                    setTimelinePlayhead(frameId, 0, { resetTick: true });
                    if (isTimelineMode) {
                        playTimeline(frameId);
                    }
                }
                return;
            }
            const elementId = placeAssetOnFrame(asset.id, frameId, {});
            if (elementId) {
                setSelectedElement(frameId, elementId);
            }
        },
        [
            frames,
            isTimelineMode,
            placeAssetOnFrame,
            placeAssetOnTimeline,
            playTimeline,
            selectedFrameId,
            setSelectedElement,
            setSelectedFrame,
            setTimelinePlayhead,
        ],
    );

    const handleAssetDragStart = useCallback((event, asset) => {
        if (!asset || !event.dataTransfer) return;
        event.dataTransfer.setData(
            'application/x-dropple-asset',
            JSON.stringify({ assetId: asset.id, type: asset.type }),
        );
        event.dataTransfer.effectAllowed = 'copy';
    }, []);

    const handleToolClick = (tool) => {
        if (tool.id === 'comment') {
            const nextOverlay = activeToolOverlay === 'comment' ? null : 'comment';
            setSelectedTool(nextOverlay ? 'comment' : 'pointer');
            setActiveToolOverlay(nextOverlay);
            return;
        }

        const overlay = OVERLAY_TOOLS[tool.id];
        if (overlay) {
            setSelectedTool('pointer');
            setActiveToolOverlay(activeToolOverlay === overlay ? null : overlay);
            return;
        }

        if (POINTER_TOOLS.has(tool.id)) {
            setActiveToolOverlay(null);
            setSelectedTool(tool.id);
            return;
        }

        setActiveToolOverlay(null);
        setSelectedTool(tool.id);
    };

    const handleFrameSelect = (frameId) => {
        setSelectedTool('pointer');
        setActiveToolOverlay(null);
        setSelectedFrame(frameId);
    };

    const handleElementSelect = (frameId, elementId) => {
        setSelectedTool('pointer');
        setActiveToolOverlay(null);
        setSelectedFrame(frameId);
        setSelectedElement(frameId, elementId);
    };

    const renderElementNodes = (nodes, frameId, depth = 0) =>
        nodes.map(({ element, children }) => {
            const isSelected = selectedElementIds.includes(element.id);
            const editing =
                editingTarget?.type === 'element' &&
                editingTarget.frameId === frameId &&
                editingTarget.elementId === element.id;
            const icon = ELEMENT_ICONS[element.type] ?? '▫️';
            const name = editing ? draftName : element.name ?? ELEMENT_LABELS[element.type] ?? element.type;

            return (
                <div key={element.id}>
                    <div
                        role='button'
                        tabIndex={0}
                        onClick={() => {
                            if (editing) return;
                            handleElementSelect(frameId, element.id);
                        }}
                        className={clsx(
                            'ml-3 mt-2 flex items-center justify-between rounded-lg border px-3 py-1.5 text-xs uppercase tracking-[0.2em] transition-colors',
                            isSelected
                                ? 'border-[rgba(139,92,246,0.6)] bg-[rgba(139,92,246,0.25)] text-white'
                                : 'border-transparent text-[rgba(226,232,240,0.7)] hover:border-[rgba(139,92,246,0.35)] hover:text-white',
                        )}
                        style={{ marginLeft: depth * 16 + 12 }}
                    >
                        <div className='flex flex-1 items-center gap-2'>
                            <span className='text-base'>{icon}</span>
                            {editing ? (
                                <input
                                    autoFocus
                                    value={draftName}
                                    onChange={(event) => setDraftName(event.target.value)}
                                    onBlur={commitEditing}
                                    onKeyDown={handleNameKeyDown}
                                    className='flex-1 rounded-md border border-[rgba(148,163,184,0.25)] bg-[rgba(15,23,42,0.6)] px-2 py-1 text-[rgba(236,233,254,0.92)] focus:border-[rgba(139,92,246,0.6)] focus:outline-none'
                                    onClick={(event) => event.stopPropagation()}
                                />
                            ) : (
                                <span className='flex-1 truncate text-left normal-case tracking-normal text-sm text-[rgba(236,233,254,0.92)]'>
                                    {name}
                                </span>
                            )}
                        </div>
                        {!editing ? (
                            <button
                                type='button'
                                onClick={(event) => {
                                    event.stopPropagation();
                                    beginEditElement(frameId, element);
                                }}
                                className='ml-2 text-[rgba(148,163,184,0.7)] hover:text-white'
                                aria-label='Rename element'
                            >
                                ✏️
                            </button>
                        ) : null}
                    </div>
                    {children.length > 0 ? renderElementNodes(children, frameId, depth + 1) : null}
                </div>
            );
        });

    return (
        <aside className='pointer-events-auto hidden h-full w-80 flex-col border-r border-[rgba(148,163,184,0.15)] bg-[rgba(15,23,42,0.78)] px-5 py-6 text-sm text-[rgba(226,232,240,0.78)] backdrop-blur lg:flex'>
            <section>
                <div className='flex items-center justify-between'>
                    <div>
                        <p className='text-xs font-semibold uppercase tracking-[0.25em] text-[rgba(148,163,184,0.65)]'>Pages</p>
                        <p className='text-xs text-[rgba(226,232,240,0.55)]'>Manage canvas frames and layers.</p>
                    </div>
                </div>
                <ul className='mt-4 space-y-3'>
                    {frameTrees.map(({ frame, nodes }) => {
                        const isSelectedFrame = selectedFrameId === frame.id;
                        const previewStyle = getFramePreviewStyle(frame);
                        const editingFrame = editingTarget?.type === 'frame' && editingTarget.frameId === frame.id;
                        const frameName = editingFrame ? draftName : frame.name ?? 'Untitled Frame';
                        const frameTimelineCount = timelineAssets.filter((asset) => asset.frameId === frame.id).length;

                        return (
                            <li key={frame.id} className='rounded-2xl border border-[rgba(148,163,184,0.12)] bg-[rgba(15,23,42,0.6)] p-3'>
                                <div
                                    role='button'
                                    tabIndex={0}
                                    onClick={() => {
                                        if (editingFrame) return;
                                        handleFrameSelect(frame.id);
                                    }}
                                    className={clsx(
                                        'flex flex-col gap-2 rounded-xl border px-3 py-3 transition-colors',
                                        isSelectedFrame
                                            ? 'border-[rgba(139,92,246,0.6)] bg-[rgba(139,92,246,0.2)] text-white'
                                            : 'border-transparent hover:border-[rgba(139,92,246,0.35)] hover:text-white',
                                    )}
                                >
                                    <div className='h-14 w-full rounded-lg border border-[rgba(148,163,184,0.2)] shadow-inner' style={previewStyle} />
                                    {editingFrame ? (
                                        <input
                                            autoFocus
                                            value={draftName}
                                            onChange={(event) => setDraftName(event.target.value)}
                                            onBlur={commitEditing}
                                            onKeyDown={handleNameKeyDown}
                                            onClick={(event) => event.stopPropagation()}
                                            className='w-full rounded-md border border-[rgba(148,163,184,0.25)] bg-[rgba(15,23,42,0.6)] px-2 py-1 text-sm text-[rgba(236,233,254,0.92)] focus:border-[rgba(139,92,246,0.6)] focus:outline-none'
                                        />
                                    ) : (
                                        <div className='flex items-center justify-between text-sm text-[rgba(236,233,254,0.92)]'>
                                            <span className='truncate'>{frameName}</span>
                                            <button
                                                type='button'
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    beginEditFrame(frame);
                                                }}
                                                className='text-[rgba(148,163,184,0.7)] hover:text-white'
                                                aria-label='Rename frame'
                                            >
                                                ✏️
                                            </button>
                                        </div>
                                    )}
                                    <span className='text-[10px] uppercase tracking-[0.25em] text-[rgba(148,163,184,0.6)]'>
                                        {Math.round(frame.width)} × {Math.round(frame.height)}
                                    </span>
                                    <div className='mt-2 flex flex-wrap gap-2'>
                                        <button
                                            type='button'
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                handleFocusFrame(frame);
                                            }}
                                            className='rounded-md border border-[rgba(148,163,184,0.25)] px-2.5 py-1 text-[10px] uppercase tracking-[0.25em] text-[rgba(236,233,254,0.8)] hover:border-[rgba(139,92,246,0.45)] hover:text-white'
                                        >
                                            Focus
                                        </button>
                                        {frameTimelineCount > 0 ? (
                                            <button
                                                type='button'
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    setTimelinePlayhead(frame.id, 0, { resetTick: true });
                                                    playTimeline(frame.id);
                                                }}
                                                className='rounded-md border border-[rgba(59,130,246,0.35)] px-2.5 py-1 text-[10px] uppercase tracking-[0.25em] text-[rgba(191,219,254,0.85)] hover:border-[rgba(191,219,254,0.7)] hover:text-white'
                                            >
                                                Play timeline · {frameTimelineCount}
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                                {nodes.length > 0 ? (
                                    <div className='mt-2'>
                                        {renderElementNodes(nodes, frame.id)}
                                    </div>
                                ) : null}
                            </li>
                        );
                    })}
                </ul>
            </section>

            <div className='my-6 h-px border-b border-[rgba(148,163,184,0.18)]' />

    <section className='flex-1 overflow-y-auto'>
        <div className='flex flex-col gap-8 pb-4'>
            <div>
                <div className='flex flex-col gap-2'>
                    <p className='text-xs font-semibold uppercase tracking-[0.25em] text-[rgba(148,163,184,0.65)]'>
                        Tools
                    </p>
                    <p className='text-xs text-[rgba(226,232,240,0.55)]'>{modeConfig.description}</p>
                </div>
                <ul className='mt-4 flex flex-col gap-3'>
                    {tools.map((tool) => {
                        const overlay = OVERLAY_TOOLS[tool.id] ?? null;
                        const active = overlay ? activeToolOverlay === overlay : selectedTool === tool.id;
                        return (
                            <li key={tool.id}>
                                <button
                                    type='button'
                                    onClick={() => {
                                        cancelEditing();
                                        handleToolClick(tool);
                                    }}
                                    className={clsx(
                                        'w-full rounded-xl border px-3 py-2 text-left transition-colors',
                                        active
                                            ? 'border-[rgba(139,92,246,0.55)] bg-[rgba(139,92,246,0.2)] text-white'
                                            : 'border-transparent hover:border-[rgba(139,92,246,0.35)] hover:text-white',
                                    )}
                                >
                                    <p className='font-medium'>{tool.name}</p>
                                    <p className='text-xs text-[rgba(226,232,240,0.55)]'>{tool.description}</p>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div>
                <div className='flex items-start justify-between gap-2'>
                    <div>
                        <p className='text-xs font-semibold uppercase tracking-[0.25em] text-[rgba(148,163,184,0.65)]'>
                            Asset Library
                        </p>
                        <p className='text-xs text-[rgba(226,232,240,0.55)]'>
                            Drop assets onto the canvas or timeline. Generate new variants with AI.
                        </p>
                    </div>
                    <div className='flex flex-wrap items-center gap-2'>
                        <button
                            type='button'
                            onClick={handleUploadClick}
                            className='rounded-lg border border-[rgba(148,163,184,0.25)] px-3 py-1.5 text-[11px] uppercase tracking-[0.25em] text-[rgba(236,233,254,0.85)] transition-colors hover:border-[rgba(236,233,254,0.75)] hover:text-white'
                        >
                            Upload
                        </button>
                        <button
                            type='button'
                            onClick={() => setActiveToolOverlay('components')}
                            className='rounded-lg border border-[rgba(148,163,184,0.25)] px-3 py-1.5 text-[11px] uppercase tracking-[0.25em] text-[rgba(148,163,184,0.75)] transition-colors hover:border-[rgba(139,92,246,0.55)] hover:text-white'
                        >
                            Components
                        </button>
                    </div>
                </div>

                <div className='mt-3 flex flex-wrap gap-2'>
                    {assetFilters.map((filter) => {
                        const active = assetFilter === filter.id;
                        return (
                            <button
                                type='button'
                                key={filter.id}
                                onClick={() => setAssetFilter(filter.id)}
                                className={clsx(
                                    'rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] transition-colors',
                                    active
                                        ? 'border-[rgba(139,92,246,0.6)] bg-[rgba(139,92,246,0.18)] text-white'
                                        : 'border-[rgba(148,163,184,0.2)] text-[rgba(226,232,240,0.7)] hover:border-[rgba(139,92,246,0.45)] hover:text-white',
                                )}
                            >
                                {filter.label}
                            </button>
                        );
                    })}
                </div>

                <div className='mt-4 rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgba(15,23,42,0.68)] p-4'>
                    <div className='flex flex-wrap items-center justify-between gap-3'>
                        <p className='text-xs font-semibold uppercase tracking-[0.25em] text-[rgba(148,163,184,0.65)]'>
                            AI Generator
                        </p>
                        <div className='flex flex-wrap gap-2'>
                            {AI_GENERATOR_OPTIONS.map((option) => {
                                const active = aiKind === option.id;
                                return (
                                    <button
                                        type='button'
                                        key={option.id}
                                        onClick={() => setAiKind(option.id)}
                                        className={clsx(
                                            'rounded-md border px-2.5 py-1 text-[11px] uppercase tracking-[0.2em]',
                                            active
                                                ? 'border-[rgba(236,233,254,0.8)] text-white'
                                                : 'border-[rgba(148,163,184,0.35)] text-[rgba(226,232,240,0.75)] hover:border-[rgba(236,233,254,0.6)] hover:text-white',
                                        )}
                                    >
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className='mt-3 flex gap-2'>
                        <input
                            value={aiPrompt}
                            onChange={(event) => setAiPrompt(event.target.value)}
                            placeholder='e.g. neon gradient hero background'
                            className='flex-1 rounded-lg border border-[rgba(148,163,184,0.25)] bg-[rgba(15,23,42,0.7)] px-3 py-2 text-sm text-[rgba(236,233,254,0.9)] placeholder:text-[rgba(148,163,184,0.6)] focus:border-[rgba(139,92,246,0.6)] focus:outline-none'
                        />
                        <button
                            type='button'
                            onClick={handleGenerateAsset}
                            disabled={isGenerating || !aiPrompt.trim()}
                            className={clsx(
                                'rounded-lg px-3 py-2 text-[11px] uppercase tracking-[0.25em] transition-colors',
                                isGenerating || !aiPrompt.trim()
                                    ? 'cursor-not-allowed border border-[rgba(148,163,184,0.2)] text-[rgba(148,163,184,0.5)]'
                                    : 'border border-[rgba(139,92,246,0.6)] bg-[rgba(139,92,246,0.15)] text-white hover:border-[rgba(236,233,254,0.75)]',
                            )}
                        >
                            {isGenerating ? 'Generating…' : 'Generate'}
                        </button>
                    </div>
                    {aiHistory.length > 0 ? (
                        <div className='mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.25em] text-[rgba(148,163,184,0.6)]'>
                            {aiHistory.map((prompt) => (
                                <button
                                    key={prompt}
                                    type='button'
                                    onClick={() => setAiPrompt(prompt)}
                                    className='rounded-full border border-[rgba(148,163,184,0.25)] px-3 py-1 text-[rgba(226,232,240,0.7)] hover:border-[rgba(139,92,246,0.45)] hover:text-white'
                                >
                                    {prompt.length > 36 ? `${prompt.slice(0, 34)}…` : prompt}
                                </button>
                            ))}
                        </div>
                    ) : null}
                </div>

                <div className='mt-4 space-y-3'>
                    {orderedAssets.length === 0 ? (
                        <p className='text-xs text-[rgba(148,163,184,0.65)]'>
                            No assets yet. Upload files or run an AI prompt to start building your library.
                        </p>
                    ) : (
                        orderedAssets.map((asset) => (
                            <AssetCard
                                key={asset.id}
                                asset={asset}
                                isTimelineMode={isTimelineMode}
                                onInsertCanvas={() => handleAssetPlace(asset, 'canvas')}
                                onInsertTimeline={() => handleAssetPlace(asset, 'timeline')}
                                onFavoriteToggle={() => toggleAssetFavorite(asset.id)}
                                onRemove={
                                    asset.source === 'upload'
                                        ? () => removeAssetFromLibrary(asset.id)
                                        : undefined
                                }
                                onDragStart={(event) => handleAssetDragStart(event, asset)}
                            />
                        ))
                    )}
                </div>
                <input
                    ref={uploadInputRef}
                    type='file'
                    accept='image/*,audio/*,video/*'
                    className='hidden'
                    onChange={handleFileChange}
                />
            </div>
        </div>
    </section>
        </aside>
    );
}

function AssetCard({
    asset,
    isTimelineMode,
    onInsertCanvas,
    onInsertTimeline,
    onFavoriteToggle,
    onRemove,
    onDragStart,
}) {
    const isTimelineAsset = asset.type === 'timeline';
    const ready = asset.status !== 'generating';
    const descriptorParts = [];
    if (asset.source === 'ai') descriptorParts.push('AI');
    if (asset.source === 'upload') descriptorParts.push('Upload');
    if (asset.type === 'timeline') {
        descriptorParts.push(asset.timelineType === 'audio' ? 'Audio track' : 'Timeline clip');
    } else {
        descriptorParts.push(formatCategoryLabel(asset.category ?? 'Layer'));
    }
    const descriptor = descriptorParts.join(' • ');
    const prompt = asset.metadata?.aiPrompt;

    return (
        <div
            className={clsx(
                'rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgba(15,23,42,0.65)] p-3 transition-colors',
                ready ? 'hover:border-[rgba(139,92,246,0.45)]' : 'opacity-70',
            )}
            draggable={ready}
            onDragStart={(event) => {
                if (!ready) return;
                onDragStart?.(event, asset);
            }}
        >
            <div className='flex items-center gap-3'>
                <AssetPreview asset={asset} />
                <div className='min-w-0 flex-1'>
                    <div className='flex items-start justify-between gap-2'>
                        <div className='min-w-0'>
                            <p className='truncate text-sm font-semibold text-white'>{asset.label}</p>
                            <p className='truncate text-[11px] text-[rgba(148,163,184,0.7)]'>
                                {ready ? descriptor : 'Generating asset…'}
                            </p>
                            {ready && prompt ? (
                                <p className='mt-1 truncate text-[10px] uppercase tracking-[0.25em] text-[rgba(148,163,184,0.55)]'>
                                    “{prompt.length > 36 ? `${prompt.slice(0, 34)}…` : prompt}”
                                </p>
                            ) : null}
                        </div>
                        <div className='flex flex-col items-end gap-2'>
                            <button
                                type='button'
                                onClick={() => onFavoriteToggle?.()}
                                className={clsx(
                                    'text-lg leading-none transition-colors',
                                    asset.favorite
                                        ? 'text-[rgba(236,233,254,0.95)]'
                                        : 'text-[rgba(148,163,184,0.6)] hover:text-[rgba(236,233,254,0.85)]',
                                )}
                                aria-label={asset.favorite ? 'Unfavorite asset' : 'Favorite asset'}
                            >
                                {asset.favorite ? '★' : '☆'}
                            </button>
                            {onRemove ? (
                                <button
                                    type='button'
                                    onClick={onRemove}
                                    className='text-[10px] uppercase tracking-[0.25em] text-[rgba(148,163,184,0.6)] hover:text-[rgba(236,233,254,0.75)]'
                                >
                                    Remove
                                </button>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>

            <div className='mt-3 flex flex-wrap gap-2'>
                {!isTimelineAsset ? (
                    <button
                        type='button'
                        onClick={() => onInsertCanvas?.()}
                        disabled={!ready}
                        className={clsx(
                            'rounded-lg border px-3 py-1.5 text-[11px] uppercase tracking-[0.25em] transition-colors',
                            ready
                                ? 'border-[rgba(139,92,246,0.45)] text-[rgba(236,233,254,0.85)] hover:border-[rgba(236,233,254,0.75)] hover:text-white'
                                : 'cursor-not-allowed border-[rgba(148,163,184,0.25)] text-[rgba(148,163,184,0.5)]',
                        )}
                    >
                        Place on canvas
                    </button>
                ) : null}
                {isTimelineAsset ? (
                    <button
                        type='button'
                        onClick={() => onInsertTimeline?.()}
                        disabled={!ready}
                        className={clsx(
                            'rounded-lg border px-3 py-1.5 text-[11px] uppercase tracking-[0.25em] transition-colors',
                            ready
                                ? 'border-[rgba(59,130,246,0.45)] text-[rgba(191,219,254,0.85)] hover:border-[rgba(191,219,254,0.75)] hover:text-white'
                                : 'cursor-not-allowed border-[rgba(148,163,184,0.25)] text-[rgba(148,163,184,0.5)]',
                        )}
                    >
                        Add to timeline
                    </button>
                ) : null}
                {isTimelineAsset && !isTimelineMode ? (
                    <button
                        type='button'
                        onClick={() => onInsertCanvas?.()}
                        disabled={!ready}
                        className={clsx(
                            'rounded-lg border px-3 py-1.5 text-[11px] uppercase tracking-[0.25em] text-[rgba(148,163,184,0.7)] transition-colors hover:border-[rgba(139,92,246,0.35)] hover:text-white',
                            !ready && 'cursor-not-allowed border-[rgba(148,163,184,0.25)] text-[rgba(148,163,184,0.5)]',
                        )}
                    >
                        Convert to layer
                    </button>
                ) : null}
            </div>
        </div>
    );
}

function AssetPreview({ asset }) {
    if (asset.type === 'timeline') {
        return (
            <div className='flex h-14 w-16 flex-shrink-0 items-end overflow-hidden rounded-lg border border-[rgba(59,130,246,0.35)] bg-[rgba(15,23,42,0.78)] px-1.5 py-2'>
                <AssetWaveform waveform={asset.waveform} tone={asset.timelineType} />
            </div>
        );
    }

    const style = {};
    if (asset.preview?.kind === 'image') {
        style.backgroundImage = `url(${asset.preview.value})`;
        style.backgroundSize = 'cover';
        style.backgroundPosition = 'center';
    } else if (asset.preview?.kind === 'gradient') {
        style.backgroundImage = asset.preview.value;
    } else if (asset.props?.imageUrl) {
        style.backgroundImage = `url(${asset.props.imageUrl})`;
        style.backgroundSize = 'cover';
        style.backgroundPosition = 'center';
    } else if (asset.props?.fill && asset.props.fill.startsWith('linear-gradient')) {
        style.backgroundImage = asset.props.fill;
    } else {
        style.backgroundImage = 'linear-gradient(135deg, rgba(148,163,184,0.2) 0%, rgba(59,130,246,0.35) 100%)';
    }

    return (
        <div
            className='h-14 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-[rgba(148,163,184,0.25)] bg-[rgba(15,23,42,0.7)] shadow-[inset_0_0_20px_rgba(8,15,35,0.55)]'
            style={style}
        />
    );
}

function AssetWaveform({ waveform, tone }) {
    const values = Array.isArray(waveform) && waveform.length > 0 ? waveform : DEFAULT_WAVEFORM;
    const color =
        tone === 'audio'
            ? 'rgba(16,185,129,0.8)'
            : tone === 'overlay'
                ? 'rgba(59,130,246,0.8)'
                : 'rgba(148,163,184,0.8)';
    return (
        <div className='flex h-full w-full items-end gap-0.5'>
            {values.slice(0, 18).map((value, index) => {
                const height = Math.max(6, Math.round(Math.abs(value) * 36));
                return <div key={index} className='w-[3px] rounded-full' style={{ height, backgroundColor: color }} />;
            })}
        </div>
    );
}
