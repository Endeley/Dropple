'use client';

import { MODE_CONFIG } from './modeConfig';
import { useCanvasStore } from './context/CanvasStore';

export default function CanvasControls() {
    const mode = useCanvasStore((state) => state.mode);
    const scale = useCanvasStore((state) => state.scale);
    const position = useCanvasStore((state) => state.position);
    const setScale = useCanvasStore((state) => state.setScale);
    const setPosition = useCanvasStore((state) => state.setPosition);

    const modeConfig = MODE_CONFIG[mode] ?? MODE_CONFIG.design;
    const actions = modeConfig.bottomActions ?? [];

    const handleReset = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    return (
        <footer className='flex items-center justify-between gap-6 border-t border-[rgba(148,163,184,0.15)] bg-[rgba(15,23,42,0.82)] px-6 py-3 text-xs text-[rgba(226,232,240,0.78)] backdrop-blur'>
            <div className='flex items-center gap-4'>
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
            <div className='hidden items-center gap-3 md:flex'>
                {actions.map((action) => (
                    <span
                        key={action}
                        className='rounded-full border border-[rgba(148,163,184,0.12)] bg-[rgba(15,23,42,0.6)] px-3 py-1 text-[rgba(226,232,240,0.68)]'
                    >
                        {action}
                    </span>
                ))}
            </div>
        </footer>
    );
}
