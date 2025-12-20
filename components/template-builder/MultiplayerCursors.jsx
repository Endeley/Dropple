'use client';

import { useTemplateBuilderStore } from '@/store/useTemplateBuilderStore';

const COLORS = ['#3b82f6', '#22c55e', '#ec4899', '#f59e0b', '#6366f1'];

export default function MultiplayerCursors() {
    const presence = useTemplateBuilderStore((s) => s.presence || []);

    if (!presence.length) return null;

    return (
        <>
            {presence.map((p, idx) => (
                <div
                    key={`${p.userId || idx}`}
                    className='absolute pointer-events-none z-50'
                    style={{
                        left: p.cursor?.x ?? 0,
                        top: p.cursor?.y ?? 0,
                    }}>
                    <div className='flex items-center gap-1'>
                        <div className='w-3 h-3 rounded-full' style={{ background: COLORS[idx % COLORS.length] }} />
                        <span className='text-[10px] text-white px-1 rounded' style={{ background: COLORS[idx % COLORS.length] }}>
                            {(p.userId || 'user').slice(0, 6)}
                        </span>
                    </div>
                </div>
            ))}
        </>
    );
}
