'use client';

import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CanvasLayer from './CanvasLayer';
import CanvasContextMenu from './CanvasContextMenu';
import FabricCanvas from './FabricCanvas';
import { useCanvasStore } from './context/CanvasStore';
import { resolveTool, TOOL_BEHAVIORS } from './utils/toolBehaviors';
import { createElement } from './utils/elementFactory';
import { findFrameAtPoint, findElementAtPoint } from './utils/frameUtils';

const SCALE_STEP = 1.1;
const MIN_SCALE = 0.25;
const MAX_SCALE = 4;

export default function CanvasContainer() {
    const viewportRef = useRef(null);
    const isPointerDown = useRef(false);
    const lastPointer = useRef({ x: 0, y: 0 });
    const fileInputRef = useRef(null);
    const [pendingImageElement, setPendingImageElement] = useState(null);

    const mode = useCanvasStore((state) => state.mode);
    const useFabricCanvas = mode === 'graphics';
    const scale = useCanvasStore((state) => state.scale);
    const setScale = useCanvasStore((state) => state.setScale);
    const position = useCanvasStore((state) => state.position);
    const setPosition = useCanvasStore((state) => state.setPosition);
    const selectedTool = useCanvasStore((state) => state.selectedTool);
    const gridVisible = useCanvasStore((state) => state.gridVisible);
    const gridSize = useCanvasStore((state) => state.gridSize);

    const creationCursor = useMemo(
        () =>
            ['shape', 'rect', 'text', 'image', 'ai-generator', 'component', 'overlay', 'clip', 'script', 'comment', 'frame', 'canvas', 'scene', 'segment'].includes(
                selectedTool,
            ),
        [selectedTool],
    );

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
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
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

        const action = resolveTool(currentTool);
        const primaryButton = event.button === 0;

        if (primaryButton && action.type !== 'pointer') {
            event.preventDefault();

            if (action.type === 'frame') {
                const width = action.width ?? 960;
                const height = action.height ?? 640;
                const newFrame = store.addFrameAt(
                    {
                        x: canvasPoint.x - width / 2,
                        y: canvasPoint.y - height / 2,
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
                    const element = createElement(action.elementType, targetFrame, canvasPoint);
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
                                typeof window !== 'undefined' ? window.prompt(promptMessage, defaultPrompt) : null;
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

    const gridBackground = useMemo(() => {
        if (!gridVisible || gridSize <= 0) {
            return {};
        }
        const scaledSize = gridSize * scale;
        const offsetX = ((position.x % scaledSize) + scaledSize) % scaledSize;
        const offsetY = ((position.y % scaledSize) + scaledSize) % scaledSize;
        const lineColor = 'rgba(139,92,246,0.1)';
        const strongLine = 'rgba(139,92,246,0.25)';
        const major = gridSize * 4 * scale;
        return {
            backgroundImage: `linear-gradient(to right, ${lineColor} 1px, transparent 1px), linear-gradient(to bottom, ${lineColor} 1px, transparent 1px), linear-gradient(to right, ${strongLine} 1px, transparent 1px), linear-gradient(to bottom, ${strongLine} 1px, transparent 1px)`,
            backgroundSize: `${scaledSize}px ${scaledSize}px, ${scaledSize}px ${scaledSize}px, ${major}px ${major}px, ${major}px ${major}px`,
            backgroundPosition: `${offsetX}px ${offsetY}px, ${offsetX}px ${offsetY}px, ${offsetX}px ${offsetY}px, ${offsetX}px ${offsetY}px`,
        };
    }, [gridVisible, gridSize, position.x, position.y, scale]);

    if (useFabricCanvas) {
        return (
            <>
                <div className='relative h-full w-full overflow-hidden bg-[var(--color-canvas)]' style={{ overscrollBehavior: 'none' }}>
                    <FabricCanvas />
                </div>
                <CanvasContextMenu />
            </>
        );
    }

    return (
        <>
            <div
                ref={viewportRef}
                data-canvas-viewport
                className={clsx(
                    'relative h-full w-full overflow-hidden bg-[var(--color-canvas)]',
                    creationCursor ? 'cursor-crosshair' : 'cursor-default',
                )}
                style={{
                    ...gridBackground,
                    overscrollBehavior: 'none',
                }}
                onWheel={handleWheel}
                onPointerDown={handlePointerDown}
                onContextMenu={handleCanvasContextMenu}
            >
                <div
                    className='absolute left-0 top-0 origin-top-left'
                    style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }}
                >
                    <CanvasLayer />
                </div>
                <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.08),transparent55%)]' />
                <input
                    ref={fileInputRef}
                    type='file'
                    accept='image/*'
                    className='hidden'
                    onChange={handleImageFileChange}
                />
            </div>
            <CanvasContextMenu />
        </>
    );
}
