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
    const setSelectedFrame = useCanvasStore((state) => state.setSelectedFrame);
    const updateFrame = useCanvasStore((state) => state.updateFrame);

    const dragStateRef = useRef(null);
    const resizeStateRef = useRef(null);

    if (!frame) return null;

    const isSelected = selectedFrameId === frame.id;
    const isPointerTool = !selectedTool || selectedTool === 'pointer';
    const showResizeHandles = isSelected && isPointerTool && !prototypeMode;

    const elementTree = useMemo(() => buildElementTree(frame.elements ?? []), [frame.elements]);

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
            storeApi.setActiveGuides(snapped.guides);

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
            storeApi.setActiveGuides(snapped.guides);

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
            <div className='relative h-full w-full pt-6'>
                {elementTree.map(({ element, children }) => (
                    <ElementNode key={element.id} element={element} frameId={frame.id} childrenNodes={children} />
                ))}
            </div>
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
