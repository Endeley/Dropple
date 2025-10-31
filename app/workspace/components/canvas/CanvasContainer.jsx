'use client';

import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CanvasLayer from './CanvasLayer';
import CanvasContextMenu from './CanvasContextMenu';
import FabricCanvas from './FabricCanvas';
import TimelineBar from './TimelineBar';
import { useCanvasStore } from './context/CanvasStore';
import { resolveTool } from './utils/toolBehaviors';
import { createElement } from './utils/elementFactory';
import { findFrameAtPoint, findElementAtPoint } from './utils/frameUtils';
import { MODE_ASSETS, MODE_CANVAS_BEHAVIOR, MODE_CONFIG } from './modeConfig';
import { getVideoTimelineStyle, getAnimationTimelineStyle, getPodcastTimelineStyle } from './utils/timelineStyles';

const SCALE_STEP = 1.1;
const MIN_SCALE = 0.25;
const MAX_SCALE = 4;
const FALLBACK_ACCENT = '#6366F1';
const DEFAULT_POSITION = Object.freeze({ x: 0, y: 0 });
const NOOP = () => {};

const parseColor = (value) => {
    if (typeof value !== 'string' || !value) {
        return { r: 99, g: 102, b: 241 };
    }
    if (value.startsWith('#')) {
        const hex = value.replace('#', '');
        const normalized = hex.length === 3 ? hex.split('').map((char) => char + char).join('') : hex;
        const r = parseInt(normalized.slice(0, 2), 16);
        const g = parseInt(normalized.slice(2, 4), 16);
        const b = parseInt(normalized.slice(4, 6), 16);
        return { r, g, b };
    }
    const match = value.match(/rgba?\(([^)]+)\)/);
    if (match) {
        const [r = '99', g = '102', b = '241'] = match[1].split(',').map((segment) => segment.trim());
        return { r: Number(r), g: Number(g), b: Number(b) };
    }
    return { r: 99, g: 102, b: 241 };
};

const toRgba = (value, alpha = 1) => {
    const { r, g, b } = parseColor(value);
    const safeAlpha = Math.max(0, Math.min(1, alpha));
    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${safeAlpha})`;
};

const humanizeModeName = (value) => {
    if (!value) return 'Mode';
    return value
        .split('-')
        .map((segment) => {
            if (!segment) return segment;
            if (segment.length <= 2) {
                return segment.toUpperCase();
            }
            return segment.charAt(0).toUpperCase() + segment.slice(1);
        })
        .join(' ');
};

const snapValueToGrid = (value, grid) => {
    if (!grid || grid <= 0) return value;
    return Math.round(value / grid) * grid;
};

const applySnappingToPoint = (point, snapping = {}) => {
    if (!snapping) return point;
    const next = { ...point };
    if (snapping.grid) {
        next.x = snapValueToGrid(next.x, snapping.grid);
        next.y = snapValueToGrid(next.y, snapping.grid);
    }
    return next;
};

const formatSecondsValue = (value) => {
    const seconds = Math.max(0, Number.isFinite(value) ? value : 0);
    if (seconds >= 60) {
        const minutes = Math.floor(seconds / 60);
        const remainder = seconds - minutes * 60;
        return `${minutes}:${remainder.toFixed(1).padStart(4, '0')}`;
    }
    return seconds.toFixed(2);
};

export default function CanvasContainer() {
    const viewportRef = useRef(null);
    const isPointerDown = useRef(false);
    const lastPointer = useRef({ x: 0, y: 0 });
   const fileInputRef = useRef(null);
   const [pendingImageElement, setPendingImageElement] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const mode = useCanvasStore((state) => state.mode);
    const canvasBehavior = MODE_CANVAS_BEHAVIOR[mode] ?? MODE_CANVAS_BEHAVIOR.default;
    const canvasKind = canvasBehavior.kind ?? 'board';
    const isTimelineWorkspace = canvasKind === 'timeline';
    const isWaveformWorkspace = canvasKind === 'waveform';
    const useFabricCanvas = Boolean(
        canvasBehavior.usesFabric || canvasKind === 'fabric' || canvasKind === 'timeline' || canvasKind === 'frame',
    );
    const timelineBehavior = canvasBehavior.timeline ?? null;
    const scale = useCanvasStore((state) => state.scale ?? 1);
    const setScale = useCanvasStore((state) => state.setScale) ?? NOOP;
    const rawPosition = useCanvasStore((state) => state.position);
    const position = rawPosition && typeof rawPosition === 'object' ? rawPosition : DEFAULT_POSITION;
    const setPosition = useCanvasStore((state) => state.setPosition) ?? NOOP;
    const selectedTool = useCanvasStore((state) => state.selectedTool);
    const gridVisible = useCanvasStore((state) => state.gridVisible);
    const gridSize = useCanvasStore((state) => state.gridSize);
    const isModeSwitching = useCanvasStore((state) => state.isModeSwitching);
   const isSceneHydrating = useCanvasStore((state) => state.isSceneHydrating);
   const sceneSnapshot = useCanvasStore((state) => state.sceneSnapshot);
    const modeTransitionIntent = useCanvasStore((state) => state.modeTransitionIntent);
    const clearModeTransitionIntent = useCanvasStore((state) => state.clearModeTransitionIntent);

    const creationCursor = useMemo(() => {
        if (isTimelineWorkspace || isWaveformWorkspace) return false;
        return ['shape', 'rect', 'text', 'image', 'ai-generator', 'component', 'overlay', 'clip', 'script', 'comment', 'frame', 'canvas', 'scene', 'segment'].includes(
            selectedTool,
        );
    }, [isTimelineWorkspace, isWaveformWorkspace, selectedTool]);
    const overlayEngaged = isModeSwitching || isSceneHydrating;

    useEffect(() => {
        if (overlayEngaged) {
            setIsTransitioning(true);
            return;
        }
        const timeoutId = window.setTimeout(() => {
            setIsTransitioning(false);
        }, 240);
        return () => window.clearTimeout(timeoutId);
    }, [overlayEngaged]);

    useEffect(() => {
        if (overlayEngaged || isTransitioning || !modeTransitionIntent) return undefined;
        const timeoutId = window.setTimeout(() => {
            clearModeTransitionIntent();
        }, 180);
        return () => window.clearTimeout(timeoutId);
    }, [overlayEngaged, isTransitioning, modeTransitionIntent, clearModeTransitionIntent]);

    useEffect(() => {
        if (useFabricCanvas) return undefined;
        const viewport = viewportRef.current;
        if (!viewport) return undefined;

        const handlePointerMove = (event) => {
            if (!isPointerDown.current) return;
            const deltaX = event.clientX - lastPointer.current.x;
            const deltaY = event.clientY - lastPointer.current.y;
            setPosition((prev) => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
            lastPointer.current = { x: event.clientX, y: event.clientY };
        };

        const handlePointerUp = () => {
            isPointerDown.current = false;
        };

        viewport.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);

        return () => {
            viewport.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [setPosition, useFabricCanvas]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                const store = useCanvasStore.getState();
                store.setSelectedTool('pointer');
                store.setActiveToolOverlay(null);
            }
        };
        globalThis.addEventListener('keydown', handleKeyDown);
        return () => globalThis.removeEventListener('keydown', handleKeyDown);
    }, []);
    useEffect(() => {
        if (!pendingImageElement) return;
        const input = fileInputRef.current;
        if (!input) return;

        // Reset value so selecting the same file twice still triggers change event
        input.value = '';
        input.click();
    }, [pendingImageElement]);

    const handleImageFileChange = useCallback(
        (event) => {
            const current = pendingImageElement;
            const input = event.target;
            if (!current) {
                if (input) input.value = '';
                return;
            }

            const file = input?.files?.[0];
            if (!file) {
                setPendingImageElement(null);
                if (input) input.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    const store = useCanvasStore.getState();
                    store.updateElementProps(current.frameId, current.elementId, {
                        imageUrl: reader.result,
                        fill: 'transparent',
                    });
                }
                setPendingImageElement(null);
                if (input) input.value = '';
            };
            reader.onerror = () => {
                setPendingImageElement(null);
                if (input) input.value = '';
            };
            reader.readAsDataURL(file);
        },
        [pendingImageElement],
    );

    const handleWheel = useCallback(
        (event) => {
            const viewport = viewportRef.current;
            if (!viewport) return;
            event.preventDefault();

            if (event.ctrlKey || event.metaKey) {
                const rect = viewport.getBoundingClientRect();
                const pointer = {
                    x: event.clientX - rect.left,
                    y: event.clientY - rect.top,
                };
                const oldScale = scale;
                const mousePointTo = {
                    x: (pointer.x - position.x) / oldScale,
                    y: (pointer.y - position.y) / oldScale,
                };

                const direction = event.deltaY > 0 ? -1 : 1;
                const nextScale = direction > 0 ? oldScale * SCALE_STEP : oldScale / SCALE_STEP;
                const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, nextScale));

                setScale(clampedScale);
                setPosition({
                    x: pointer.x - mousePointTo.x * clampedScale,
                    y: pointer.y - mousePointTo.y * clampedScale,
                });
            } else {
                setPosition((prev) => ({
                    x: prev.x + event.deltaX,
                    y: prev.y + event.deltaY,
                }));
            }
        },
        [position, scale, setPosition, setScale],
    );

    useEffect(() => {
        if (useFabricCanvas) return undefined;
        const viewport = viewportRef.current;
        if (!viewport) return undefined;

        const listener = (event) => {
            handleWheel(event);
        };

        viewport.addEventListener('wheel', listener, { passive: false });
        return () => {
            viewport.removeEventListener('wheel', listener);
        };
    }, [handleWheel, useFabricCanvas]);

    const handlePointerDown = (event) => {
        const store = useCanvasStore.getState();
        const currentTool = store.selectedTool || 'pointer';
        const viewport = viewportRef.current;
        if (!viewport) return;

        const rect = viewport.getBoundingClientRect();
        const canvasPoint = {
            x: (event.clientX - rect.left - store.position.x) / store.scale,
            y: (event.clientY - rect.top - store.position.y) / store.scale,
        };

        if (currentTool === 'comment') {
            const targetFrame = findFrameAtPoint(store.frames, canvasPoint);
            if (targetFrame) {
                const targetElement = findElementAtPoint(targetFrame, canvasPoint);
                if (targetElement) {
                    store.setSelectedElement(targetFrame.id, targetElement.id);
                } else {
                    store.setSelectedFrame(targetFrame.id);
                }
                store.setActiveToolOverlay('comment');
            }
            return;
        }

        const action = resolveTool(currentTool, mode);
        const primaryButton = event.button === 0;

        if (primaryButton && action.type !== 'pointer') {
            event.preventDefault();

            if (action.type === 'frame') {
                const defaults = canvasBehavior.frameDefaults ?? {};
                const width = action.width ?? defaults.width ?? 960;
                const height = action.height ?? defaults.height ?? 640;
                const snappedPoint = applySnappingToPoint(canvasPoint, canvasBehavior.snapping);
                const newFrame = store.addFrameAt(
                    {
                        x: snappedPoint.x - width / 2,
                        y: snappedPoint.y - height / 2,
                    },
                    { width, height },
                );
                if (newFrame) {
                    store.setSelectedFrame(newFrame.id);
                }
                return;
            }

            if (action.type === 'element') {
                let targetFrame = findFrameAtPoint(store.frames, canvasPoint);
                if (!targetFrame) {
                    targetFrame = store.addFrameAt(
                        {
                            x: canvasPoint.x - 480,
                            y: canvasPoint.y - 320,
                        },
                        { width: 960, height: 640 },
                    );
                }

                if (targetFrame) {
                    const snappedPoint = applySnappingToPoint(canvasPoint, canvasBehavior.snapping);
                    const element = createElement(action.elementType, targetFrame, snappedPoint, {
                        mode,
                        preset: action.preset,
                    });
                    store.addElementToFrame(targetFrame.id, element);
                    store.setSelectedElement(targetFrame.id, element.id);
                    if (selectedTool === 'image') {
                        setPendingImageElement({ frameId: targetFrame.id, elementId: element.id });
                    }
                    if (selectedTool === 'ai-generator') {
                        const baseWidth = Math.max(360, element.props?.width ?? 320);
                        const baseHeight = Math.max(160, element.props?.height ?? 160);
                        const storeAfterInsert = useCanvasStore.getState();
                        storeAfterInsert.updateElementProps(targetFrame.id, element.id, {
                            text: 'Generating AI copy…',
                            width: baseWidth,
                            height: baseHeight,
                        });

                        setTimeout(() => {
                            const promptMessage = 'Describe the copy you want generated for this block:';
                            const defaultPrompt =
                                'Write a short Dropple landing page headline and supporting sentence.';
                            const userInput =
                                'window' in globalThis ? globalThis.window.prompt(promptMessage, defaultPrompt) : null;
                            const instructions =
                                userInput && userInput.trim().length > 0 ? userInput.trim() : defaultPrompt;

                            const storeAfterPrompt = useCanvasStore.getState();
                            storeAfterPrompt.updateElementProps(targetFrame.id, element.id, {
                                text: 'Generating AI copy…',
                                width: baseWidth,
                            });

                            fetch('/api/ai', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    type: 'text',
                                    prompt: instructions,
                                }),
                            })
                                .then(async (response) => {
                                    if (!response.ok) throw new Error('Failed to generate text');
                                    const data = await response.json();
                                    return data.text ?? instructions;
                                })
                                .catch(() => instructions)
                                .then((generatedText) => {
                                    const latestStore = useCanvasStore.getState();
                                    latestStore.updateElementProps(targetFrame.id, element.id, {
                                        text: generatedText,
                                        width: baseWidth,
                                    });
                                });
                        }, 0);
                    }
                }
                return;
            }
        }

        const shouldPan = event.button === 1 || event.button === 2 || event.altKey;
        if (shouldPan) {
            isPointerDown.current = true;
            lastPointer.current = { x: event.clientX, y: event.clientY };
        } else if (action.type === 'pointer' && primaryButton) {
            store.clearSelection();
        }
    };

    const handleCanvasContextMenu = useCallback((event) => {
        const viewport = viewportRef.current;
        if (!viewport) return;
        event.preventDefault();
        const storeState = useCanvasStore.getState();
        const rect = viewport.getBoundingClientRect();
        const canvasPoint = {
            x: (event.clientX - rect.left - storeState.position.x) / storeState.scale,
            y: (event.clientY - rect.top - storeState.position.y) / storeState.scale,
        };
        storeState.setContextMenu({
            type: 'canvas',
            position: { x: event.clientX, y: event.clientY },
            canvasPoint,
        });
    }, []);

    const modeAsset = MODE_ASSETS[mode] ?? {};
    const accentColor = modeTransitionIntent?.accent ?? modeAsset.accent ?? FALLBACK_ACCENT;

    const gridBackground = useMemo(() => {
        if (!gridVisible || gridSize <= 0) {
            return {};
        }
        const scaledSize = gridSize * scale;
        const offsetX = ((position.x % scaledSize) + scaledSize) % scaledSize;
        const offsetY = ((position.y % scaledSize) + scaledSize) % scaledSize;
        const lineColor = toRgba(accentColor, 0.14);
        const strongLine = toRgba(accentColor, 0.32);
        const major = gridSize * 4 * scale;
        return {
            backgroundImage: `linear-gradient(to right, ${lineColor} 1px, transparent 1px), linear-gradient(to bottom, ${lineColor} 1px, transparent 1px), linear-gradient(to right, ${strongLine} 1px, transparent 1px), linear-gradient(to bottom, ${strongLine} 1px, transparent 1px)`,
            backgroundSize: `${scaledSize}px ${scaledSize}px, ${scaledSize}px ${scaledSize}px, ${major}px ${major}px, ${major}px ${major}px`,
            backgroundPosition: `${offsetX}px ${offsetY}px, ${offsetX}px ${offsetY}px, ${offsetX}px ${offsetY}px, ${offsetX}px ${offsetY}px`,
        };
    }, [gridVisible, gridSize, position.x, position.y, scale, accentColor]);
    const showOverlay = overlayEngaged || isTransitioning;
    const thumbnail = modeTransitionIntent?.thumbnail ?? modeAsset.thumbnail ?? null;
    const modeConfig = MODE_CONFIG[mode] ?? null;
    const modeLabel = modeTransitionIntent?.label ?? modeConfig?.label ?? humanizeModeName(mode);
    const modeDescription = modeTransitionIntent?.description ?? modeConfig?.description ?? 'Switching creative environment…';
    const overlayMessage =
        modeTransitionIntent?.message ??
        (isSceneHydrating ? 'Restoring saved scene…' : 'Preparing tools & panels…');
    const overlayBadge = modeTransitionIntent?.badge ?? null;
    const canvasShellClass = clsx(
        'relative h-full w-full overflow-hidden bg-[var(--mode-canvas-bg)] transform-gpu transition-[opacity,transform,filter] duration-300 ease-out will-change-transform',
        showOverlay ? 'pointer-events-none opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100',
    );
    const overlayElement = (
        <ModeTransitionOverlay
            active={showOverlay}
            blocking={overlayEngaged}
            accent={accentColor}
            label={modeLabel}
            description={modeDescription}
            message={overlayMessage}
            badge={overlayBadge}
            thumbnail={thumbnail}
            scene={sceneSnapshot}
        />
    );

    let workspace = null;

    if (isWaveformWorkspace) {
        workspace = <WaveformWorkspace timelineBehavior={timelineBehavior} accent={accentColor} />;
    } else if (isTimelineWorkspace && useFabricCanvas) {
        workspace = (
            <div className='flex h-full w-full flex-col'>
                <div className='relative flex-1'>
                    <div className={canvasShellClass} style={{ overscrollBehavior: 'none' }}>
                        <FabricCanvas />
                    </div>
                    {overlayElement}
                </div>
                <TimelineWorkspace mode={mode} accent={accentColor} timelineBehavior={timelineBehavior} />
            </div>
        );
    } else if (useFabricCanvas) {
        workspace = (
            <div className='relative h-full w-full'>
                <div className={canvasShellClass} style={{ overscrollBehavior: 'none' }}>
                    <FabricCanvas />
                </div>
                {overlayElement}
            </div>
        );
    } else {
        workspace = (
            <div
                ref={viewportRef}
                data-canvas-viewport
                className={clsx(
                    canvasShellClass,
                    creationCursor ? 'cursor-crosshair' : 'cursor-default',
                )}
                style={{
                    ...gridBackground,
                    overscrollBehavior: 'none',
                }}
                onPointerDown={handlePointerDown}
                onContextMenu={handleCanvasContextMenu}
            >
                <div
                    className='absolute left-0 top-0 origin-top-left'
                    style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }}
                >
                    <CanvasLayer />
                </div>
                <div
                    className='pointer-events-none absolute inset-0'
                    style={{ background: `radial-gradient(circle at top, ${toRgba(accentColor, canvasBehavior.heavy ? 0.22 : 0.12)}, transparent 55%)` }}
                />
                {overlayElement}
            </div>
        );
    }

    return (
        <>
            {workspace}
            <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                className='hidden'
                onChange={handleImageFileChange}
            />
            <CanvasContextMenu />
        </>
    );
}

function ModeTransitionOverlay({ active, blocking, accent, label, description, message, thumbnail, scene, badge }) {
    const overlayClass = clsx(
        'pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-out',
        active ? 'opacity-100' : 'opacity-0',
    );
    return (
        <div className={overlayClass} style={{ pointerEvents: blocking ? 'auto' : 'none' }} aria-hidden={!blocking}>
            <div className='w-[min(420px,92%)] rounded-3xl border border-[var(--mode-border)] bg-[var(--mode-panel-bg)] p-6 text-[var(--mode-text)] shadow-[0_20px_60px_rgba(8,15,35,0.55)] backdrop-blur-xl'>
                <div className='flex flex-col gap-5'>
                    <div className='flex items-start gap-4'>
                        <div className='relative h-20 w-28 overflow-hidden rounded-2xl border border-[var(--mode-border)] bg-slate-900/70'>
                            <ModePreviewMedia thumbnail={thumbnail} accent={accent} scene={scene} />
                        </div>
                        <div className='flex flex-1 flex-col gap-1'>
                            <div className='flex items-center gap-2'>
                                <span className='text-[11px] uppercase tracking-[0.45em] text-[var(--mode-text)]/45'>Mode Switch</span>
                                {badge ? (
                                    <span className='rounded-full border border-white/15 bg-white/10 px-2 py-[2px] text-[10px] font-semibold uppercase tracking-[0.35em] text-[var(--mode-text)]/70'>
                                        {badge}
                                    </span>
                                ) : null}
                            </div>
                            <p className='text-lg font-semibold leading-tight'>{`Entering ${label}`}</p>
                            <p className='text-xs text-[var(--mode-text)]/70 leading-relaxed'>{description}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-xs text-[var(--mode-text)]/80 sm:text-sm'>
                        <span className='relative flex h-2 w-2 shrink-0'>
                            <span
                                className='absolute inline-flex h-full w-full animate-ping rounded-full opacity-60'
                                style={{ backgroundColor: accent }}
                            />
                            <span className='relative inline-flex h-2 w-2 rounded-full' style={{ backgroundColor: accent }} />
                        </span>
                        <span className='flex-1 text-left'>{message}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ModePreviewMedia({ thumbnail, accent, scene }) {
    if (thumbnail) {
        return (
            <>
                <div
                    className='absolute inset-0 bg-cover bg-center'
                    style={{ backgroundImage: `url(${thumbnail})` }}
                />
                <div className='absolute inset-0 bg-slate-950/35' />
            </>
        );
    }

    if (Array.isArray(scene) && scene.length) {
        return (
            <div className='absolute inset-0 bg-slate-900/80'>
                {scene.slice(0, 3).map((frame, index) => (
                    <div
                        key={frame.id ?? index}
                        className='absolute rounded-xl border border-[var(--mode-border)] bg-slate-800/70 shadow-lg'
                        style={{
                            top: 8 + index * 6,
                            left: 8 + index * 10,
                            width: 76,
                            height: 52,
                            transform: `scale(${1 - index * 0.08})`,
                            transformOrigin: 'top left',
                        }}
                    >
                        <div className='absolute inset-3 rounded-lg bg-white/8' />
                        <div className='absolute left-4 right-4 top-4 h-1.5 rounded-full bg-white/20' />
                        <div className='absolute left-4 right-6 top-7 h-1.5 rounded-full bg-white/15' />
                        <div className='absolute bottom-4 left-4 right-4 h-6 rounded-md bg-white/10' />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className='absolute inset-0 bg-linear-to-br from-slate-800/80 via-slate-900/80 to-slate-950/90'>
            <div
                className='absolute inset-0 opacity-70'
                style={{ background: `radial-gradient(circle at 20% 20%, ${accent}40, transparent 60%)` }}
            />
        </div>
    );
}

function TimelineWorkspace({ mode, accent, timelineBehavior, variant }) {
    const frames = useCanvasStore((state) => state.frames);
    const selectedFrameId = useCanvasStore((state) => state.selectedFrameId) ?? frames[0]?.id ?? null;
    const setSelectedFrame = useCanvasStore((state) => state.setSelectedFrame);
    const timelineAssets = useCanvasStore((state) => state.timelineAssets);
    const timelinePlayback = useCanvasStore((state) => state.timelinePlayback);
    const playTimeline = useCanvasStore((state) => state.playTimeline);
    const pauseTimeline = useCanvasStore((state) => state.pauseTimeline);
    const setTimelinePlayhead = useCanvasStore((state) => state.setTimelinePlayhead);
    const setTimelineLoop = useCanvasStore((state) => state.setTimelineLoop);
    const setTimelineSpeed = useCanvasStore((state) => state.setTimelineSpeed);
    const isSceneHydrating = useCanvasStore((state) => state.isSceneHydrating);
    const finishSceneHydration = useCanvasStore((state) => state.finishSceneHydration);

    const resolvedFrame = useMemo(
        () => frames.find((frame) => frame.id === selectedFrameId) ?? frames[0] ?? null,
        [frames, selectedFrameId],
    );

    const isVideoVariant = variant === 'video' || mode === 'video';

    useEffect(() => {
        if (!isSceneHydrating || !resolvedFrame) return undefined;
        const timeoutId = window.setTimeout(() => {
            finishSceneHydration();
        }, 200);
        return () => window.clearTimeout(timeoutId);
    }, [isSceneHydrating, resolvedFrame, finishSceneHydration]);

    const frameAssets = useMemo(() => {
        if (!resolvedFrame) return [];
        return timelineAssets.filter((asset) => asset.frameId === resolvedFrame.id);
    }, [timelineAssets, resolvedFrame]);

    const totalDuration = useMemo(() => {
        if (!resolvedFrame) return 1;
        if (resolvedFrame.timelineDuration) return resolvedFrame.timelineDuration;
        return frameAssets.reduce(
            (acc, asset) => Math.max(acc, (asset.offset ?? 0) + (asset.duration ?? 0)),
            1,
        );
    }, [frameAssets, resolvedFrame]);

    const styleResolver = useMemo(() => {
        if (mode === 'animation' || mode === 'cartoon') return getAnimationTimelineStyle;
        return getVideoTimelineStyle;
    }, [mode]);

    const containerClass = clsx(
        'border-t',
        isVideoVariant
            ? 'px-6 py-5 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
            : 'px-5 py-4 text-xs',
    );

    if (!resolvedFrame) {
        return (
            <div
                className={containerClass}
                style={{
                    borderColor: 'var(--mode-border)',
                    background: isVideoVariant ? 'rgba(8,10,19,0.95)' : 'var(--mode-panel-bg)',
                    color: 'var(--mode-text)',
                }}
            >
                Create a frame to start building your timeline.
            </div>
        );
    }

    const isActive = timelinePlayback.frameId === resolvedFrame.id;
    const isPlaying = isActive && timelinePlayback.isPlaying;

    const handleSelectFrame = (frameId) => {
        if (frameId) {
            setSelectedFrame(frameId);
        }
    };

    const trackConfig = {
        order: timelineBehavior?.tracks,
        labels: timelineBehavior?.labels,
    };

    const navButtonClass = clsx(
        'rounded-md border px-3 py-1 text-[10px] uppercase tracking-[0.25em] transition-colors',
        isVideoVariant
            ? 'border-white/15 bg-white/5 text-white/80 hover:border-white/30 hover:text-white'
            : 'hover:bg-[var(--mode-accent-soft)]',
    );
    const playButtonClass = clsx(
        'rounded-md border px-3 py-1 text-[10px] uppercase tracking-[0.3em] transition-colors',
        isVideoVariant
            ? 'border-[var(--mode-accent)] bg-[var(--mode-accent-soft)] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.05)]'
            : 'border-[var(--mode-accent)] text-[var(--mode-text)]',
    );
    const secondaryButtonClass = clsx(
        'rounded-md border px-3 py-1 text-[10px] uppercase tracking-[0.3em] transition-colors',
        isVideoVariant
            ? 'border-white/15 text-white/75 hover:border-white/30 hover:text-white'
            : 'border-[var(--mode-border)] text-[var(--mode-text)] hover:border-[var(--mode-accent)]',
    );
    const loopButtonClass = clsx(
        'rounded-md border px-3 py-1 text-[10px] uppercase tracking-[0.3em] transition-colors',
        isVideoVariant
            ? timelinePlayback.loop
                ? 'border-white/30 bg-white/15 text-white'
                : 'border-white/15 text-white/70 hover:border-white/30 hover:text-white'
            : 'border-[var(--mode-border)] text-[var(--mode-text)] hover:border-[var(--mode-accent)]',
    );
    const speedSelectClass = clsx(
        'rounded-md border px-2 py-1 text-[10px] focus:outline-none',
        isVideoVariant
            ? 'border-white/15 bg-white/5 text-white/75 focus:border-white/35'
            : 'border-[var(--mode-border)] bg-[var(--mode-panel-bg)] text-[var(--mode-text)] focus:border-[var(--mode-accent)]',
    );
    const headerClass = clsx(
        'flex flex-wrap items-center justify-between gap-3',
        isVideoVariant ? 'text-[12px] text-white/85' : undefined,
    );
    const timeLabelClass = clsx(
        'flex items-center gap-2',
        isVideoVariant ? 'text-white/75' : 'text-[var(--mode-text)]',
    );

    return (
        <div
            className={containerClass}
            style={{
                borderColor: 'var(--mode-border)',
                background: isVideoVariant ? 'rgba(8,10,19,0.95)' : 'var(--mode-panel-bg)',
                color: isVideoVariant ? 'rgba(226,232,240,0.8)' : 'var(--mode-text)',
            }}
        >
            <div className={headerClass}>
                <div className='flex items-center gap-3'>
                    <button
                        type='button'
                        onClick={() => {
                            const currentIndex = frames.findIndex((frame) => frame.id === resolvedFrame.id);
                            if (currentIndex > 0) {
                                handleSelectFrame(frames[currentIndex - 1].id);
                            }
                        }}
                        className={navButtonClass}
                    >
                        Prev
                    </button>
                    <button
                        type='button'
                        onClick={() => {
                            const currentIndex = frames.findIndex((frame) => frame.id === resolvedFrame.id);
                            if (currentIndex < frames.length - 1) {
                                handleSelectFrame(frames[currentIndex + 1].id);
                            }
                        }}
                        className={navButtonClass}
                    >
                        Next
                    </button>
                    <span
                        className='rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.3em]'
                        style={{ borderColor: 'var(--mode-border)', background: 'var(--mode-sidebar-bg)', color: 'var(--mode-text)' }}>
                        {resolvedFrame.name ?? 'Frame'}
                    </span>
                </div>
                <div className={clsx('flex items-center gap-2', isVideoVariant ? 'text-white/80' : 'text-[var(--mode-text)]')}>
                    <button
                        type='button'
                        onClick={() => {
                            if (isPlaying) {
                                pauseTimeline();
                            } else {
                                playTimeline(resolvedFrame.id);
                            }
                        }}
                        className={playButtonClass}
                        style={{ backgroundColor: !isVideoVariant && isPlaying ? 'rgba(236,233,254,0.1)' : undefined }}
                    >
                        {isPlaying ? 'Pause' : 'Play'}
                    </button>
                    <button
                        type='button'
                        onClick={() => {
                            setTimelinePlayhead(resolvedFrame.id, 0, { resetTick: true });
                            pauseTimeline();
                        }}
                        className={secondaryButtonClass}
                    >
                        Stop
                    </button>
                    <button type='button' onClick={() => setTimelineLoop(!timelinePlayback.loop)} className={loopButtonClass}>
                        Loop {timelinePlayback.loop ? 'On' : 'Off'}
                    </button>
                    <select
                        value={timelinePlayback.speed ?? 1}
                        onChange={(event) => setTimelineSpeed(Number(event.target.value) || 1)}
                        className={speedSelectClass}
                    >
                        {[0.5, 1, 1.5, 2].map((speed) => (
                            <option key={speed} value={speed}>
                                {speed.toFixed(1)}×
                            </option>
                        ))}
                    </select>
                </div>
                <div className={timeLabelClass}>
                    <span>{formatSecondsValue(timelinePlayback.playhead ?? 0)}</span>
                    <span>/</span>
                    <span>{formatSecondsValue(totalDuration)}</span>
                </div>
            </div>
            <div className='mt-4'>
                <TimelineBar
                    frameId={resolvedFrame.id}
                    assets={frameAssets}
                    totalDuration={totalDuration}
                    getTimelineStyles={styleResolver}
                    trackConfig={trackConfig}
                />
            </div>
        </div>
    );
}

function WaveformWorkspace({ timelineBehavior, accent }) {
    const frames = useCanvasStore((state) => state.frames);
    const selectedFrameId = useCanvasStore((state) => state.selectedFrameId) ?? frames[0]?.id ?? null;
    const setSelectedFrame = useCanvasStore((state) => state.setSelectedFrame);
    const timelineAssets = useCanvasStore((state) => state.timelineAssets);
    const timelinePlayback = useCanvasStore((state) => state.timelinePlayback);
    const playTimeline = useCanvasStore((state) => state.playTimeline);
    const pauseTimeline = useCanvasStore((state) => state.pauseTimeline);
    const isSceneHydrating = useCanvasStore((state) => state.isSceneHydrating);
    const finishSceneHydration = useCanvasStore((state) => state.finishSceneHydration);

    const resolvedFrame = useMemo(
        () => frames.find((frame) => frame.id === selectedFrameId) ?? frames[0] ?? null,
        [frames, selectedFrameId],
    );

    useEffect(() => {
        if (!isSceneHydrating || !resolvedFrame) return undefined;
        const timeoutId = window.setTimeout(() => {
            finishSceneHydration();
        }, 260);
        return () => window.clearTimeout(timeoutId);
    }, [isSceneHydrating, resolvedFrame, finishSceneHydration]);

    if (!resolvedFrame) {
        return (
            <div className='flex h-full w-full items-center justify-center bg-[var(--mode-panel-bg)] text-sm text-[var(--mode-text-muted)]'>
                Start by adding a segment to build your episode timeline.
            </div>
        );
    }

    const frameAssets = timelineAssets.filter((asset) => asset.frameId === resolvedFrame.id);
    const totalDuration = resolvedFrame.timelineDuration
        ?? frameAssets.reduce((acc, asset) => Math.max(acc, (asset.offset ?? 0) + (asset.duration ?? 0)), 1);

    const segments = frameAssets.filter((asset) => asset.type === 'segment');
    const voiceClips = frameAssets.filter((asset) => asset.type === 'audio');

    const trackConfig = {
        order: timelineBehavior?.tracks ?? ['segment', 'audio', 'overlay'],
        labels: timelineBehavior?.labels,
    };

    const isPlaying = timelinePlayback.frameId === resolvedFrame.id && timelinePlayback.isPlaying;

    return (
        <div className='flex h-full w-full flex-col bg-[var(--mode-panel-bg)]'>
            <div className='flex items-center justify-between gap-3 border-b border-[var(--mode-border)] px-5 py-4 text-[10px] uppercase tracking-[0.25em] text-[var(--mode-text-muted)]'>
                <div className='flex items-center gap-3'>
                    <span className='rounded-full border border-[var(--mode-border)] bg-[var(--mode-panel-bg)] px-3 py-1 text-[var(--mode-text)]'>
                        {resolvedFrame.name ?? 'Episode'}
                    </span>
                    <button
                        type='button'
                        onClick={() => {
                            if (isPlaying) {
                                pauseTimeline();
                            } else {
                                playTimeline(resolvedFrame.id);
                            }
                        }}
                        className='rounded-md border border-[var(--mode-border)] px-3 py-1 text-[var(--mode-text)] hover:border-[var(--mode-accent)]'
                    >
                        {isPlaying ? 'Pause' : 'Play'}
                    </button>
                </div>
                <div className='flex items-center gap-2 text-[var(--mode-text)]'>
                    <span>{formatSecondsValue(timelinePlayback.playhead ?? 0)}</span>
                    <span>/</span>
                    <span>{formatSecondsValue(totalDuration)}</span>
                </div>
            </div>
            <div className='grid gap-3 px-5 py-4 text-xs text-[var(--mode-text)] md:grid-cols-2 lg:grid-cols-3'>
                {segments.map((segment) => (
                    <div key={segment.id} className='rounded-xl border border-[var(--mode-border)] bg-[var(--mode-panel-bg)] p-3'>
                        <p className='text-sm font-semibold text-[var(--mode-text)]'>{segment.label ?? 'Segment'}</p>
                        <p className='text-[11px] uppercase tracking-[0.25em] text-[var(--mode-text-muted)]'>
                            {formatSecondsValue(segment.duration ?? 0)} · start {formatSecondsValue(segment.offset ?? 0)}
                        </p>
                    </div>
                ))}
                {voiceClips.length === 0 ? (
                    <div className='rounded-xl border border-dashed border-[var(--mode-border)] bg-[var(--mode-panel-bg)] p-3 text-[var(--mode-text-muted)]'>
                        Use the Record or Sound tools to add voice and music clips.
                    </div>
                ) : null}
            </div>
            <div className='border-t px-5 py-5'>
                <TimelineBar
                    frameId={resolvedFrame.id}
                    assets={frameAssets}
                    totalDuration={totalDuration}
                    getTimelineStyles={getPodcastTimelineStyle}
                    trackConfig={trackConfig}
                />
            </div>
        </div>
    );
}
