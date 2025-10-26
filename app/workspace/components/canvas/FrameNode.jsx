'use client';

import { Group, Rect, Text } from 'react-konva';
import ElementNode from './ElementNode';

export default function FrameNode({ frame }) {
    if (!frame) return null;

    return (
        <Group x={frame.x} y={frame.y} draggable listening>
            <Rect
                width={frame.width}
                height={frame.height}
                cornerRadius={16}
                stroke='rgba(148, 163, 184, 0.5)'
                strokeWidth={1}
                fill='rgba(15, 23, 42, 0.92)'
                shadowColor='rgba(15, 23, 42, 0.35)'
                shadowBlur={24}
                shadowOpacity={0.8}
                listening
            />
            <Text
                text={frame.name}
                fontSize={14}
                fill='rgba(148, 163, 184, 0.75)'
                y={-24}
                fontFamily='Inter, -apple-system, BlinkMacSystemFont, sans-serif'
            />
            {frame.elements?.map((element) => (
                <ElementNode key={element.id} element={element} />
            ))}
        </Group>
    );
}
