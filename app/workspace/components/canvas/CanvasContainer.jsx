'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Stage } from 'react-konva';
import CanvasLayer from './CanvasLayer';
import { useCanvasStore } from './context/CanvasStore';

const SCALE_STEP = 1.1;

export default function CanvasContainer() {
    const wrapperRef = useRef(null);
    const stageRef = useRef(null);
    const [viewport, setViewport] = useState({ width: 0, height: 0 });
    const scale = useCanvasStore((state) => state.scale);
    const setScale = useCanvasStore((state) => state.setScale);
    const position = useCanvasStore((state) => state.position);
    const setPosition = useCanvasStore((state) => state.setPosition);

    useEffect(() => {
        const node = wrapperRef.current;
        if (!node) return;

        const updateSize = () => {
            const rect = node.getBoundingClientRect();
            setViewport({ width: rect.width, height: rect.height });
        };

        updateSize();
        const observer = new ResizeObserver(updateSize);
        observer.observe(node);

        return () => observer.disconnect();
    }, []);

    const handleWheel = useCallback(
        (event) => {
            event.evt.preventDefault();
            const stage = stageRef.current;
            if (!stage) return;

            const oldScale = stage.scaleX();
            const pointer = stage.getPointerPosition();
            const mousePointTo = {
                x: (pointer.x - stage.x()) / oldScale,
                y: (pointer.y - stage.y()) / oldScale,
            };

            const direction = event.evt.deltaY > 0 ? -1 : 1;
            const newScale = direction > 0 ? oldScale * SCALE_STEP : oldScale / SCALE_STEP;

            stage.scale({ x: newScale, y: newScale });
            setScale(newScale);

            const newPosition = {
                x: pointer.x - mousePointTo.x * newScale,
                y: pointer.y - mousePointTo.y * newScale,
            };

            stage.position(newPosition);
            setPosition(newPosition);
            stage.batchDraw();
        },
        [setPosition, setScale],
    );

    const handleDragEnd = useCallback(
        (event) => {
            const stage = event.target;
            const newPosition = { x: stage.x(), y: stage.y() };
            setPosition(newPosition);
        },
        [setPosition],
    );

    if (!viewport.width || !viewport.height) {
        return <div ref={wrapperRef} className='relative h-full w-full overflow-hidden bg-[var(--color-canvas)]' />;
    }

    return (
        <div ref={wrapperRef} className='relative h-full w-full overflow-hidden bg-[var(--color-canvas)]'>
            <Stage
                ref={stageRef}
                width={viewport.width}
                height={viewport.height}
                draggable
                x={position.x}
                y={position.y}
                scaleX={scale}
                scaleY={scale}
                onWheel={handleWheel}
                onDragEnd={handleDragEnd}
                listening
            >
                <CanvasLayer />
            </Stage>
            <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.08),_transparent_55%)]' />
        </div>
    );
}
