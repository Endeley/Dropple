'use client';

import { useEffect, useRef } from 'react';
import { useCanvasStore } from '@/lib/canvas/store';

const MIN_ZOOM = 0.15;
const MAX_ZOOM = 5;

function getPanFromViewport(canvas) {
    const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
    return { x: vpt[4], y: vpt[5] };
}

export function CanvasStage() {
    const containerRef = useRef(null);
    const canvasElementRef = useRef(null);
    const fabricCanvasRef = useRef(null);
    const setZoom = useCanvasStore((state) => state.setZoom);
    const setPan = useCanvasStore((state) => state.setPan);
    const setIsPanning = useCanvasStore((state) => state.setIsPanning);
    const setSelection = useCanvasStore((state) => state.setSelection);

    useEffect(() => {
        let isSpacePressed = false;
        let isMiddleMouse = false;
        let lastPosX = 0;
        let lastPosY = 0;
        let resizeObserver;
        let cancelled = false;
        let canvas = fabricCanvasRef.current;

        async function initCanvas() {
            if (canvas) {
                return () => {};
            }

            const fabricModule = await import('fabric');
            const fabricCandidate = fabricModule?.default ?? fabricModule?.fabric ?? fabricModule;
            if (!fabricCandidate || !fabricCandidate.Canvas) {
                console.error('Fabric.js failed to load.', fabricModule);
                return;
            }
            if (cancelled) return;
            const fabric = fabricCandidate;
            const element = canvasElementRef.current;
            const container = containerRef.current;
            if (!element || !container) return;

            if (element.__fabricCanvas) {
                element.__fabricCanvas.dispose();
                delete element.__fabricCanvas;
            }

            canvas = new fabric.Canvas(element, {
                backgroundColor: 'rgba(15, 23, 42, 0.015)',
                selection: true,
                preserveObjectStacking: true,
                stopContextMenu: true,
            });
            element.__fabricCanvas = canvas;
            fabricCanvasRef.current = canvas;

            const resize = () => {
                if (!canvas || !canvas.lowerCanvasEl) return;
                const rect = container.getBoundingClientRect();
                canvas.setHeight(rect.height);
                canvas.setWidth(rect.width);
                canvas.calcOffset();
                canvas.renderAll();
            };

            resize();
            resizeObserver = new ResizeObserver(resize);
            resizeObserver.observe(container);

            drawGrid(canvas, fabric);

            const onMouseWheel = (opt) => {
                const { e } = opt;
                if (e.ctrlKey || e.metaKey) {
                    let zoom = canvas.getZoom();
                    zoom *= 0.999 ** e.deltaY;
                    zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
                    canvas.zoomToPoint({ x: e.offsetX, y: e.offsetY }, zoom);
                    setZoom(zoom);
                } else {
                    const vpt = canvas.viewportTransform;
                    if (!vpt) return;
                    vpt[4] -= e.deltaX;
                    vpt[5] -= e.deltaY;
                    canvas.requestRenderAll();
                }
                setPan(getPanFromViewport(canvas));
                opt.e.preventDefault();
                opt.e.stopPropagation();
            };
            canvas.on('mouse:wheel', onMouseWheel);

            const onMouseDown = (opt) => {
                const evt = opt.e;
                const isGridClick = !opt.target;
                isMiddleMouse = evt.button === 1;
                if (isGridClick && (isSpacePressed || evt.altKey || isMiddleMouse)) {
                    setIsPanning(true);
                    lastPosX = evt.clientX;
                    lastPosY = evt.clientY;
                }
            };
            canvas.on('mouse:down', onMouseDown);

            const onMouseMove = (opt) => {
                const evt = opt.e;
                if (useCanvasStore.getState().isPanning) {
                    const vpt = canvas.viewportTransform;
                    if (!vpt) return;
                    vpt[4] += evt.clientX - lastPosX;
                    vpt[5] += evt.clientY - lastPosY;
                    canvas.requestRenderAll();
                    lastPosX = evt.clientX;
                    lastPosY = evt.clientY;
                    setPan(getPanFromViewport(canvas));
                }
            };
            canvas.on('mouse:move', onMouseMove);

            const onMouseUp = () => {
                setIsPanning(false);
                isMiddleMouse = false;
            };
            canvas.on('mouse:up', onMouseUp);

            const onSelectionCreated = ({ selected }) => setSelection(selected || []);
            const onSelectionUpdated = ({ selected }) => setSelection(selected || []);
            const onSelectionCleared = () => setSelection([]);

            canvas.on('selection:created', onSelectionCreated);
            canvas.on('selection:updated', onSelectionUpdated);
            canvas.on('selection:cleared', onSelectionCleared);

            const keyDown = (event) => {
                if (event.code === 'Space') {
                    isSpacePressed = true;
                    event.preventDefault();
                }
            };
            const keyUp = (event) => {
                if (event.code === 'Space') {
                    isSpacePressed = false;
                    setIsPanning(false);
                }
            };
            window.addEventListener('keydown', keyDown, { passive: false });
            window.addEventListener('keyup', keyUp);

            return () => {
                window.removeEventListener('keydown', keyDown);
                window.removeEventListener('keyup', keyUp);
                canvas.off('mouse:wheel', onMouseWheel);
                canvas.off('mouse:down', onMouseDown);
                canvas.off('mouse:move', onMouseMove);
                canvas.off('mouse:up', onMouseUp);
                canvas.off('selection:created', onSelectionCreated);
                canvas.off('selection:updated', onSelectionUpdated);
                canvas.off('selection:cleared', onSelectionCleared);
            };
        }

        let teardown = () => {};
        initCanvas().then((fn) => {
            if (typeof fn === 'function') {
                teardown = fn;
            }
        });

        return () => {
            cancelled = true;
            resizeObserver?.disconnect();
            setSelection([]);
            setIsPanning(false);
            teardown?.();
            if (fabricCanvasRef.current) {
                fabricCanvasRef.current.dispose();
                if (canvasElementRef.current && canvasElementRef.current.__fabricCanvas) {
                    delete canvasElementRef.current.__fabricCanvas;
                }
                fabricCanvasRef.current = null;
            }
        };
    }, [setIsPanning, setPan, setSelection, setZoom]);

    return (
        <div ref={containerRef} className='relative flex-1 overflow-hidden bg-[radial-gradient(circle,_rgba(15,23,42,0.02),_transparent)]'>
            <canvas ref={canvasElementRef} className='block h-full w-full' />
        </div>
    );
}

function drawGrid(canvas, fabricLib) {
    const gridSize = 100;
    const dotRadius = 1.5;
    const dots = [];
    const width = canvas.getWidth();
    const height = canvas.getHeight();

    for (let x = -width; x < width * 2; x += gridSize) {
        for (let y = -height; y < height * 2; y += gridSize) {
            dots.push(
                new fabricLib.Circle({
                    left: x,
                    top: y,
                    radius: dotRadius,
                    fill: 'rgba(148, 163, 184, 0.35)',
                    originX: 'center',
                    originY: 'center',
                    selectable: false,
                    evented: false,
                }),
            );
        }
    }

    canvas.add(...dots);
    canvas.renderAll();
}
