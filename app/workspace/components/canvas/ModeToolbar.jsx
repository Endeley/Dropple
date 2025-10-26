'use client';

import { MODE_CONFIG, MODE_LIST } from './modeConfig';
import { useCanvasStore } from './context/CanvasStore';

export default function ModeToolbar() {
    const mode = useCanvasStore((state) => state.mode);
    const setMode = useCanvasStore((state) => state.setMode);

    return (
        <div className='pointer-events-auto fixed left-1/2 top-6 z-30 -translate-x-1/2 rounded-2xl border border-[rgba(148,163,184,0.25)] bg-[rgba(15,23,42,0.85)] px-4 py-2 shadow-lg shadow-[rgba(15,23,42,0.3)] backdrop-blur'>
            <nav className='flex items-center gap-2'>
                {MODE_LIST.map((item) => {
                    const active = mode === item;
                    const label = MODE_CONFIG[item]?.label ?? item;
                    return (
                        <button
                            key={item}
                            type='button'
                            onClick={() => setMode(item)}
                            className={`rounded-xl px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                                active
                                    ? 'bg-[var(--color-primary)] text-white shadow-md shadow-[rgba(139,92,246,0.35)]'
                                    : 'text-[rgba(226,232,240,0.7)] hover:text-white hover:bg-[rgba(59,130,246,0.18)]'
                            }`}
                        >
                            {label}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
