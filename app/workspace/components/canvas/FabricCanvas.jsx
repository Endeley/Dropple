'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { useCanvasStore } from './context/CanvasStore';
import { fabricService } from './fabric/fabricServiceSingleton';
import { resolveTool } from './utils/toolBehaviors';
import { MODE_CANVAS_BEHAVIOR } from './modeConfig';
import { attachMetadata, elementToFabric, extractMetadata } from './fabric/fabricAdapters';
import { findFrameAtPoint } from './utils/frameUtils';

const MIN_SCALE = 0.25;
const MAX_SCALE = 4;

export default function FabricCanvas() {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const fabricCanvasRef = useRef(null);
    const fabricNamespaceRef = useRef(null);
    const frameObjectsRef = useRef(new Map());
    const elementObjectsRef = useRef(new Map());
    const isPanningRef = useRef(false);
    const lastPointerRef = useRef({ x: 0, y: 0 });
    const fileInputRef = useRef(null);
    const [pendingImageElement, setPendingImageElement] = useState(null);

    const frames = useCanvasStore((state) => state.frames);
    const scale = useCanvasStore((state) => state.scale);
    const position = useCanvasStore((state) => state.position);
    const setScale = useCanvasStore((state) => state.setScale);
    const setPosition = useCanvasStore((state) => state.setPosition);
    const selectedFrameId = useCanvasStore((state) => state.selectedFrameId);
    const setSelectedFrame = useCanvasStore((state) => state.setSelectedFrame);
    const updateFrame = useCanvasStore((state) => state.updateFrame);
    const gridVisible = useCanvasStore((state) => state.gridVisible);
    const gridSize = useCanvasStore((state) => state.gridSize);
    const getFrameById = useCanvasStore((state) => state.getFrameById);
    const mode = useCanvasStore((state) => state.mode);
    const canvasBehavior = MODE_CANVAS_BEHAVIOR[mode] ?? MODE_CANVAS_BEHAVIOR.default;

    const gridBackground = useMemo(() => {
        if (!gridVisible || gridSize <= 0) {
            return null;
        }
        const scaledSize = gridSize * scale;
        const offsetX = 0;
        const offsetY = 0;
        const lineColor = 'rgba(139,92,246,0.12)';
        const strongLine = 'rgba(139,92,246,0.28)';
        const major = gridSize * 4 * scale;
        return {
            backgroundImage: `linear-gradient(to right, ${lineColor} 1px, transparent 1px), linear-gradient(to bottom, ${lineColor} 1px, transparent 1px), linear-gradient(to right, ${strongLine} 1px, transparent 1px), linear-gradient(to bottom, ${strongLine} 1px, transparent 1px)`,
            backgroundSize: `${scaledSize}px ${scaledSize}px, ${scaledSize}px ${scaledSize}px, ${major}px ${major}px, ${major}px ${major}px`,
            backgroundPosition: `${offsetX}px ${offsetY}px, ${offsetX}px ${offsetY}px, ${offsetX}px ${offsetY}px, ${offsetX}px ${offsetY}px`,
        };
    }, [gridVisible, gridSize, position.x, position.y, scale]);
    useEffect(() => {
        if (!pendingImageElement) return;
        const input = fileInputRef.current;
        if (!input) return;
        input.value = '';
        input.click();
    }, [pendingImageElement]);

    const historyHotkeyHandler = useCallback((event) => {
        const store = useCanvasStore.getState();
        if (event.metaKey || event.ctrlKey) {
            const key = event.key.toLowerCase();
            if (key === 'z') {
                event.preventDefault();
                if (event.shiftKey) {
                    store.redoCanvas();
                } else {
                    store.undoCanvas();
                }
            }
        }
    }, []);

    useEffect(() => {
        let disposed = false;
        let hydrationResolved = false;
        const handleAfterRender = () => {
            if (hydrationResolved) return;
            const store = useCanvasStore.getState();
            if (store.isSceneHydrating) {
                hydrationResolved = true;
                store.finishSceneHydration();
                fabricCanvasRef.current?.off('after:render', handleAfterRender);
            }
        };
        window.addEventListener('keydown', historyHotkeyHandler);
        let fabricCanvas = null;

        const handleCanvasContextMenu = (event) => {
            event.preventDefault();
        };

        const initialise = async () => {
            const fabricModule = await fabricService.ensureFabricModule();
            if (disposed) return;
            const { fabric } = fabricModule;
            fabricNamespaceRef.current = fabric;

            const canvasElement = canvasRef.current;
            if (!canvasElement) return;

            canvasElement.addEventListener('contextmenu', handleCanvasContextMenu);

            fabricCanvas = new fabric.Canvas(canvasElement, {
                preserveObjectStacking: true,
                selection: true,
            });
            fabricCanvas.setBackgroundColor('#020617', () => fabricCanvas.renderAll());
            fabricCanvasRef.current = fabricCanvas;
            fabricCanvas.on('after:render', handleAfterRender);

            fabricService.updateConfig({
                onSelectionChange: ({ frameIds, elementIds }) => {
                    const store = useCanvasStore.getState();
                    if (frameIds.length) {
                        store.setSelectedFrame(frameIds[frameIds.length - 1]);
                    }
                    if (frameIds.length === 0) {
                        store.setSelectedFrame(null);
                    }
                    if (elementIds.length) {
                        const frameId = frameIds[frameIds.length - 1] ?? store.selectedFrameId;
                        if (frameId) {
                            store.setSelectedElement(frameId, elementIds[elementIds.length - 1]);
                        }
                    }
                    if (elementIds.length === 0) {
                        store.setSelectedElement(store.selectedFrameId, null);
                    }
                },
                onFrameChange: (frameId, updates) => {
                    updateFrame(frameId, updates, { historyLabel: 'Fabric: Update frame', source: 'fabric' });
                },
                onElementChange: (frameId, elementId, updates) => {
                    const store = useCanvasStore.getState();
                    store.updateElementProps(frameId, elementId, updates, {
                        historyLabel: 'Fabric: Update element',
                        source: 'fabric',
                    });
                },
                onElementsChange: (frameId, entries) => {
                    const store = useCanvasStore.getState();
                    store.updateElementsPropsBatch(
                        frameId,
                        entries,
                        { historyLabel: 'Fabric: Update elements', source: 'fabric' },
                    );
                },
                getFrameById,
            });
            fabricService.setCanvas(fabricCanvas);

            const openContextMenu = (originalEvent, fabricTarget, pointer) => {
                if (!originalEvent || typeof originalEvent.clientX !== 'number') return;
                originalEvent.preventDefault();
                const storeState = useCanvasStore.getState();
                const metadata = fabricTarget ? extractMetadata(fabricTarget) : null;
                let contextType = 'canvas';
                const context = {
                    type: contextType,
                    position: { x: originalEvent.clientX, y: originalEvent.clientY },
                    canvasPoint: { x: pointer.x, y: pointer.y },
                    frameId: null,
                    elementId: null,
                };

                if (metadata?.droppleType === 'element') {
                    contextType = 'element';
                    context.frameId = fabricTarget?.droppleFrameId ?? null;
                    context.elementId = metadata.droppleId;
                    if (context.frameId && context.elementId) {
                        storeState.setSelectedFrame(context.frameId);
                        storeState.setSelectedElement(context.frameId, context.elementId);
                    }
                } else if (metadata?.droppleType === 'frame') {
                    contextType = 'frame';
                    context.frameId = metadata.droppleId;
                    if (context.frameId) {
                        storeState.setSelectedFrame(context.frameId);
                    }
                } else {
                    const frames = storeState.frames ?? [];
                    const frame = findFrameAtPoint(frames, pointer);
                    context.frameId = frame?.id ?? null;
                    if (context.frameId) {
                        storeState.setSelectedFrame(context.frameId);
                    }
                }

                storeState.setContextMenu({
                    type: contextType,
                    frameId: context.frameId ?? undefined,
                    elementId: context.elementId ?? undefined,
                    position: context.position,
                    canvasPoint: context.canvasPoint,
                });
            };

            fabricCanvas.on('mouse:down', (event) => {
                const originalEvent = event?.e;
                if (!originalEvent) return;

                const store = useCanvasStore.getState();
                const currentTool = store.selectedTool || 'pointer';
                const action = resolveTool(currentTool, store.mode);
                const pointer = fabricCanvas.getPointer(originalEvent, true);
                const primaryButton = originalEvent.button === 0;
                const isContextClick = originalEvent.button === 2;

                if (isContextClick) {
                    openContextMenu(originalEvent, event?.target ?? null, pointer);
                    return;
                }

                if (primaryButton && action.type !== 'pointer') {
                    originalEvent.preventDefault();
                    if (typeof action.perform === 'function') {
                        const outcome = action.perform({
                            pointer,
                            canvasBehavior,
                            mode: store.mode,
                            behavior: action,
                        });

                        Promise.resolve(outcome).then((result) => {
                            if (!result) return;
                            if (result.requestImageUpload) {
                                setPendingImageElement(result.requestImageUpload);
                            }
                            if (result.aiGenerator) {
                                const { frameId, elementId, baseWidth, baseHeight } = result.aiGenerator;
                                setTimeout(() => {
                                    const promptMessage = 'Describe the copy you want generated for this block:';
                                    const defaultPrompt =
                                        'Write a short Dropple landing page headline and supporting sentence.';
                                    const userInput =
                                        typeof window !== 'undefined' ? window.prompt(promptMessage, defaultPrompt) : null;
                                    const instructions =
                                        userInput && userInput.trim().length > 0 ? userInput.trim() : defaultPrompt;

                                    const storeAfterPrompt = useCanvasStore.getState();
                                    storeAfterPrompt.updateElementProps(
                                        frameId,
                                        elementId,
                                        {
                                            text: 'Generating AI copy…',
                                            width: baseWidth,
                                        },
                                        { skipHistory: true },
                                    );

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
                                            latestStore.updateElementProps(
                                                frameId,
                                                elementId,
                                                {
                                                    text: generatedText,
                                                    width: baseWidth,
                                                },
                                                { historyLabel: 'AI text update', source: 'system' },
                                            );
                                        });
                                }, 0);
                            }
                        });
                    }
                    return;
                }

                if (originalEvent.button === 1 || originalEvent.button === 2 || originalEvent.altKey) {
                    isPanningRef.current = true;
                    lastPointerRef.current = { x: originalEvent.clientX, y: originalEvent.clientY };
                    fabricCanvas.setCursor('grab');
                }
            });

            fabricCanvas.on('mouse:up', () => {
                isPanningRef.current = false;
                fabricCanvas.setCursor('default');
            });

            fabricCanvas.on('mouse:move', (event) => {
                if (!isPanningRef.current) return;
                const { e } = event;
                if (!e) return;
                const deltaX = e.clientX - lastPointerRef.current.x;
                const deltaY = e.clientY - lastPointerRef.current.y;
                setPosition((prev) => ({
                    x: prev.x + deltaX,
                    y: prev.y + deltaY,
                }));
                lastPointerRef.current = { x: e.clientX, y: e.clientY };
            });

            fabricCanvas.on('mouse:wheel', (event) => {
                const domEvent = event?.e;
                if (!domEvent) return;
                domEvent.preventDefault();
                if (domEvent.ctrlKey || domEvent.metaKey) {
                    const direction = domEvent.deltaY > 0 ? -1 : 1;
                    setScale((prev) => {
                        const next =
                            direction > 0 ? prev * 1.1 : prev / 1.1;
                        return Math.max(MIN_SCALE, Math.min(MAX_SCALE, next));
                    });
                } else {
                    setPosition((prev) => ({
                        x: prev.x - domEvent.deltaX,
                        y: prev.y - domEvent.deltaY,
                    }));
                }
            });
        };

        initialise();

        return () => {
            disposed = true;
            frameObjectsRef.current.clear();
            elementObjectsRef.current.forEach((object) => {
                if (fabricCanvasRef.current) {
                    fabricCanvasRef.current.remove(object);
                }
            });
            elementObjectsRef.current.clear();
            if (fabricCanvasRef.current) {
                fabricCanvasRef.current.off('after:render', handleAfterRender);
                fabricCanvasRef.current.dispose();
            }
            fabricService.setCanvas(null);
            fabricCanvasRef.current = null;
            fabricNamespaceRef.current = null;
            window.removeEventListener('keydown', historyHotkeyHandler);
            const canvasElement = canvasRef.current;
            if (canvasElement) {
                canvasElement.removeEventListener('contextmenu', handleCanvasContextMenu);
            }
        };
    }, [historyHotkeyHandler, setPosition, setScale, setSelectedFrame, updateFrame, getFrameById]);

    const handleImageFileChange = (event) => {
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
                store.updateElementProps(
                    current.frameId,
                    current.elementId,
                    {
                        imageUrl: reader.result,
                        fill: 'transparent',
                    },
                    { historyLabel: 'Update image' },
                );
            }
            setPendingImageElement(null);
            if (input) input.value = '';
        };
        reader.onerror = () => {
            setPendingImageElement(null);
            if (input) input.value = '';
        };
        reader.readAsDataURL(file);
    };

    useEffect(() => {
        const fabricCanvas = fabricCanvasRef.current;
        const fabricNamespace = fabricNamespaceRef.current;
        if (!fabricCanvas || !fabricNamespace) return;

        const frameMap = frameObjectsRef.current;
        const frameIds = new Set(frameMap.keys());
        const elementMap = elementObjectsRef.current;
        const elementIds = new Set(elementMap.keys());

        frames.forEach((frame) => {
            frameIds.delete(frame.id);
            let rect = frameMap.get(frame.id);
            if (!rect) {
                rect = new fabricNamespace.Rect({
                    fill: frame.backgroundColor ?? 'rgba(15,23,42,0.9)',
                    stroke: 'rgba(139,92,246,0.4)',
                    strokeWidth: 1.5,
                    rx: frame.cornerRadius ?? 24,
                    ry: frame.cornerRadius ?? 24,
                });
                rect.set({
                    droppleId: frame.id,
                    hasControls: true,
                    strokeUniform: true,
                    originX: 'left',
                    originY: 'top',
                });
                frameMap.set(frame.id, rect);
                fabricCanvas.add(rect);
            }

            rect.set({
                left: frame.x ?? 0,
                top: frame.y ?? 0,
                width: frame.width ?? 960,
                height: frame.height ?? 640,
                fill: frame.backgroundColor ?? 'rgba(15,23,42,0.9)',
                rx: frame.cornerRadius ?? 24,
                ry: frame.cornerRadius ?? 24,
            });

            (frame.elements ?? []).forEach((element) => {
                elementIds.delete(element.id);
                let fabricObject = elementMap.get(element.id);
                if (!fabricObject) {
                    if (element.type === 'image' && element.props?.imageUrl) {
                        fabricNamespace.Image.fromURL(
                            element.props.imageUrl,
                            (image) => {
                                if (!image) return;
                                attachMetadata(image, {
                                    droppleId: element.id,
                                    droppleType: 'element',
                                    elementType: element.type,
                                });
                                image.droppleFrameId = frame.id;
                                const props = element.props ?? {};
                                const frameX = frame.x ?? 0;
                                const frameY = frame.y ?? 0;
                                const left = frameX + (props.x ?? 0);
                                const top = frameY + (props.y ?? 0);
                                image.set({ left, top, originX: 'left', originY: 'top' });
                                if (props.width) image.scaleToWidth(props.width);
                                if (props.height) image.scaleToHeight(props.height);
                                elementMap.set(element.id, image);
                                fabricCanvas.add(image);
                                fabricCanvas.requestRenderAll();
                            },
                            { crossOrigin: 'anonymous' },
                        );
                        return;
                    } else {
                        fabricObject = elementToFabric(element, frame, fabricNamespace);
                        if (fabricObject) {
                            attachMetadata(fabricObject, {
                                droppleId: element.id,
                                droppleType: 'element',
                                elementType: element.type,
                            });
                            fabricObject.droppleFrameId = frame.id;
                            elementMap.set(element.id, fabricObject);
                            fabricCanvas.add(fabricObject);
                        }
                    }
                }

                if (fabricObject) {
                    const props = element.props ?? {};
                    const frameX = frame.x ?? 0;
                    const frameY = frame.y ?? 0;
                    const left = frameX + (props.x ?? 0);
                    const top = frameY + (props.y ?? 0);
                    fabricObject.set({
                        left,
                        top,
                        opacity: props.opacity ?? fabricObject.opacity ?? 1,
                        angle: props.rotation ?? 0,
                        scaleX: 1,
                        scaleY: 1,
                        skewX: props.skewX ?? 0,
                        skewY: props.skewY ?? 0,
                    });

                    if (element.type === 'rect' || element.type === 'shape' || element.type === 'overlay' || element.type === 'clip') {
                        fabricObject.set({
                            width: props.width ?? fabricObject.width ?? 240,
                            height: props.height ?? fabricObject.height ?? 160,
                            fill: props.fill ?? fabricObject.fill,
                            rx: props.cornerRadius ?? fabricObject.rx ?? 0,
                            ry: props.cornerRadius ?? fabricObject.ry ?? 0,
                            stroke: props.stroke ?? fabricObject.stroke,
                            strokeWidth: props.strokeWidth ?? fabricObject.strokeWidth ?? 1,
                        });
                    } else if (element.type === 'text' || element.type === 'script') {
                        fabricObject.set({
                            text: props.text ?? element.name ?? 'Text',
                            fontSize: props.fontSize ?? fabricObject.fontSize ?? 24,
                            fill: props.fill ?? fabricObject.fill ?? '#ECE9FE',
                            fontFamily: props.fontFamily ?? fabricObject.fontFamily ?? 'Inter, system-ui, sans-serif',
                            width: props.width ?? fabricObject.width ?? 320,
                            lineHeight: props.lineHeight ?? fabricObject.lineHeight ?? 1.3,
                            charSpacing:
                                ((props.letterSpacing ?? 0) * 1000) /
                                (props.fontSize ?? fabricObject.fontSize ?? 24),
                            fontWeight: props.fontWeight ?? fabricObject.fontWeight ?? '500',
                            textAlign: props.align ?? fabricObject.textAlign ?? 'left',
                        });
                    } else if (element.type === 'image' && props.width && props.height) {
                        fabricObject.scaleToWidth(props.width);
                        fabricObject.scaleToHeight(props.height);
                        fabricObject.set({ scaleX: 1, scaleY: 1, width: props.width, height: props.height });
                    }

                    fabricObject.setCoords();
                    fabricCanvas.bringToFront(fabricObject);
                }
            });
        });

        frameIds.forEach((id) => {
            const rect = frameMap.get(id);
            if (rect) {
                fabricCanvas.remove(rect);
                frameMap.delete(id);
            }
        });

        elementIds.forEach((id) => {
            const obj = elementMap.get(id);
            if (obj) {
                fabricCanvas.remove(obj);
                elementMap.delete(id);
            }
        });

        fabricCanvas.requestRenderAll();
    }, [frames]);

    useEffect(() => {
        const fabricCanvas = fabricCanvasRef.current;
        if (!fabricCanvas) return;
        const transform = fabricCanvas.viewportTransform ?? [1, 0, 0, 1, 0, 0];
        transform[0] = scale;
        transform[3] = scale;
        transform[4] = position.x;
        transform[5] = position.y;
        fabricCanvas.setViewportTransform(transform);
        fabricCanvas.requestRenderAll();
    }, [position.x, position.y, scale]);

    useEffect(() => {
        const fabricCanvas = fabricCanvasRef.current;
        if (!fabricCanvas) return;
        const objectMap = frameObjectsRef.current;
        if (!selectedFrameId) {
            fabricCanvas.discardActiveObject();
            fabricCanvas.requestRenderAll();
            return;
        }

        const target = objectMap.get(selectedFrameId);
        if (target) {
            fabricCanvas.setActiveObject(target);
            fabricCanvas.requestRenderAll();
        }
    }, [selectedFrameId]);

    useEffect(() => {
        const container = containerRef.current;
        const fabricCanvas = fabricCanvasRef.current;
        if (!container || !fabricCanvas) return;

        const resize = () => {
            const rect = container.getBoundingClientRect();
            fabricCanvas.setWidth(rect.width);
            fabricCanvas.setHeight(rect.height);
            fabricCanvas.renderAll();
        };

        resize();
        const observer = new ResizeObserver(resize);
        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={containerRef}
            className={clsx('relative h-full w-full overflow-hidden bg-[#020617]')}
            style={{ ...gridBackground, overscrollBehavior: 'none' }}
        >
            <canvas ref={canvasRef} className='block h-full w-full' />
            <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                className='hidden'
                onChange={handleImageFileChange}
            />
        </div>
    );
}
