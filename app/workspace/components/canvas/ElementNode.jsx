'use client';

import { Rect, Text, Image as KonvaImage } from 'react-konva';
import { useEffect, useState } from 'react';
import { useCanvasStore } from './context/CanvasStore';

function useImage(src) {
    const [image, setImage] = useState(null);

    useEffect(() => {
        if (!src) return undefined;
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => setImage(img);
        img.src = src;
        return () => {
            setImage(null);
        };
    }, [src]);

    return image;
}

export default function ElementNode({ element, frameId }) {
    const selectedFrameId = useCanvasStore((state) => state.selectedFrameId);
    const selectedElementId = useCanvasStore((state) => state.selectedElementId);
    const setSelectedElement = useCanvasStore((state) => state.setSelectedElement);

    if (!element) return null;

    const isSelected = selectedFrameId === frameId && selectedElementId === element.id;
    const selectElement = (event) => {
        event.cancelBubble = true;
        if (frameId && element.id) {
            setSelectedElement(frameId, element.id);
        }
    };

    switch (element.type) {
        case 'text':
            return (
                <Text
                    {...element.props}
                    draggable
                    listening
                    onClick={selectElement}
                    onTap={selectElement}
                    shadowColor={isSelected ? 'rgba(139, 92, 246, 0.55)' : undefined}
                    shadowBlur={isSelected ? 12 : 0}
                />
            );
        case 'rect':
            return (
                <Rect
                    {...element.props}
                    draggable
                    listening
                    onClick={selectElement}
                    onTap={selectElement}
                    stroke={isSelected ? 'rgba(139, 92, 246, 0.75)' : element.props?.stroke}
                    strokeWidth={isSelected ? 2 : element.props?.strokeWidth}
                />
            );
        case 'image':
            return (
                <KonvaImage
                    {...element.props}
                    image={useImage(element.props?.src)}
                    draggable
                    listening
                    onClick={selectElement}
                    onTap={selectElement}
                    stroke={isSelected ? 'rgba(139, 92, 246, 0.75)' : undefined}
                    strokeWidth={isSelected ? 2 : 0}
                />
            );
        default:
            return null;
    }
}
