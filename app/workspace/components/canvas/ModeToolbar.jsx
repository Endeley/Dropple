'use client';

import { MODE_CONFIG, MODE_LIST, MODE_ASSETS } from './modeConfig';
import { useCanvasStore } from './context/CanvasStore';

export default function ModeToolbar() {
    const mode = useCanvasStore((state) => state.mode);
    const switchMode = useCanvasStore((state) => state.switchMode);
    const isSwitching = useCanvasStore((state) => state.isModeSwitching);

    return (
        <div className='pointer-events-auto fixed left-1/2 top-6 z-30 -translate-x-1/2 rounded-2xl border border-[rgba(148,163,184,0.25)] bg-[rgba(15,23,42,0.85)] px-4 py-2 shadow-lg shadow-[rgba(15,23,42,0.3)] backdrop-blur'>
            <nav className='flex items-center gap-2'>
                {MODE_LIST.map((item) => {
                    const active = mode === item;
                    const label = MODE_CONFIG[item]?.label ?? item;
                    const accent = MODE_ASSETS[item]?.accent ?? 'rgba(139,92,246,0.6)';
                    return (
                        <button
                            key={item}
                            type='button'
                            disabled={isSwitching}
                            onClick={() => switchMode(item)}
                            className={`rounded-xl px-3 py-1.5 text-sm font-medium capitalize transition-all duration-200 ${
                                active
                                    ? 'text-white shadow-[0_6px_20px_rgba(139,92,246,0.35)]'
                                    : 'text-[rgba(226,232,240,0.7)] hover:text-white'
                            }`}
                            style={{
                                backgroundColor: active ? accent : 'transparent',
                                opacity: isSwitching && !active ? 0.5 : 1,
                            }}
                        >
                            {label}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
