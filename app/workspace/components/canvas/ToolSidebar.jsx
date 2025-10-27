'use client';

import clsx from 'clsx';
import { useMemo, useState } from 'react';
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
    const updateFrame = useCanvasStore((state) => state.updateFrame);
    const renameElement = useCanvasStore((state) => state.renameElement);
    const setSelectedTool = useCanvasStore((state) => state.setSelectedTool);
    const setActiveToolOverlay = useCanvasStore((state) => state.setActiveToolOverlay);
    const setSelectedFrame = useCanvasStore((state) => state.setSelectedFrame);
    const setSelectedElement = useCanvasStore((state) => state.setSelectedElement);

    const modeConfig = MODE_CONFIG[mode] ?? MODE_CONFIG.design;
    const tools = modeConfig.tools ?? [];

    const [editingTarget, setEditingTarget] = useState(null);
    const [draftName, setDraftName] = useState('');

    const frameTrees = useMemo(
        () =>
            frames.map((frame) => ({
                frame,
                nodes: buildElementTree(frame.elements ?? []),
            })),
        [frames],
    );

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
            updateFrame(editingTarget.frameId, { name: value || 'Untitled Frame' });
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
                <div className='flex flex-col gap-2'>
                    <p className='text-xs font-semibold uppercase tracking-[0.25em] text-[rgba(148,163,184,0.65)]'>Tools</p>
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
            </section>
        </aside>
    );
}
