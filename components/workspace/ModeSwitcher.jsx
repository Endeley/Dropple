'use client';

import { useRouter } from 'next/navigation';
import { useGlobalStore } from '@/zustand/globalModeStore';

const MODES = [
    { id: 'graphic', label: 'Graphic Design' },
    { id: 'uiux', label: 'UI/UX' },
    { id: 'podcast', label: 'Podcast' },
    { id: 'video', label: 'Video' },
    { id: 'ai', label: 'AI Suite' },
    { id: 'cartoon', label: 'Cartoon/Animation' },
    { id: 'material', label: 'Material UI' },
    { id: 'dev', label: 'Dev Mode' },
    { id: 'branding', label: 'Branding Kit' },
    { id: 'documents', label: 'Documents' },
    { id: 'education', label: 'Education' },
];

export default function ModeSwitcher() {
    const { mode, setMode } = useGlobalStore();
    const router = useRouter();

    const handleSelect = (id) => {
        setMode(id);
        router.push(`/workspace/${id}`);
    };

    return (
        <div className='flex gap-2 px-4 text-sm overflow-x-auto'>
            {MODES.map((m) => (
                <button key={m.id} onClick={() => handleSelect(m.id)} className={`px-2 py-1 rounded whitespace-nowrap transition ${mode === m.id ? 'text-white font-semibold bg-linear-to-r from-violet-500 via-fuchsia-500 to-blue-400' : 'text-neutral-600 hover:text-neutral-900'}`}>
                    {m.label}
                </button>
            ))}
        </div>
    );
}
