'use client';

import { useCanvasStore } from './context/CanvasStore';
import FrameNode from './FrameNode';

export default function CanvasLayer() {
    const rawFrames = useCanvasStore((state) => state.frames);
    const frames = Array.isArray(rawFrames) ? rawFrames : [];
    const rawGuides = useCanvasStore((state) => state.activeGuides);
    const activeGuides = Array.isArray(rawGuides) ? rawGuides : [];

    return (
        <div className='relative min-h-[4000px] min-w-[4000px]'>
            {frames.map((frame) => (
                <FrameNode key={frame.id} frame={frame} />
            ))}
            {activeGuides?.map((guide, index) => {
                if (guide.orientation === 'vertical') {
                    return (
                        <div
                            key={`guide-${guide.orientation}-${index}`}
                            className='pointer-events-none absolute top-0 h-full w-[1px] bg-[rgba(96,165,250,0.65)]'
                            style={{ left: guide.position ?? 0 }}
                        />
                    );
                }
                if (guide.orientation === 'horizontal') {
                    return (
                        <div
                            key={`guide-${guide.orientation}-${index}`}
                            className='pointer-events-none absolute left-0 w-full border-t border-[rgba(96,165,250,0.65)]'
                            style={{ top: guide.position ?? 0 }}
                        />
                    );
                }
                return null;
            })}
        </div>
    );
}
