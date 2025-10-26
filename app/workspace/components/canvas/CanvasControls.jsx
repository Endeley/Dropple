'use client';

import { useCanvasStore } from './context/CanvasStore';

export default function CanvasControls() {
    const scale = useCanvasStore((state) => state.scale);
    const position = useCanvasStore((state) => state.position);
    const setScale = useCanvasStore((state) => state.setScale);
    const setPosition = useCanvasStore((state) => state.setPosition);

    const handleReset = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    return (
        <div className='pointer-events-auto fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full border border-[rgba(148,163,184,0.2)] bg-[rgba(15,23,42,0.85)] px-4 py-2 text-xs text-[rgba(226,232,240,0.75)] shadow-lg shadow-[rgba(15,23,42,0.28)] backdrop-blur'>
            <span>Zoom: {(scale * 100).toFixed(0)}%</span>
            <span>Pan: {Math.round(position.x)} × {Math.round(position.y)}</span>
            <button
                type='button'
                onClick={handleReset}
                className='rounded-full border border-[rgba(139,92,246,0.35)] px-3 py-1 font-medium text-[rgba(236,233,254,0.9)] transition-colors hover:border-[rgba(236,233,254,0.7)] hover:text-white'
            >
                Reset view
            </button>
        </div>
    );
}
