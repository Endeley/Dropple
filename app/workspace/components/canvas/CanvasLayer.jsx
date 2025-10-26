'use client';

import { Layer } from 'react-konva';
import { useCanvasStore } from './context/CanvasStore';
import FrameNode from './FrameNode';

export default function CanvasLayer() {
    const frames = useCanvasStore((state) => state.frames);

    return (
        <Layer listening>
            {frames.map((frame) => (
                <FrameNode key={frame.id} frame={frame} />
            ))}
        </Layer>
    );
}
