'use client';

import { useCallback, useEffect, useRef } from 'react';
import CanvasLayer from './CanvasLayer';
import { useCanvasStore } from './context/CanvasStore';

const SCALE_STEP = 1.1;

export default function CanvasContainer() {
    const viewportRef = useRef(null);
    const isPointerDown = useRef(false);
    const lastPointer = useRef({ x: 0, y: 0 });

    const scale = useCanvasStore((state) => state.scale);
    const setScale = useCanvasStore((state) => state.setScale);
    const position = useCanvasStore((state) => state.position);
    const setPosition = useCanvasStore((state) => state.setPosition);

    useEffect(() => {
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
    }, [setPosition]);

    const handleWheel = useCallback(
        (event) => {
            event.preventDefault();
            const viewport = viewportRef.current;
            if (!viewport) return;

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
            const newScale = direction > 0 ? oldScale * SCALE_STEP : oldScale / SCALE_STEP;

            setScale(newScale);
            setPosition({
                x: pointer.x - mousePointTo.x * newScale,
                y: pointer.y - mousePointTo.y * newScale,
            });
        },
        [scale, setPosition, setScale],
    );

    const handlePointerDown = (event) => {
        isPointerDown.current = true;
        lastPointer.current = { x: event.clientX, y: event.clientY };
    };

    return (
        <div
            ref={viewportRef}
            className='relative h-full w-full overflow-hidden bg-[var(--color-canvas)]'
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
        >
            <div
                className='absolute left-0 top-0 origin-top-left'
                style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }}
            >
                <CanvasLayer />
            </div>
            <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.08),_transparent_55%)]' />
        </div>
    );
}
