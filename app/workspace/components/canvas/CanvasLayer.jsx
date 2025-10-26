'use client';

import { useCanvasStore } from './context/CanvasStore';
import FrameNode from './FrameNode';

export default function CanvasLayer() {
    const frames = useCanvasStore((state) => state.frames);

    return (
        <div className='relative min-h-[4000px] min-w-[4000px]'>
            {frames.map((frame) => (
                <FrameNode key={frame.id} frame={frame} />
            ))}
        </div>
    );
}
