'use client';

import { useTemplateBuilderStore } from '@/runtime/stores/useTemplateBuilderStore';

export default function SmartGuides() {
    const activeGuides = useTemplateBuilderStore((s) => s.activeGuides || []);

    if (!activeGuides.length) return null;

    return (
        <div className='absolute inset-0 pointer-events-none'>
            {activeGuides.map((guide, i) => (
                <div
                    key={i}
                    className='absolute bg-blue-500/70'
                    style={{
                        left: guide.x1 ?? 0,
                        top: guide.y1 ?? 0,
                        width: guide.width ?? 0,
                        height: guide.height ?? 0,
                    }}
                />
            ))}
        </div>
    );
}
