'use client';

import { MODE_CONFIG } from './modeConfig';
import { useCanvasStore } from './context/CanvasStore';

export default function InspectorPanel() {
    const mode = useCanvasStore((state) => state.mode);
    const selectedFrameId = useCanvasStore((state) => state.selectedFrameId);
    const selectedElementId = useCanvasStore((state) => state.selectedElementId);
    const frames = useCanvasStore((state) => state.frames);

    const modeConfig = MODE_CONFIG[mode] ?? MODE_CONFIG.design;
    const inspectorSections = modeConfig.inspectorSections ?? [];

    const activeFrame = frames.find((frame) => frame.id === selectedFrameId);
    const activeElement = activeFrame?.elements?.find((el) => el.id === selectedElementId);

    return (
        <aside className='pointer-events-auto hidden h-full w-80 flex-col border-l border-[rgba(148,163,184,0.15)] bg-[rgba(15,23,42,0.78)] px-5 py-6 text-sm text-[rgba(226,232,240,0.8)] backdrop-blur lg:flex'>
            <header className='mb-6 space-y-1'>
                <p className='text-xs font-semibold uppercase tracking-[0.25em] text-[rgba(148,163,184,0.65)]'>Inspector</p>
                <div className='rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgba(15,23,42,0.6)] px-3 py-2'>
                    <p className='text-sm font-medium text-white'>{activeElement ? 'Element Selected' : 'Frame Selected'}</p>
                    <p className='text-xs text-[rgba(226,232,240,0.55)]'>
                        {activeElement?.id || activeFrame?.name || 'Nothing selected'}
                    </p>
                </div>
            </header>

            <div className='flex-1 space-y-4 overflow-y-auto pr-2'>
                {inspectorSections.map((section) => (
                    <section key={section.id} className='rounded-xl border border-[rgba(148,163,184,0.18)] bg-[rgba(15,23,42,0.55)] p-4'>
                        <h3 className='text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(148,163,184,0.7)]'>
                            {section.title}
                        </h3>
                        <ul className='mt-3 space-y-2'>
                            {section.items.map((item) => (
                                <li
                                    key={item}
                                    className='flex items-center justify-between rounded-lg border border-[rgba(148,163,184,0.12)] bg-[rgba(15,23,42,0.6)] px-3 py-2 text-xs text-[rgba(226,232,240,0.75)]'
                                >
                                    <span>{item}</span>
                                    <span className='text-[rgba(139,92,246,0.65)]'>Edit</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>
        </aside>
    );
}
