'use client';

import { useEffect, useMemo, useRef } from 'react';
import clsx from 'clsx';
import { useCanvasStore } from './context/CanvasStore';

const MIN_SCALE = 0.25;
const MAX_SCALE = 4;

export default function FabricCanvas() {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const fabricCanvasRef = useRef(null);
    const fabricNamespaceRef = useRef(null);
    const frameObjectsRef = useRef(new Map());
    const isPanningRef = useRef(false);
    const lastPointerRef = useRef({ x: 0, y: 0 });

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
        let disposed = false;
        let fabricCanvas = null;

        const initialise = async () => {
            const fabricModule = await import('fabric');
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

            const handleSelection = (event) => {
                const selected = event?.selected?.[0] ?? fabricCanvas.getActiveObject();
                if (!selected || !selected.droppleId) {
                    setSelectedFrame(null);
                    return;
                }
                setSelectedFrame(selected.droppleId);
            };

            fabricCanvas.on('selection:created', handleSelection);
            fabricCanvas.on('selection:updated', handleSelection);
            fabricCanvas.on('selection:cleared', () => setSelectedFrame(null));

            fabricCanvas.on('object:modified', (event) => {
                const target = event?.target;
                if (!target || !target.droppleId) return;
                const width = (target.width ?? 0) * (target.scaleX ?? 1);
                const height = (target.height ?? 0) * (target.scaleY ?? 1);
                updateFrame(target.droppleId, {
                    x: target.left ?? 0,
                    y: target.top ?? 0,
                    width,
                    height,
                });
                target.set({ scaleX: 1, scaleY: 1 });
                fabricCanvas.requestRenderAll();
            });

            fabricCanvas.on('mouse:down', (event) => {
                const originalEvent = event?.e;
                if (!originalEvent) return;
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
            if (fabricCanvasRef.current) {
                fabricCanvasRef.current.dispose();
            }
            fabricCanvasRef.current = null;
            fabricNamespaceRef.current = null;
        };
    }, [setPosition, setScale, setSelectedFrame, updateFrame]);

    useEffect(() => {
        const fabricCanvas = fabricCanvasRef.current;
        const fabricNamespace = fabricNamespaceRef.current;
        if (!fabricCanvas || !fabricNamespace) return;

        const objectMap = frameObjectsRef.current;
        const existingIds = new Set(objectMap.keys());

        frames.forEach((frame) => {
            existingIds.delete(frame.id);
            let rect = objectMap.get(frame.id);
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
                objectMap.set(frame.id, rect);
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
        });

        existingIds.forEach((id) => {
            const rect = objectMap.get(id);
            if (rect) {
                fabricCanvas.remove(rect);
                objectMap.delete(id);
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
        </div>
    );
}
