'use client';

import clsx from 'clsx';
import ElementNode from './ElementNode';
import { useCanvasStore } from './context/CanvasStore';

export default function FrameNode({ frame }) {
    const selectedFrameId = useCanvasStore((state) => state.selectedFrameId);
    const setSelectedFrame = useCanvasStore((state) => state.setSelectedFrame);

    if (!frame) return null;

    const isSelected = selectedFrameId === frame.id;

    const handleSelect = (event) => {
        event.stopPropagation();
        setSelectedFrame(frame.id);
    };

    return (
        <div
            className={clsx(
                'absolute rounded-3xl border p-8 font-sans transition-shadow',
                'bg-[rgba(15,23,42,0.94)] text-[rgba(226,232,240,0.9)] shadow-xl',
                isSelected
                    ? 'border-[rgba(139,92,246,0.75)] shadow-[0_20px_60px_rgba(139,92,246,0.35)]'
                    : 'border-[rgba(148,163,184,0.25)] shadow-[0_12px_40px_rgba(15,23,42,0.45)]',
            )}
            style={{
                left: frame.x,
                top: frame.y,
                width: frame.width,
                height: frame.height,
            }}
            onMouseDown={handleSelect}
        >
            <div className='absolute left-4 top-4 text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(148,163,184,0.65)]'>
                {frame.name}
            </div>
            <div className='relative h-full w-full pt-6'>
                {frame.elements?.map((element) => (
                    <ElementNode key={element.id} element={element} frameId={frame.id} />
                ))}
            </div>
        </div>
    );
}
