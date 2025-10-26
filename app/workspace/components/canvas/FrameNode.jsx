'use client';

import clsx from 'clsx';
import { useMemo, useRef } from 'react';
import ElementNode from './ElementNode';
import { useCanvasStore } from './context/CanvasStore';
import { createFrameTargets, snapRectToTargets, snapResizedRectToTargets } from './utils/alignmentUtils';
import { FRAME_MIN_SIZE, RESIZE_HANDLES, computeResizedBox } from './utils/resizeUtils';

export function buildElementTree(elements, parentId = null) {
    if (!Array.isArray(elements)) return [];
    return elements
        .filter((element) => (element.parentId ?? null) === parentId)
        .map((element) => ({
            element,
            children: buildElementTree(elements, element.id),
        }));
}

export default function FrameNode({ frame }) {
    const selectedTool = useCanvasStore((state) => state.selectedTool);
    const selectedFrameId = useCanvasStore((state) => state.selectedFrameId);
    const scale = useCanvasStore((state) => state.scale);
    const prototypeMode = useCanvasStore((state) => state.prototypeMode);
    const mode = useCanvasStore((state) => state.mode);
    const timelineAssets = useCanvasStore((state) => state.timelineAssets);
    const setSelectedFrame = useCanvasStore((state) => state.setSelectedFrame);
    const updateFrame = useCanvasStore((state) => state.updateFrame);
    const comments = useCanvasStore((state) => state.comments);
    const setActiveToolOverlay = useCanvasStore((state) => state.setActiveToolOverlay);

    const dragStateRef = useRef(null);
    const resizeStateRef = useRef(null);

    if (!frame) return null;

    const isSelected = selectedFrameId === frame.id;
    const isPointerTool = !selectedTool || selectedTool === 'pointer';
    const showResizeHandles = isSelected && isPointerTool && !prototypeMode;
    const frameComments = useMemo(
        () => comments.filter((comment) => comment.frameId === frame.id && !comment.elementId),
        [comments, frame.id],
    );
    const frameTimelineAssets = useMemo(
        () => timelineAssets.filter((asset) => asset.frameId === frame.id),
        [timelineAssets, frame.id],
    );

    const elementTree = useMemo(() => buildElementTree(frame.elements ?? []), [frame.elements]);
    const timelineTotalDuration = useMemo(() => {
        if (frame.timelineDuration && frame.timelineDuration > 0) return frame.timelineDuration;
        const sum = frameTimelineAssets.reduce((acc, asset) => acc + (asset.duration || 0), 0);
        return sum > 0 ? sum : 1;
    }, [frame.timelineDuration, frameTimelineAssets]);
    const timelineDurationLabel = useMemo(() => {
        const rounded = Math.round(timelineTotalDuration * 10) / 10;
        return Number.isInteger(rounded) ? String(Math.trunc(rounded)) : rounded.toFixed(1);
    }, [timelineTotalDuration]);

    const getTimelineStyles = (asset) => {
        switch (asset.type) {
            case 'audio':
                return {
                    icon: '🎵',
                    style: {
                        backgroundImage:
                            'repeating-linear-gradient(135deg, rgba(96,165,250,0.35) 0, rgba(96,165,250,0.35) 6px, rgba(59,130,246,0.2) 6px, rgba(59,130,246,0.2) 12px)',
                    },
                };
            case 'overlay':
                return {
                    icon: '✨',
                    style: {
                        backgroundImage:
                            'repeating-linear-gradient(90deg, rgba(236,233,254,0.15) 0, rgba(236,233,254,0.15) 4px, transparent 4px, transparent 8px)',
                        border: '1px dashed rgba(236,233,254,0.35)',
                    },
                };
            case 'clip':
            default:
                return {
                    icon: '🎬',
                    style: {
                        backgroundImage: 'linear-gradient(135deg, rgba(59,130,246,0.55) 0%, rgba(139,92,246,0.55) 100%)',
                    },
                };
        }
    };

    const handlePointerDown = (event) => {
        event.stopPropagation();
        if (prototypeMode) return;

        useCanvasStore.getState().clearActiveGuides();
        setSelectedFrame(frame.id);

        const isPrimaryButton = event.button === 0;
        if (!isPrimaryButton || !isPointerTool) return;

        dragStateRef.current = {
            startX: event.clientX,
            startY: event.clientY,
            frameX: frame.x,
            frameY: frame.y,
            pointerId: event.pointerId,
            target: event.currentTarget,
        };

        event.currentTarget.setPointerCapture?.(event.pointerId);

        const handlePointerMove = (moveEvent) => {
            if (!dragStateRef.current) return;

            // If the primary button was released outside the frame, end the drag.
            if ((moveEvent.buttons & 1) === 0) {
                handlePointerUp();
                return;
            }

            const storeApi = useCanvasStore.getState();
            const currentFrame = storeApi.getFrameById(frame.id) ?? frame;
            const deltaX = (moveEvent.clientX - dragStateRef.current.startX) / (scale || 1);
            const deltaY = (moveEvent.clientY - dragStateRef.current.startY) / (scale || 1);

            const candidateRect = {
                x: dragStateRef.current.frameX + deltaX,
                y: dragStateRef.current.frameY + deltaY,
                width: currentFrame.width ?? frame.width,
                height: currentFrame.height ?? frame.height,
            };

            const targets = createFrameTargets(storeApi.frames ?? [], frame.id);
            const snapped = snapRectToTargets({ rect: candidateRect, targets });
            storeApi.setActiveGuides(snapped.guides ?? []);

            updateFrame(frame.id, {
                x: snapped.x,
                y: snapped.y,
            });
        };

        const handlePointerUp = () => {
            useCanvasStore.getState().clearActiveGuides();
            const current = dragStateRef.current;
            if (current?.pointerId != null && current?.target) {
                current.target.releasePointerCapture?.(current.pointerId);
            }
            dragStateRef.current = null;
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
    };

    const handleResizePointerDown = (event, handleKey) => {
        event.stopPropagation();
        if (!isPointerTool || prototypeMode) return;

        dragStateRef.current = null;

        const pointerId = event.pointerId;
        resizeStateRef.current = {
            pointerId,
            handle: handleKey,
            startX: event.clientX,
            startY: event.clientY,
            target: event.currentTarget,
            startBox: {
                x: frame.x,
                y: frame.y,
                width: frame.width,
                height: frame.height,
            },
        };

        event.currentTarget.setPointerCapture?.(pointerId);

        const handlePointerMove = (moveEvent) => {
            const current = resizeStateRef.current;
            if (!current) return;
            if ((moveEvent.buttons & 1) === 0) {
                handlePointerUp();
                return;
            }
            moveEvent.preventDefault();

            const storeApi = useCanvasStore.getState();
            const deltaX = (moveEvent.clientX - current.startX) / (scale || 1);
            const deltaY = (moveEvent.clientY - current.startY) / (scale || 1);

            const candidate = computeResizedBox({
                start: current.startBox,
                handle: current.handle,
                deltaX,
                deltaY,
                minWidth: FRAME_MIN_SIZE,
                minHeight: FRAME_MIN_SIZE,
            });

            const targets = createFrameTargets(storeApi.frames ?? [], frame.id);
            const snapped = snapResizedRectToTargets({
                rect: candidate,
                handle: current.handle,
                targets,
            });
            storeApi.setActiveGuides(snapped.guides ?? []);

            updateFrame(frame.id, snapped.rect);
        };

        const handlePointerUp = () => {
            useCanvasStore.getState().clearActiveGuides();
            const current = resizeStateRef.current;
            if (current?.pointerId != null && current?.target) {
                current.target.releasePointerCapture?.(current.pointerId);
            }
            resizeStateRef.current = null;
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
    };

    return (
        <div
            className={clsx(
                'absolute rounded-3xl border p-8 font-sans transition-shadow text-[rgba(226,232,240,0.9)] shadow-xl',
                isSelected
                    ? 'border-[rgba(139,92,246,0.75)] shadow-[0_20px_60px_rgba(139,92,246,0.35)]'
                    : 'border-[rgba(148,163,184,0.25)] shadow-[0_12px_40px_rgba(15,23,42,0.45)]',
                isPointerTool ? 'cursor-grab active:cursor-grabbing' : 'cursor-default',
            )}
            style={{
                left: frame.x,
                top: frame.y,
                width: frame.width,
                height: frame.height,
                opacity: frame.opacity ?? 1,
                backgroundColor: frame.backgroundColor ?? 'rgba(15,23,42,0.94)',
                backgroundImage: frame.backgroundImage ? `url(${frame.backgroundImage})` : undefined,
                backgroundSize: frame.backgroundFit ?? 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: frame.backgroundImage ? 'no-repeat' : 'no-repeat',
            }}
            onPointerDown={handlePointerDown}
        >
            <div className='absolute left-4 top-4 text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(148,163,184,0.65)]'>
                {frame.name}
            </div>
            {frameComments.length > 0 ? (
                <button
                    type='button'
                    onPointerDown={(event) => {
                        event.stopPropagation();
                        setSelectedFrame(frame.id);
                        setActiveToolOverlay('comment');
                    }}
                    className='absolute right-4 top-4 flex h-7 items-center gap-1 rounded-full border border-[rgba(148,163,184,0.35)] bg-[rgba(15,23,42,0.7)] px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgba(236,233,254,0.85)] shadow-[0_10px_30px_rgba(15,23,42,0.35)]'
                >
                    💬 {frameComments.length}
                </button>
            ) : null}
            <div className='relative h-full w-full pt-6'>
                {elementTree.map(({ element, children }) => (
                    <ElementNode key={element.id} element={element} frameId={frame.id} childrenNodes={children} />
                ))}
            </div>
            {mode === 'video' && frameTimelineAssets.length > 0 ? (
                <div className='pointer-events-none absolute inset-x-6 bottom-6'>
                    <div className='rounded-full border border-[rgba(59,130,246,0.35)] bg-[rgba(15,23,42,0.75)] px-4 py-2 shadow-[0_12px_32px_rgba(15,23,42,0.45)]'>
                        <div className='flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-[rgba(148,163,184,0.65)]'>
                            <span>Timeline</span>
                            <div className='h-px flex-1 bg-[rgba(59,130,246,0.35)]' />
                            <span>{timelineDurationLabel}s</span>
                        </div>
                        <div className='mt-2 flex h-6 w-full items-center gap-1'>
                            {(() => {
                                const total = timelineTotalDuration || 1;
                                return frameTimelineAssets.map((asset) => {
                                    const widthPercent = Math.max(((asset.duration || 1) / total) * 100, 6);
                                    const preview = getTimelineStyles(asset);
                                    return (
                                        <div
                                            key={asset.id}
                                            className='relative flex h-full items-center justify-center rounded-full border border-transparent px-2 text-[10px] font-semibold text-[rgba(226,232,240,0.92)]'
                                            style={{
                                                width: `${widthPercent}%`,
                                                ...preview.style,
                                                border: preview.style?.border || '1px solid rgba(59,130,246,0.35)',
                                            }}
                                            title={`${asset.label} • ${asset.duration || 1}s`}
                                        >
                                            <span className='mr-1'>{preview.icon}</span>
                                            <span className='truncate'>{asset.label}</span>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </div>
            ) : null}
            {showResizeHandles ? (
                <div className='pointer-events-none absolute inset-0'>
                    {RESIZE_HANDLES.map((handle) => (
                        <div
                            key={handle.key}
                            className={clsx(
                                'absolute h-3 w-3 rounded-full border border-[rgba(236,233,254,0.7)] bg-[rgba(139,92,246,0.85)] shadow-[0_0_0_2px_rgba(15,23,42,0.65)] transition-transform hover:scale-110',
                                handle.className,
                                handle.cursor,
                            )}
                            style={{ pointerEvents: 'auto' }}
                            onPointerDown={(event) => handleResizePointerDown(event, handle.key)}
                        />
                    ))}
                </div>
            ) : null}
        </div>
    );
}
