'use client';

import { useCanvasStore } from './context/CanvasStore';

const TOOLS_BY_MODE = {
    design: ['Select', 'Frame', 'Shape', 'Text', 'Image'],
    podcast: ['Select', 'Segment', 'Marker', 'Transcript'],
    video: ['Select', 'Clip', 'Transition', 'Overlay'],
    docs: ['Select', 'Heading', 'Paragraph', 'Media'],
    dev: ['Select', 'Component', 'Props', 'Export'],
};

export default function ToolSidebar() {
    const mode = useCanvasStore((state) => state.mode);
    const tools = TOOLS_BY_MODE[mode] || TOOLS_BY_MODE.design;

    return (
        <aside className='pointer-events-auto hidden h-full w-64 flex-col border-r border-[rgba(148,163,184,0.15)] bg-[rgba(15,23,42,0.75)] px-5 py-6 text-sm text-[rgba(226,232,240,0.75)] backdrop-blur lg:flex'>
            <p className='text-xs font-semibold uppercase tracking-[0.25em] text-[rgba(148,163,184,0.65)]'>{mode} tools</p>
            <ul className='mt-4 flex flex-col gap-2'>
                {tools.map((tool) => (
                    <li
                        key={tool}
                        className='cursor-pointer rounded-xl border border-transparent px-3 py-2 transition-colors hover:border-[rgba(139,92,246,0.4)] hover:text-white'
                    >
                        {tool}
                    </li>
                ))}
            </ul>
        </aside>
    );
}
