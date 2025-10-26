'use client';

import { Group, Rect, Text } from 'react-konva';
import ElementNode from './ElementNode';
import { useCanvasStore } from './context/CanvasStore';

export default function FrameNode({ frame }) {
    const selectedFrameId = useCanvasStore((state) => state.selectedFrameId);
    const setSelectedFrame = useCanvasStore((state) => state.setSelectedFrame);

    if (!frame) return null;

    const isSelected = selectedFrameId === frame.id;

    const handleClick = (event) => {
        event.cancelBubble = true;
        setSelectedFrame(frame.id);
    };

    return (
        <Group x={frame.x} y={frame.y} draggable listening onClick={handleClick} onTap={handleClick}>
            <Rect
                width={frame.width}
                height={frame.height}
                cornerRadius={16}
                stroke={isSelected ? 'rgba(139, 92, 246, 0.75)' : 'rgba(148, 163, 184, 0.45)'}
                strokeWidth={isSelected ? 2 : 1}
                fill='rgba(15, 23, 42, 0.92)'
                shadowColor={isSelected ? 'rgba(139, 92, 246, 0.45)' : 'rgba(15, 23, 42, 0.35)'}
                shadowBlur={isSelected ? 32 : 24}
                shadowOpacity={0.85}
                listening
            />
            <Text
                text={frame.name}
                fontSize={14}
                fill={isSelected ? 'rgba(236, 233, 254, 0.85)' : 'rgba(148, 163, 184, 0.75)'}
                y={-24}
                fontFamily='Inter, -apple-system, BlinkMacSystemFont, sans-serif'
            />
            {frame.elements?.map((element) => (
                <ElementNode key={element.id} element={element} frameId={frame.id} />
            ))}
        </Group>
    );
}
