'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { useCanvasStore } from './context/CanvasStore';
import { fabricService } from './fabric/fabricServiceSingleton';
import { resolveTool } from './utils/toolBehaviors';
import { createElement } from './utils/elementFactory';
import { findFrameAtPoint } from './utils/frameUtils';
import { attachMetadata, elementToFabric } from './fabric/fabricAdapters';

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

    useEffect(() => {
        if (!pendingImageElement) return;
        const input = fileInputRef.current;
        if (!input) return;
        input.value = '';
        input.click();
    }, [pendingImageElement]);

    useEffect(() => {
        let disposed = false;
        let fabricCanvas = null;

        const initialise = async () => {
            const fabricModule = await fabricService.ensureFabricModule();
            if (disposed) return;
            const { fabric } = fabricModule;
            fabricNamespaceRef.current = fabric;

            const canvasElement = canvasRef.current;
            if (!canvasElement) return;

            fabricCanvas = new fabric.Canvas(canvasElement, {
                preserveObjectStacking: true,
                selection: true,
            });
            fabricCanvas.setBackgroundColor('#020617', () => fabricCanvas.renderAll());
            fabricCanvasRef.current = fabricCanvas;

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
                    updateFrame(frameId, updates);
                    const latest = useCanvasStore.getState();
                    latest.commitHistory('Update frame');
                },
                onElementChange: (frameId, elementId, updates) => {
                    const store = useCanvasStore.getState();
                    store.updateElementProps(frameId, elementId, updates);
                    store.commitHistory('Update element');
                },
            });
            fabricService.setCanvas(fabricCanvas);
            window.addEventListener('keydown', handleKeyDown);

            fabricCanvas.on('mouse:down', (event) => {
                const originalEvent = event?.e;
                if (!originalEvent) return;

                const store = useCanvasStore.getState();
                const currentTool = store.selectedTool || 'pointer';
                const action = resolveTool(currentTool);
                const pointer = fabricCanvas.getPointer(originalEvent, true);
                const primaryButton = originalEvent.button === 0;

                if (primaryButton && action.type !== 'pointer') {
                    if (action.type === 'frame') {
                        const width = action.width ?? 960;
                        const height = action.height ?? 640;
                        const newFrame = store.addFrameAt(
                            {
                                x: pointer.x - width / 2,
                                y: pointer.y - height / 2,
                            },
                            { width, height },
                        );
                        if (newFrame) {
                            store.setSelectedFrame(newFrame.id);
                            store.commitHistory('Add frame');
                        }
                        return;
                    }

                    if (action.type === 'element') {
                        let targetFrame = findFrameAtPoint(store.frames, pointer);
                        if (!targetFrame) {
                            targetFrame = store.addFrameAt(
                                {
                                    x: pointer.x - 480,
                                    y: pointer.y - 320,
                                },
                                { width: 960, height: 640 },
                            );
                        }

                        if (targetFrame) {
                            const element = createElement(action.elementType, targetFrame, pointer);
                            store.addElementToFrame(targetFrame.id, element);
                            store.setSelectedElement(targetFrame.id, element.id);
                            if (currentTool === 'image') {
                                setPendingImageElement({ frameId: targetFrame.id, elementId: element.id });
                            }
                            if (currentTool === 'ai-generator') {
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
                                            latestStore.commitHistory('AI text update', 'system');
                                        });
                                }, 0);
                            }
                            store.commitHistory(`Add ${action.elementType}`);
                        }
                        return;
                    }
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
                fabricCanvasRef.current.dispose();
            }
            fabricService.setCanvas(null);
            fabricCanvasRef.current = null;
            fabricNamespaceRef.current = null;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [setPosition, setScale, setSelectedFrame, updateFrame]);

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
                store.updateElementProps(current.frameId, current.elementId, {
                    imageUrl: reader.result,
                    fill: 'transparent',
                });
                store.commitHistory('Update image');
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
                fabricCanvas.sendToBack(rect);
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
                        fabricNamespace.fabric.Image.fromURL(
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
                        fabricObject = elementToFabric(element, frame, fabricNamespace.fabric);
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
                        });
                    } else if (element.type === 'image' && props.width && props.height) {
                        fabricObject.scaleToWidth(props.width);
                        fabricObject.scaleToHeight(props.height);
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
            className={clsx('relative h-full w-full overflow-hidden bg-[var(--color-canvas)]')}
            style={{ ...gridBackground, overscrollBehavior: 'none' }}
        >
            <canvas ref={canvasRef} className='block h-full w-full' />
            <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.08),transparent55%)]' />
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
