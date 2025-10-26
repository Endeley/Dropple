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
    const setContextMenu = useCanvasStore((state) => state.setContextMenu);

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

    const handleContextMenu = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const viewport = event.currentTarget.closest('[data-canvas-viewport]');
        if (!viewport) return;
        const rect = viewport.getBoundingClientRect();
        const storeState = useCanvasStore.getState();
        const canvasPoint = {
            x: (event.clientX - rect.left - storeState.position.x) / storeState.scale,
            y: (event.clientY - rect.top - storeState.position.y) / storeState.scale,
        };
        storeState.setContextMenu({
            type: 'element',
            frameId,
            elementId: element.id,
            position: { x: event.clientX, y: event.clientY },
            canvasPoint,
        });
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

    const commonStyle = useMemo(() => {
        const scaleX = Number.isFinite(props.scaleX) ? props.scaleX : 1;
        const scaleY = Number.isFinite(props.scaleY) ? props.scaleY : 1;
        const skewX = Number.isFinite(props.skewX) ? props.skewX : 0;
        const skewY = Number.isFinite(props.skewY) ? props.skewY : 0;
        const rotation = Number.isFinite(props.rotation) ? props.rotation : 0;
        const transforms = [];
        if (rotation) transforms.push(`rotate(${rotation}deg)`);
        if (skewX || skewY) transforms.push(`skew(${skewX}deg, ${skewY}deg)`);
        if (scaleX !== 1 || scaleY !== 1) transforms.push(`scale(${scaleX}, ${scaleY})`);
        const transform = transforms.length > 0 ? transforms.join(' ') : undefined;

        const fillType = props.fillType ?? (props.imageUrl ? 'image' : 'solid');
        const gradientType = props.gradientType ?? 'linear';
        const gradientStart = props.gradientStart ?? props.fill ?? '#8B5CF6';
        const gradientEnd = props.gradientEnd ?? '#3B82F6';
        const gradientAngle = Number.isFinite(props.gradientAngle) ? props.gradientAngle : 45;

        let backgroundColor;
        let backgroundImage;
        let backgroundRepeat;
        let backgroundSize = props.backgroundFit ?? 'cover';
        let backgroundPosition = 'center';

        if (props.imageUrl && (fillType === 'image' || fillType === 'pattern')) {
            backgroundImage = `url(${props.imageUrl})`;
            backgroundRepeat = fillType === 'pattern' ? props.patternRepeat ?? 'repeat' : 'no-repeat';
            if (fillType === 'pattern') {
                const patternScale = Number.isFinite(props.patternScale) ? props.patternScale : 1;
                backgroundSize = `${Math.max(patternScale, 0.01) * 100}%`;
                backgroundPosition = `${props.patternOffsetX ?? 0}px ${props.patternOffsetY ?? 0}px`;
            }
        } else if (fillType === 'gradient') {
            if (gradientType === 'linear') {
                backgroundImage = `linear-gradient(${gradientAngle}deg, ${gradientStart} 0%, ${gradientEnd} 100%)`;
            } else if (gradientType === 'radial') {
                backgroundImage = `radial-gradient(circle, ${gradientStart} 0%, ${gradientEnd} 100%)`;
            } else if (gradientType === 'conic') {
                backgroundImage = `conic-gradient(from ${gradientAngle}deg, ${gradientStart}, ${gradientEnd})`;
            }
        } else if (props.fill) {
            backgroundColor = props.fill;
        }

        const shadowColor = props.shadowColor;
        const shadowOffsetX = Number.isFinite(props.shadowOffsetX) ? props.shadowOffsetX : 0;
        const shadowOffsetY = Number.isFinite(props.shadowOffsetY) ? props.shadowOffsetY : 0;
        const shadowBlur = Number.isFinite(props.shadowBlur) ? props.shadowBlur : 0;
        const shadowSpread = Number.isFinite(props.shadowSpread) ? props.shadowSpread : 0;
        const glowColor = props.glowColor;
        const glowBlur = Number.isFinite(props.glowBlur) ? props.glowBlur : 0;
        const shadows = [];
        if (shadowColor && (shadowBlur || shadowOffsetX || shadowOffsetY || shadowSpread)) {
            shadows.push(`${shadowOffsetX}px ${shadowOffsetY}px ${shadowBlur}px ${shadowSpread}px ${shadowColor}`);
        }
        if (glowColor) {
            shadows.push(`0 0 ${Math.max(glowBlur, 1)}px ${glowColor}`);
        }
        const boxShadow = shadows.length > 0 ? shadows.join(', ') : undefined;

        const filterParts = [];
        if (Number.isFinite(props.blur) && props.blur > 0) filterParts.push(`blur(${props.blur}px)`);
        if (Number.isFinite(props.brightness) && props.brightness !== 100)
            filterParts.push(`brightness(${props.brightness}%)`);
        if (Number.isFinite(props.contrast) && props.contrast !== 100)
            filterParts.push(`contrast(${props.contrast}%)`);
        if (Number.isFinite(props.saturation) && props.saturation !== 100)
            filterParts.push(`saturate(${props.saturation}%)`);
        if (Number.isFinite(props.hueRotate) && props.hueRotate !== 0)
            filterParts.push(`hue-rotate(${props.hueRotate}deg)`);
        const filter = filterParts.length > 0 ? filterParts.join(' ') : undefined;

        let borderRadius;
        if (props.cornerRadius != null) {
            if (typeof props.cornerRadius === 'object') {
                const {
                    topLeft = 0,
                    topRight = 0,
                    bottomRight = 0,
                    bottomLeft = 0,
                } = props.cornerRadius;
                borderRadius = `${topLeft}px ${topRight}px ${bottomRight}px ${bottomLeft}px`;
            } else if (Number.isFinite(props.cornerRadius)) {
                borderRadius = `${props.cornerRadius}px`;
            }
        }
        const border =
            props.stroke && props.strokeWidth
                ? `${props.strokeWidth}px solid ${props.stroke}`
                : undefined;

        return {
            left: props.x ?? 0,
            top: props.y ?? 0,
            width: props.width,
            height: props.height,
            transform,
            transformOrigin: props.transformOrigin ?? '50% 50%',
            opacity: props.opacity ?? 1,
            borderRadius,
            border,
            textAlign: props.align,
            backgroundColor,
            backgroundImage,
            backgroundSize,
            backgroundRepeat,
            backgroundPosition,
            backgroundBlendMode: props.backgroundBlendMode ?? undefined,
            boxShadow,
            filter,
            mixBlendMode:
                props.blendMode && props.blendMode !== 'normal' ? props.blendMode : undefined,
            visibility: props.visible === false ? 'hidden' : 'visible',
        };
    }, [
        props.align,
        props.backgroundFit,
        props.blur,
        props.blendMode,
        props.brightness,
        props.cornerRadius,
        props.contrast,
        props.fill,
        props.fillType,
        props.glowBlur,
        props.glowColor,
        props.gradientAngle,
        props.gradientEnd,
        props.gradientStart,
        props.gradientType,
        props.height,
        props.hueRotate,
        props.imageUrl,
        props.opacity,
        props.patternOffsetX,
        props.patternOffsetY,
        props.patternRepeat,
        props.patternScale,
        props.rotation,
        props.saturation,
        props.scaleX,
        props.scaleY,
        props.shadowBlur,
        props.shadowColor,
        props.shadowOffsetX,
        props.shadowOffsetY,
        props.shadowSpread,
        props.skewX,
        props.skewY,
        props.stroke,
        props.strokeWidth,
        props.transformOrigin,
        props.visible,
        props.width,
        props.x,
        props.y,
    ]);

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
                    onContextMenu={handleContextMenu}
                >
                    {linkBadge}
                    {resizeHandles}
                    {commentBadge}
                </div>
            );
        case 'text':
            {
                const textFillType = props.textFillType ?? 'solid';
                const textColor = props.fill ?? '#ECE9FE';
                const textGradientStart = props.textGradientStart ?? textColor;
                const textGradientEnd = props.textGradientEnd ?? textColor;
                const textGradientAngle = Number.isFinite(props.textGradientAngle)
                    ? props.textGradientAngle
                    : 45;
                const textShadowColor = props.textShadowColor;
                const textShadowX = Number.isFinite(props.textShadowX) ? props.textShadowX : 0;
                const textShadowY = Number.isFinite(props.textShadowY) ? props.textShadowY : 0;
                const textShadowBlur = Number.isFinite(props.textShadowBlur) ? props.textShadowBlur : 0;
                const computedTextShadow =
                    textShadowColor && textShadowColor !== 'transparent'
                        ? `${textShadowX}px ${textShadowY}px ${textShadowBlur}px ${textShadowColor}`
                        : undefined;
                const textStyle = {
                    ...commonStyle,
                    backgroundColor: 'transparent',
                    backgroundImage:
                        textFillType === 'gradient'
                            ? `linear-gradient(${textGradientAngle}deg, ${textGradientStart} 0%, ${textGradientEnd} 100%)`
                            : 'none',
                    backgroundClip: textFillType === 'gradient' ? 'text' : undefined,
                    WebkitBackgroundClip: textFillType === 'gradient' ? 'text' : undefined,
                    color: textFillType === 'gradient' ? 'transparent' : textColor,
                    fontSize: props.fontSize,
                    fontFamily: props.fontFamily,
                    fontWeight:
                        props.fontWeight ??
                        (props.fontStyle?.includes('bold') ? '600' : undefined),
                    fontStyle: props.fontStyle?.includes('italic') ? 'italic' : undefined,
                    lineHeight: props.lineHeight,
                    letterSpacing: props.letterSpacing,
                    textTransform: props.textTransform ?? 'none',
                    textShadow: computedTextShadow,
                };
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
                    style={textStyle}
                    onPointerDown={handlePointerDown}
                    onContextMenu={handleContextMenu}
                >
                    {props.text}
                    {linkBadge}
                    {resizeHandles}
                    {commentBadge}
                </div>
            );
            }
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
                    onContextMenu={handleContextMenu}
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
