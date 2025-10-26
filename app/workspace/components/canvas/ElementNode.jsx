'use client';

import { Rect, Text, Image as KonvaImage } from 'react-konva';
import { useEffect, useState } from 'react';

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

export default function ElementNode({ element }) {
    if (!element) return null;

    switch (element.type) {
        case 'text':
            return <Text {...element.props} draggable listening />;
        case 'rect':
            return <Rect {...element.props} draggable listening />;
        case 'image':
            return <KonvaImage {...element.props} image={useImage(element.props?.src)} draggable listening />;
        default:
            return null;
    }
}
