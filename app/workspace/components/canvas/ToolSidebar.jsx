'use client';

import { MODE_CONFIG } from './modeConfig';
import { useCanvasStore } from './context/CanvasStore';

export default function ToolSidebar() {
    const mode = useCanvasStore((state) => state.mode);
    const selectedTool = useCanvasStore((state) => state.selectedTool);
    const setSelectedTool = useCanvasStore((state) => state.setSelectedTool);

    const modeConfig = MODE_CONFIG[mode] ?? MODE_CONFIG.design;
    const tools = modeConfig.tools ?? [];

    return (
        <aside className='pointer-events-auto hidden h-full w-72 flex-col border-r border-[rgba(148,163,184,0.15)] bg-[rgba(15,23,42,0.78)] px-5 py-6 text-sm text-[rgba(226,232,240,0.78)] backdrop-blur lg:flex'>
            <div className='flex flex-col gap-2'>
                <p className='text-xs font-semibold uppercase tracking-[0.25em] text-[rgba(148,163,184,0.65)]'>Tools</p>
                <p className='text-xs text-[rgba(226,232,240,0.55)]'>{modeConfig.description}</p>
            </div>
            <ul className='mt-6 flex flex-col gap-3'>
                {tools.map((tool) => {
                    const active = selectedTool === tool.id;
                    return (
                        <li key={tool.id}>
                            <button
                                type='button'
                                onClick={() => setSelectedTool(tool.id)}
                                className={`w-full rounded-xl border px-3 py-2 text-left transition-colors ${
                                    active
                                        ? 'border-[rgba(139,92,246,0.55)] bg-[rgba(139,92,246,0.2)] text-white'
                                        : 'border-transparent hover:border-[rgba(139,92,246,0.35)] hover:text-white'
                                }`}
                            >
                                <p className='font-medium'>{tool.name}</p>
                                <p className='text-xs text-[rgba(226,232,240,0.55)]'>{tool.description}</p>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </aside>
    );
}
