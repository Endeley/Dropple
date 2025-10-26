'use client';

import clsx from 'clsx';
import { useCallback, useMemo, useRef, useState } from 'react';
import ElementNode from './ElementNode';
import TimelineBar from './TimelineBar';
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
    const selectElementsInRect = useCanvasStore((state) => state.selectElementsInRect);
    const setContextMenu = useCanvasStore((state) => state.setContextMenu);

    const dragStateRef = useRef(null);
    const resizeStateRef = useRef(null);
    const marqueeStateRef = useRef(null);
    const [marqueeRect, setMarqueeRect] = useState(null);

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

    const frameBackgroundStyle = useMemo(() => {
        const fillType = frame.backgroundFillType ?? (frame.backgroundImage ? 'image' : 'solid');
        const gradientType = frame.backgroundGradientType ?? 'linear';
        const baseColor = frame.backgroundColor ?? 'rgba(15,23,42,0.94)';

        const layers = [];
        const sizes = [];
        const repeats = [];
        const positions = [];

        if (fillType === 'gradient') {
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
        }

        if (fillType === 'image' && frame.backgroundImage) {
            layers.push(`url(${frame.backgroundImage})`);
            sizes.push(frame.backgroundFit ?? 'cover');
            repeats.push('no-repeat');
            positions.push('center');
        }

        if (fillType === 'pattern' && frame.backgroundImage) {
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
    }, [
        frame.backgroundBlendMode,
        frame.backgroundColor,
        frame.backgroundFillType,
        frame.backgroundFit,
        frame.backgroundGradientAngle,
        frame.backgroundGradientEnd,
        frame.backgroundGradientStart,
        frame.backgroundGradientType,
        frame.backgroundImage,
        frame.backgroundPatternOffsetX,
        frame.backgroundPatternOffsetY,
        frame.backgroundPatternRepeat,
        frame.backgroundPatternScale,
    ]);

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

        const target = event.currentTarget;

        if (isPointerTool && !prototypeMode && event.button === 0 && event.shiftKey) {
            event.preventDefault();
            useCanvasStore.getState().clearActiveGuides();
            setSelectedFrame(frame.id);

            const frameRect = target.getBoundingClientRect();
            const startX = (event.clientX - frameRect.left) / (scale || 1);
            const startY = (event.clientY - frameRect.top) / (scale || 1);

            marqueeStateRef.current = {
                startX,
                startY,
                frameRect,
                pointerId: event.pointerId,
                target,
                additive: event.metaKey || event.ctrlKey,
            };

            setMarqueeRect({ x: startX, y: startY, width: 0, height: 0 });
            target.setPointerCapture?.(event.pointerId);

            const handleMarqueeMove = (moveEvent) => {
                const current = marqueeStateRef.current;
                if (!current) return;
                if ((moveEvent.buttons & 1) === 0) {
                    handleMarqueeUp(moveEvent);
                    return;
                }
                const currentX = (moveEvent.clientX - current.frameRect.left) / (scale || 1);
                const currentY = (moveEvent.clientY - current.frameRect.top) / (scale || 1);
                const x = Math.min(current.startX, currentX);
                const y = Math.min(current.startY, currentY);
                const width = Math.abs(currentX - current.startX);
                const height = Math.abs(currentY - current.startY);
                setMarqueeRect({ x, y, width, height });
            };

            const handleMarqueeUp = (upEvent) => {
                const current = marqueeStateRef.current;
                if (!current) return;
                window.removeEventListener('pointermove', handleMarqueeMove);
                window.removeEventListener('pointerup', handleMarqueeUp);
                current.target.releasePointerCapture?.(current.pointerId);

                const endX = (upEvent.clientX - current.frameRect.left) / (scale || 1);
                const endY = (upEvent.clientY - current.frameRect.top) / (scale || 1);
                const x = Math.min(current.startX, endX);
                const y = Math.min(current.startY, endY);
                const width = Math.abs(endX - current.startX);
                const height = Math.abs(endY - current.startY);

                const additive = current.additive || upEvent.metaKey || upEvent.ctrlKey;
                if (width > 4 && height > 4) {
                    selectElementsInRect(frame.id, { x, y, width, height }, { additive });
                }

                setMarqueeRect(null);
                marqueeStateRef.current = null;
            };

            window.addEventListener('pointermove', handleMarqueeMove);
            window.addEventListener('pointerup', handleMarqueeUp);
            return;
        }

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
            target,
        };

        target.setPointerCapture?.(event.pointerId);

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

    const handleFrameContextMenu = useCallback(
        (event) => {
            event.preventDefault();
            event.stopPropagation();
            const viewport = event.currentTarget.closest('[data-canvas-viewport]');
            if (!viewport) return;
            const storeState = useCanvasStore.getState();
            const rect = viewport.getBoundingClientRect();
            const canvasPoint = {
                x: (event.clientX - rect.left - storeState.position.x) / storeState.scale,
                y: (event.clientY - rect.top - storeState.position.y) / storeState.scale,
            };
            setContextMenu({
                type: 'frame',
                frameId: frame.id,
                position: { x: event.clientX, y: event.clientY },
                canvasPoint,
            });
        },
        [frame.id, setContextMenu],
    );

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
                ...frameBackgroundStyle,
            }}
            onPointerDown={handlePointerDown}
            onContextMenu={handleFrameContextMenu}
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
                        <TimelineBar frameId={frame.id} assets={frameTimelineAssets} totalDuration={timelineTotalDuration} getTimelineStyles={getTimelineStyles} />
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
            {marqueeRect ? (
                <div
                    className='pointer-events-none absolute rounded-lg border border-[rgba(139,92,246,0.6)] bg-[rgba(139,92,246,0.2)]'
                    style={{
                        left: marqueeRect.x,
                        top: marqueeRect.y,
                        width: marqueeRect.width,
                        height: marqueeRect.height,
                    }}
                />
            ) : null}
        </div>
    );
}
