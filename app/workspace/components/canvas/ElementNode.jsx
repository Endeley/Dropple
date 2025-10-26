'use client';

import clsx from 'clsx';
import { useMemo, useRef } from 'react';
import { useCanvasStore } from './context/CanvasStore';
import {
    createElementTargets,
    snapRectToTargets,
    snapResizedRectToTargets,
} from './utils/alignmentUtils';
import { ELEMENT_MIN_SIZE, RESIZE_HANDLES, computeResizedBox } from './utils/resizeUtils';

const baseClass = 'absolute select-none';

export default function ElementNode({ element, frameId, childrenNodes = [] }) {
    const selectedTool = useCanvasStore((state) => state.selectedTool);
    const selectedFrameId = useCanvasStore((state) => state.selectedFrameId);
    const selectedElementIds = useCanvasStore((state) => state.selectedElementIds);
    const scale = useCanvasStore((state) => state.scale);
    const prototypeMode = useCanvasStore((state) => state.prototypeMode);
    const setSelectedElement = useCanvasStore((state) => state.setSelectedElement);
    const toggleElementSelection = useCanvasStore((state) => state.toggleElementSelection);
    const updateElementProps = useCanvasStore((state) => state.updateElementProps);
    const comments = useCanvasStore((state) => state.comments);
    const setActiveToolOverlay = useCanvasStore((state) => state.setActiveToolOverlay);

    const dragStateRef = useRef(null);
    const resizeStateRef = useRef(null);

    if (!element) return null;

    const props = element.props ?? {};
    const isPointerTool = !selectedTool || selectedTool === 'pointer';
    const isSelected = selectedFrameId === frameId && selectedElementIds.includes(element.id);
    const hasLink = Boolean(props.linkTarget);
    const elementComments = useMemo(
        () =>
            comments.filter(
                (comment) => comment.frameId === frameId && comment.elementId === element.id,
            ),
        [comments, frameId, element.id],
    );
    const hasComments = elementComments.length > 0;
    const canResize =
        isSelected &&
        isPointerTool &&
        !prototypeMode &&
        Number.isFinite(props.width) &&
        Number.isFinite(props.height);

    const handlePointerDown = (event) => {
        event.stopPropagation();
        if (!frameId || !element.id) return;
        if (prototypeMode) return;

        useCanvasStore.getState().clearActiveGuides();

        const additive = event.shiftKey || event.metaKey || event.ctrlKey;

        if (additive) {
            toggleElementSelection(frameId, element.id);
        } else {
            setSelectedElement(frameId, element.id);
        }

        if (!isPointerTool || event.button !== 0 || additive) return;

        const isPrimaryButton = event.button === 0;
        if (!isPrimaryButton) return;

        dragStateRef.current = {
            startX: event.clientX,
            startY: event.clientY,
            elementX: props.x ?? 0,
            elementY: props.y ?? 0,
            pointerId: event.pointerId,
            target: event.currentTarget,
        };

        event.currentTarget.setPointerCapture?.(event.pointerId);

        const handlePointerMove = (moveEvent) => {
            if (!dragStateRef.current) return;

            if ((moveEvent.buttons & 1) === 0) {
                handlePointerUp();
                return;
            }

            const storeApi = useCanvasStore.getState();
            const frameState = storeApi.getFrameById(frameId);
            const elementState =
                frameState?.elements?.find((el) => el.id === element.id) ?? element;

            const deltaX = (moveEvent.clientX - dragStateRef.current.startX) / (scale || 1);
            const deltaY = (moveEvent.clientY - dragStateRef.current.startY) / (scale || 1);

            const width = elementState?.props?.width ?? props.width ?? ELEMENT_MIN_SIZE;
            const height = elementState?.props?.height ?? props.height ?? ELEMENT_MIN_SIZE;

            const candidateRect = {
                x: dragStateRef.current.elementX + deltaX,
                y: dragStateRef.current.elementY + deltaY,
                width,
                height,
            };

            const targets = createElementTargets(frameState, element.id);
            const snapped = snapRectToTargets({ rect: candidateRect, targets });
            const offsetGuides = (snapped.guides ?? []).map((guide) => {
                const basePosition = guide.position ?? 0;
                const frameOffset =
                    guide.orientation === 'vertical'
                        ? frameState?.x ?? 0
                        : frameState?.y ?? 0;
                return { ...guide, position: basePosition + frameOffset };
            });
            storeApi.setActiveGuides(offsetGuides);

            updateElementProps(frameId, element.id, {
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
        if (!frameId || !element.id) return;
        if (!isPointerTool || prototypeMode) return;

        dragStateRef.current = null;
        setSelectedElement(frameId, element.id);
        useCanvasStore.getState().clearActiveGuides();

        const pointerId = event.pointerId;
        const startBox = {
            x: props.x ?? 0,
            y: props.y ?? 0,
            width: Number.isFinite(props.width) ? props.width : ELEMENT_MIN_SIZE,
            height: Number.isFinite(props.height) ? props.height : ELEMENT_MIN_SIZE,
        };

        resizeStateRef.current = {
            pointerId,
            handle: handleKey,
            startX: event.clientX,
            startY: event.clientY,
            target: event.currentTarget,
            startBox,
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
            const frameState = storeApi.getFrameById(frameId);

            const deltaX = (moveEvent.clientX - current.startX) / (scale || 1);
            const deltaY = (moveEvent.clientY - current.startY) / (scale || 1);

            const candidate = computeResizedBox({
                start: current.startBox,
                handle: current.handle,
                deltaX,
                deltaY,
                minWidth: ELEMENT_MIN_SIZE,
                minHeight: ELEMENT_MIN_SIZE,
            });

            const targets = createElementTargets(frameState, element.id);
            const snapped = snapResizedRectToTargets({
                rect: candidate,
                handle: current.handle,
                targets,
            });
            const offsetGuides = (snapped.guides ?? []).map((guide) => {
                const basePosition = guide.position ?? 0;
                const frameOffset =
                    guide.orientation === 'vertical'
                        ? frameState?.x ?? 0
                        : frameState?.y ?? 0;
                return { ...guide, position: basePosition + frameOffset };
            });
            storeApi.setActiveGuides(offsetGuides);

            updateElementProps(frameId, element.id, snapped.rect);
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

    const commonStyle = useMemo(
        () => ({
            left: props.x ?? 0,
            top: props.y ?? 0,
            width: props.width,
            height: props.height,
            transform: props.rotation ? `rotate(${props.rotation}deg)` : undefined,
            opacity: props.opacity ?? 1,
            borderRadius: props.cornerRadius,
            border:
                props.stroke && props.strokeWidth !== 0
                    ? `${props.strokeWidth ?? 1}px solid ${props.stroke}`
                    : undefined,
            textAlign: props.align,
            backgroundColor: props.fill && !props.imageUrl ? props.fill : undefined,
            backgroundImage: props.imageUrl ? `url(${props.imageUrl})` : undefined,
            backgroundSize: props.backgroundFit ?? 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: props.imageUrl ? 'no-repeat' : undefined,
            boxShadow: props.boxShadow,
            filter: props.filter && props.filter !== 'none' ? props.filter : undefined,
        }),
        [
            props.x,
            props.y,
            props.width,
            props.height,
            props.rotation,
            props.opacity,
            props.cornerRadius,
            props.stroke,
            props.strokeWidth,
            props.align,
            props.fill,
            props.imageUrl,
            props.backgroundFit,
            props.boxShadow,
            props.filter,
        ],
    );

    const linkBadge = hasLink ? (
        <span className='pointer-events-none absolute right-2 top-2 rounded-full border border-[rgba(59,130,246,0.35)] bg-[rgba(59,130,246,0.15)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[rgba(148,163,184,0.85)]'>
            Link
        </span>
    ) : null;
    const commentBadge = hasComments ? (
        <button
            type='button'
            onPointerDown={(event) => {
                event.stopPropagation();
                setSelectedElement(frameId, element.id);
                setActiveToolOverlay('comment');
            }}
            className='absolute left-2 top-2 flex h-6 items-center gap-1 rounded-full border border-[rgba(148,163,184,0.35)] bg-[rgba(15,23,42,0.7)] px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[rgba(236,233,254,0.85)]'
        >
            💬 {elementComments.length}
        </button>
    ) : null;

    const resizeHandles =
        canResize && frameId && element.id
            ? (
                <div className='pointer-events-none absolute inset-0'>
                    {RESIZE_HANDLES.map((handle) => (
                        <div
                            key={`${element.id}-${handle.key}`}
                            className={clsx(
                                'absolute h-3 w-3 rounded-full border border-[rgba(236,233,254,0.7)] bg-[rgba(59,130,246,0.85)] shadow-[0_0_0_2px_rgba(15,23,42,0.55)] transition-transform hover:scale-110',
                                handle.className,
                                handle.cursor,
                            )}
                            style={{ pointerEvents: 'auto' }}
                            onPointerDown={(event) => handleResizePointerDown(event, handle.key)}
                        />
                    ))}
                </div>
            )
            : null;

    switch (element.type) {
        case 'rect':
        case 'image':
            return (
                <div
                    className={clsx(
                        baseClass,
                        'relative rounded-2xl border border-transparent transition-shadow',
                        isPointerTool ? 'cursor-grab active:cursor-grabbing' : 'cursor-default',
                        {
                            'shadow-[0_0_0_2px_rgba(139,92,246,0.75)]': isSelected,
                        },
                    )}
                    style={{
                        ...commonStyle,
                    }}
                    onPointerDown={handlePointerDown}
                >
                    {linkBadge}
                    {resizeHandles}
                    {commentBadge}
                </div>
            );
        case 'text':
            return (
                <div
                    className={clsx(
                        baseClass,
                        'relative whitespace-pre-wrap font-sans text-[rgba(236,233,254,0.92)]',
                        isPointerTool ? 'cursor-text lg:cursor-grab lg:active:cursor-grabbing' : 'cursor-text',
                        {
                            'shadow-[0_0_0_2px_rgba(139,92,246,0.6)]': isSelected,
                        },
                    )}
                    style={{
                        ...commonStyle,
                        backgroundColor: 'transparent',
                        color: props.fill ?? '#ECE9FE',
                        fontSize: props.fontSize,
                        fontWeight: props.fontWeight ?? (props.fontStyle?.includes('bold') ? '600' : undefined),
                        fontStyle: props.fontStyle?.includes('italic') ? 'italic' : undefined,
                        lineHeight: props.lineHeight,
                        letterSpacing: props.letterSpacing,
                    }}
                    onPointerDown={handlePointerDown}
                >
                    {props.text}
                    {linkBadge}
                    {resizeHandles}
                    {commentBadge}
                </div>
            );
        case 'group':
            return (
                <div
                    className={clsx(
                        baseClass,
                        'rounded-2xl border border-dashed border-[rgba(148,163,184,0.25)] bg-transparent transition-shadow',
                        'relative',
                        isPointerTool ? 'cursor-grab active:cursor-grabbing' : 'cursor-default',
                        {
                            'shadow-[0_0_0_2px_rgba(139,92,246,0.75)]': isSelected,
                        },
                    )}
                    style={commonStyle}
                    onPointerDown={handlePointerDown}
                >
                    {linkBadge}
                    {commentBadge}
                    {resizeHandles}
                    {childrenNodes.map(({ element: child, children }) => (
                        <ElementNode key={child.id} element={child} frameId={frameId} childrenNodes={children} />
                    ))}
                </div>
            );
        default:
            return null;
    }
}
