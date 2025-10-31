'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { nanoid } from 'nanoid';
import clsx from 'clsx';
import { useCanvasStore } from './context/CanvasStore';
import { fabricService } from './fabric/fabricServiceSingleton';
import { resolveTool } from './utils/toolBehaviors';
import { createElement } from './utils/elementFactory';
import { findFrameAtPoint } from './utils/frameUtils';
import { MODE_ASSETS, MODE_CANVAS_BEHAVIOR } from './modeConfig';
import { attachMetadata, elementToFabric } from './fabric/fabricAdapters';
import { deriveModeTheme } from './utils/themeUtils';

const MIN_SCALE = 0.25;
const MAX_SCALE = 4;
const DEFAULT_POSITION = Object.freeze({ x: 0, y: 0 });
const NOOP = () => {};

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

const applyCenterSnappingToPoint = (point, frame, snapping = {}) => {
    if (!frame || !snapping.alignCenter) return point;
    const threshold = Math.max(snapping.grid ?? 12, 12);
    const centerX = (frame.x ?? 0) + (frame.width ?? 0) / 2;
    const centerY = (frame.y ?? 0) + (frame.height ?? 0) / 2;
    const next = { ...point };
    if (Math.abs(point.x - centerX) <= threshold) {
        next.x = centerX;
    }
    if (Math.abs(point.y - centerY) <= threshold) {
        next.y = centerY;
    }
    return next;
};

const DRAWING_TOOLS = new Set(['pen', 'brush', 'smudge', 'eraser']);

const DRAW_TOOL_LABELS = {
    pen: 'Vector Path',
    brush: 'Brush Stroke',
    smudge: 'Smudge Stroke',
};

const clonePathData = (path) => {
    if (!path || !Array.isArray(path)) return null;
    return path.map((segment) => [...segment]);
};

const computeSnappingConfig = (storeState, behavior, gridSizeFallback) => {
    const base = behavior?.snapping ?? {};
    const gridSize = Number.isFinite(storeState.gridSize) ? storeState.gridSize : base.grid ?? gridSizeFallback ?? 8;
    return {
        ...base,
        grid: storeState.snapToGrid ? gridSize : 0,
        alignCenter: storeState.snapToCenters ?? base.alignCenter ?? false,
        smartGuides: storeState.snapToGuides ?? base.smartGuides ?? false,
    };
};

export default function FabricCanvas() {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const fabricCanvasRef = useRef(null);
    const fabricNamespaceRef = useRef(null);
    const frameObjectsRef = useRef(new Map());
    const elementObjectsRef = useRef(new Map());
    const drawingBrushesRef = useRef({});
    const isPanningRef = useRef(false);
    const lastPointerRef = useRef({ x: 0, y: 0 });
    const fileInputRef = useRef(null);
    const [pendingImageElement, setPendingImageElement] = useState(null);
    const [fabricReady, setFabricReady] = useState(false);

    const frames = useCanvasStore((state) => state.frames);
    const scale = useCanvasStore((state) => state.scale ?? 1);
    const position = useCanvasStore((state) => state.position) ?? DEFAULT_POSITION;
    const setScale = useCanvasStore((state) => state.setScale) ?? NOOP;
    const setPosition = useCanvasStore((state) => state.setPosition) ?? NOOP;
    const selectedFrameId = useCanvasStore((state) => state.selectedFrameId);
    const setSelectedFrame = useCanvasStore((state) => state.setSelectedFrame);
    const updateFrame = useCanvasStore((state) => state.updateFrame);
    const gridVisible = useCanvasStore((state) => state.gridVisible);
    const gridSize = useCanvasStore((state) => state.gridSize);
    const selectedTool = useCanvasStore((state) => state.selectedTool);
    const rulersVisible = useCanvasStore((state) => state.rulersVisible);
    const getFrameById = useCanvasStore((state) => state.getFrameById);
    const mode = useCanvasStore((state) => state.mode);
    const canvasBehavior = MODE_CANVAS_BEHAVIOR[mode] ?? MODE_CANVAS_BEHAVIOR.default;
    const accentHex = MODE_ASSETS[mode]?.accent ?? '#6366F1';
    const theme = useMemo(() => deriveModeTheme(accentHex), [accentHex]);

    const gridBackground = useMemo(() => {
        if (!gridVisible || gridSize <= 0) {
            return {};
        }
        const scaledSize = gridSize * scale;
        const offsetX = ((position.x % scaledSize) + scaledSize) % scaledSize;
        const offsetY = ((position.y % scaledSize) + scaledSize) % scaledSize;
        const { r, g, b } = theme.accentRgb;
        const lineColor = `rgba(${r}, ${g}, ${b}, 0.14)`;
        const strongLine = `rgba(${r}, ${g}, ${b}, 0.32)`;
        const major = gridSize * 4 * scale;
        return {
            backgroundImage: `linear-gradient(to right, ${lineColor} 1px, transparent 1px), linear-gradient(to bottom, ${lineColor} 1px, transparent 1px), linear-gradient(to right, ${strongLine} 1px, transparent 1px), linear-gradient(to bottom, ${strongLine} 1px, transparent 1px)`,
            backgroundSize: `${scaledSize}px ${scaledSize}px, ${scaledSize}px ${scaledSize}px, ${major}px ${major}px, ${major}px ${major}px`,
            backgroundPosition: `${offsetX}px ${offsetY}px, ${offsetX}px ${offsetY}px, ${offsetX}px ${offsetY}px, ${offsetX}px ${offsetY}px`,
        };
    }, [gridVisible, gridSize, position.x, position.y, scale, theme]);

    const rulerStyles = useMemo(() => {
        if (!rulersVisible) return null;
        const minorStep = Math.max(gridSize * scale, 16);
        const majorStep = minorStep * 4;
        const { r, g, b } = theme.accentRgb;
        const lightTick = `rgba(${r}, ${g}, ${b}, 0.32)`;
        const heavyTick = `rgba(${r}, ${g}, ${b}, 0.58)`;
        const offsetMinorX = ((position.x % minorStep) + minorStep) % minorStep;
        const offsetMajorX = ((position.x % majorStep) + majorStep) % majorStep;
        const offsetMinorY = ((position.y % minorStep) + minorStep) % minorStep;
        const offsetMajorY = ((position.y % majorStep) + majorStep) % majorStep;
        return {
            horizontal: {
                backgroundImage: `linear-gradient(to right, ${lightTick} 1px, transparent 1px), linear-gradient(to right, ${heavyTick} 1px, transparent 1px)`,
                backgroundSize: `${minorStep}px 100%, ${majorStep}px 100%`,
                backgroundPosition: `${offsetMinorX}px 0, ${offsetMajorX}px 0`,
            },
            vertical: {
                backgroundImage: `linear-gradient(${lightTick} 1px, transparent 1px), linear-gradient(${heavyTick} 1px, transparent 1px)`,
                backgroundSize: `100% ${minorStep}px, 100% ${majorStep}px`,
                backgroundPosition: `0 ${offsetMinorY}px, 0 ${offsetMajorY}px`,
            },
        };
    }, [gridSize, rulersVisible, scale, theme.accentRgb, position.x, position.y]);

    useEffect(() => {
        if (!pendingImageElement) return;
        const input = fileInputRef.current;
        if (!input) return;
        input.value = '';
        input.click();
    }, [pendingImageElement]);

    useEffect(() => {
        if (!fabricReady) return;
        const fabricCanvas = fabricCanvasRef.current;
        const fabricNamespace = fabricNamespaceRef.current;
        if (!fabricCanvas || !fabricNamespace) return;

        const { accentRgb, textPrimary } = theme;
        const accentColor = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.9)`;
        const softAccent = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.38)`;

        if (DRAWING_TOOLS.has(selectedTool)) {
            let brush = drawingBrushesRef.current[selectedTool];
            if (!brush) {
                if (selectedTool === 'eraser' && fabricNamespace.EraserBrush) {
                    brush = new fabricNamespace.EraserBrush(fabricCanvas);
                    brush.width = 28;
                } else if (selectedTool === 'smudge' && fabricNamespace.SprayBrush) {
                    brush = new fabricNamespace.SprayBrush(fabricCanvas);
                    brush.width = 30;
                    brush.density = 20;
                    brush.dotWidth = 2;
                    brush.dotWidthVariance = 2;
                } else {
                    brush = new fabricNamespace.PencilBrush(fabricCanvas);
                }
                drawingBrushesRef.current[selectedTool] = brush;
            }

            if (selectedTool === 'pen') {
                brush.width = 2.4;
                brush.color = textPrimary ?? '#F8FAFC';
                brush.decimate = 6;
            } else if (selectedTool === 'brush') {
                brush.width = 8;
                brush.color = accentColor;
                brush.shadow = new fabricNamespace.Shadow({
                    color: softAccent,
                    blur: 6,
                });
            } else if (selectedTool === 'smudge') {
                brush.color = softAccent;
                brush.width = 18;
                brush.randomOpacity = true;
            } else if (selectedTool === 'eraser') {
                brush.width = 26;
            }

            fabricCanvas.isDrawingMode = true;
            fabricCanvas.selection = false;
            fabricCanvas.skipTargetFind = true;
            fabricCanvas.freeDrawingBrush = brush;
            fabricCanvas.discardActiveObject();
            fabricCanvas.requestRenderAll();
            return;
        }

        fabricCanvas.isDrawingMode = false;
        fabricCanvas.selection = true;
        fabricCanvas.skipTargetFind = false;
        fabricCanvas.freeDrawingBrush = fabricCanvas.freeDrawingBrush;
    }, [fabricReady, selectedTool, theme]);

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
            fabricCanvas.setBackgroundColor('rgba(0,0,0,0)', () => fabricCanvas.renderAll());
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
            setFabricReady(true);

            fabricCanvas.on('mouse:down', (event) => {
                const originalEvent = event?.e;
                if (!originalEvent) return;

                const store = useCanvasStore.getState();
                const currentTool = store.selectedTool || 'pointer';
                const action = resolveTool(currentTool, store.mode);
                const pointer = fabricCanvas.getPointer(originalEvent, true);
                const snappingConfig = computeSnappingConfig(store, canvasBehavior, store.gridSize);
                const primaryButton = originalEvent.button === 0;

                if (primaryButton && action.type !== 'pointer') {
                    if (action.type === 'frame') {
                        const defaults = canvasBehavior.frameDefaults ?? {};
                        const width = action.width ?? defaults.width ?? 960;
                        const height = action.height ?? defaults.height ?? 640;
                        const snappedPointer = applySnappingToPoint(pointer, snappingConfig);
                        const referenceFrame =
                            typeof store.getFrameById === 'function' && store.selectedFrameId
                                ? store.getFrameById(store.selectedFrameId)
                                : null;
                        const finalPointer = applyCenterSnappingToPoint(snappedPointer, referenceFrame, snappingConfig);
                        const newFrame = store.addFrameAt(
                            {
                                x: finalPointer.x - width / 2,
                                y: finalPointer.y - height / 2,
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
                            const fallbackPointer = applySnappingToPoint(pointer, snappingConfig);
                            targetFrame = store.addFrameAt(
                                {
                                    x: fallbackPointer.x - 480,
                                    y: fallbackPointer.y - 320,
                                },
                                { width: 960, height: 640 },
                            );
                        }

                        if (targetFrame) {
                            const snappedPointer = applySnappingToPoint(pointer, snappingConfig);
                            const centerAdjustedPointer = applyCenterSnappingToPoint(
                                snappedPointer,
                                targetFrame,
                                snappingConfig,
                            );
                            const element = createElement(action.elementType, targetFrame, centerAdjustedPointer, {
                                mode: store.mode,
                                preset: action.preset,
                            });
                            store.addElementToFrame(targetFrame.id, element);
                            store.setSelectedElement(targetFrame.id, element.id);
                            if (currentTool === 'image') {
                                setPendingImageElement({ frameId: targetFrame.id, elementId: element.id });
                            }
                            if (currentTool === 'ai-generator') {
                                const baseWidth = Math.max(360, element.props?.width ?? 320);
                                const baseHeight = Math.max(160, element.props?.height ?? 160);
                        const storeAfterInsert = useCanvasStore.getState();
                        storeAfterInsert.updateElementProps(
                            targetFrame.id,
                            element.id,
                            {
                                text: 'Generating AI copy…',
                                width: baseWidth,
                                height: baseHeight,
                            },
                            { skipHistory: true },
                        );

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
                                targetFrame.id,
                                element.id,
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
                                                targetFrame.id,
                                                element.id,
                                                {
                                                    text: generatedText,
                                                    width: baseWidth,
                                                },
                                                { historyLabel: 'AI text update', source: 'system' },
                                            );
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

            fabricCanvas.on('path:created', (event) => {
                const path = event?.path;
                if (!path) return;
                const store = useCanvasStore.getState();
                const currentTool = store.selectedTool;
                if (currentTool === 'eraser') {
                    fabricCanvas.remove(path);
                    fabricCanvas.requestRenderAll();
                    return;
                }

                const framesState = store.frames ?? [];
                const absoluteWidth = Math.max((path.width ?? 0) * (path.scaleX ?? 1), 1);
                const absoluteHeight = Math.max((path.height ?? 0) * (path.scaleY ?? 1), 1);
                const centerPoint =
                    typeof path.getCenterPoint === 'function'
                        ? path.getCenterPoint()
                        : {
                              x: (path.left ?? 0) + absoluteWidth / 2,
                              y: (path.top ?? 0) + absoluteHeight / 2,
                          };
                let frame =
                    (store.selectedFrameId && framesState.find((item) => item.id === store.selectedFrameId)) ||
                    findFrameAtPoint(framesState, centerPoint);
                if (!frame) {
                    frame = store.addFrameAt(
                        { x: centerPoint.x - 480, y: centerPoint.y - 320 },
                        { width: 960, height: 640 },
                    );
                }
                if (!frame) {
                    fabricCanvas.remove(path);
                    fabricCanvas.requestRenderAll();
                    return;
                }

                const frameX = frame.x ?? 0;
                const frameY = frame.y ?? 0;
                const pathObject = path.toObject ? path.toObject(['path']) : null;
                const pathDataRaw = Array.isArray(path.path) && path.path.length > 0 ? path.path : pathObject?.path;
                const pathData = clonePathData(pathDataRaw);
                if (!pathData) {
                    fabricCanvas.remove(path);
                    fabricCanvas.requestRenderAll();
                    return;
                }

                const brushType =
                    currentTool === 'smudge' ? 'smudge' : currentTool === 'brush' ? 'brush' : 'pen';
                const elementId = `stroke-${nanoid(6)}`;

                const element = {
                    id: elementId,
                    type: 'path',
                    name: DRAW_TOOL_LABELS[brushType] ?? 'Stroke',
                    parentId: null,
                    props: {
                        x: (path.left ?? 0) - frameX,
                        y: (path.top ?? 0) - frameY,
                        width: absoluteWidth,
                        height: absoluteHeight,
                        opacity: path.opacity ?? 1,
                        pathData,
                        stroke: path.stroke ?? theme.accent,
                        strokeWidth: path.strokeWidth ?? 2.5,
                        strokeLineCap: path.strokeLineCap ?? 'round',
                        strokeLineJoin: path.strokeLineJoin ?? 'round',
                        fill: typeof path.fill === 'string' ? path.fill : 'transparent',
                        brushType,
                    },
                };

                path.set({
                    left: frameX + element.props.x,
                    top: frameY + element.props.y,
                    originX: 'left',
                    originY: 'top',
                    scaleX: 1,
                    scaleY: 1,
                });
                path.brushType = brushType;
                path.droppleFrameId = frame.id;
                attachMetadata(path, {
                    droppleId: elementId,
                    droppleType: 'element',
                    elementType: 'path',
                });
                elementObjectsRef.current.set(elementId, path);

                store.addElementToFrame(frame.id, element, null, { historyLabel: 'Draw stroke' });
                store.setSelectedElement(frame.id, elementId);
                fabricCanvas.requestRenderAll();
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
        if (!fabricReady) return;
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
                    fill: frame.backgroundColor ?? theme.canvasBg,
                    stroke: theme.accent,
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
                fill: frame.backgroundColor ?? theme.canvasBg,
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
                                if (props.backgroundRemoved && fabricNamespace?.filters?.RemoveColor) {
                                    const RemoveColor = fabricNamespace.filters.RemoveColor;
                                    image.filters = [
                                        new RemoveColor({
                                            color: props.removeBgColor ?? '#ffffff',
                                            distance: props.removeBgDistance ?? 0.36,
                                        }),
                                    ];
                                    image.applyFilters();
                                }
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
                    } else if (element.type === 'path') {
                        const baseWidth = fabricObject.width ?? props.width ?? 1;
                        const baseHeight = fabricObject.height ?? props.height ?? 1;
                        const targetWidth = Math.max(props.width ?? baseWidth, 1);
                        const targetHeight = Math.max(props.height ?? baseHeight, 1);
                        const scaleX = baseWidth ? targetWidth / baseWidth : 1;
                        const scaleY = baseHeight ? targetHeight / baseHeight : 1;
                        fabricObject.set({
                            stroke: props.stroke ?? fabricObject.stroke ?? theme.accent,
                            strokeWidth: props.strokeWidth ?? fabricObject.strokeWidth ?? 2.5,
                            fill: props.fill ?? fabricObject.fill ?? 'transparent',
                            strokeLineCap: props.strokeLineCap ?? fabricObject.strokeLineCap ?? 'round',
                            strokeLineJoin: props.strokeLineJoin ?? fabricObject.strokeLineJoin ?? 'round',
                        });
                        fabricObject.scaleX = scaleX;
                        fabricObject.scaleY = scaleY;
                        fabricObject.brushType = props.brushType ?? fabricObject.brushType ?? 'pen';
                    } else if (element.type === 'image' && props.width && props.height) {
                        fabricObject.scaleToWidth(props.width);
                        fabricObject.scaleToHeight(props.height);
                        fabricObject.set({ scaleX: 1, scaleY: 1, width: props.width, height: props.height });
                        if (props.backgroundRemoved && fabricNamespace?.filters?.RemoveColor) {
                            const RemoveColor = fabricNamespace.filters.RemoveColor;
                            const desiredFilter = new RemoveColor({
                                color: props.removeBgColor ?? '#ffffff',
                                distance: props.removeBgDistance ?? 0.36,
                            });
                            const existing = fabricObject.filters ?? [];
                            const alreadyApplied =
                                existing.length === 1 &&
                                existing[0]?.type === desiredFilter.type &&
                                existing[0]?.color === desiredFilter.color &&
                                existing[0]?.distance === desiredFilter.distance;
                            if (!alreadyApplied) {
                                fabricObject.filters = [desiredFilter];
                                fabricObject.applyFilters();
                            }
                        } else if (fabricObject.filters?.length) {
                            fabricObject.filters = [];
                            fabricObject.applyFilters();
                        }
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
    }, [frames, theme, fabricReady]);

    useEffect(() => {
        if (!fabricReady) return;
        const fabricCanvas = fabricCanvasRef.current;
        if (!fabricCanvas) return;
        const transform = fabricCanvas.viewportTransform ?? [1, 0, 0, 1, 0, 0];
        transform[0] = scale;
        transform[3] = scale;
        transform[4] = position.x;
        transform[5] = position.y;
        fabricCanvas.setViewportTransform(transform);
        fabricCanvas.requestRenderAll();
    }, [position.x, position.y, scale, fabricReady]);

    useEffect(() => {
        if (!fabricReady) return;
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
    }, [selectedFrameId, fabricReady]);

    useEffect(() => {
        if (!fabricReady) return;
        const container = containerRef.current;
        if (!container) return;

        const resize = () => {
            const fabricCanvas = fabricCanvasRef.current;
            if (!fabricCanvas) return;
            const rect = container.getBoundingClientRect();
            fabricCanvas.setWidth(rect.width);
            fabricCanvas.setHeight(rect.height);
            fabricCanvas.renderAll();
        };

        resize();
        const observer = new ResizeObserver(resize);
        observer.observe(container);
        return () => observer.disconnect();
    }, [fabricReady]);

    return (
        <div
            ref={containerRef}
            className={clsx('relative h-full w-full overflow-hidden')}
            style={{ ...gridBackground, overscrollBehavior: 'none', backgroundColor: theme.canvasBg }}
        >
            <canvas ref={canvasRef} className='relative z-10 block h-full w-full' />
            {rulersVisible && rulerStyles ? (
                <>
                    <div
                        aria-hidden
                        className='pointer-events-none absolute left-0 right-0 top-0 z-20 h-6 border-b border-[var(--mode-border)] bg-[var(--mode-sidebar-bg)]/90'
                        style={rulerStyles.horizontal}
                    />
                    <div
                        aria-hidden
                        className='pointer-events-none absolute bottom-0 left-0 top-0 z-20 w-6 border-r border-[var(--mode-border)] bg-[var(--mode-sidebar-bg)]/90'
                        style={rulerStyles.vertical}
                    />
                </>
            ) : null}
            <div
                className='pointer-events-none absolute inset-0'
                style={{ background: `radial-gradient(circle at top, rgba(${theme.accentRgb.r}, ${theme.accentRgb.g}, ${theme.accentRgb.b}, ${canvasBehavior.heavy ? 0.2 : 0.12}), transparent 55%)` }}
            />
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
