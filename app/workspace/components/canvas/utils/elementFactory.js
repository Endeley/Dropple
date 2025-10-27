'use client';

import { nanoid } from 'nanoid';

const ELEMENT_LABELS = {
    rect: 'Rectangle',
    shape: 'Rectangle',
    overlay: 'Overlay',
    clip: 'Clip',
    text: 'Text',
    script: 'Script',
    image: 'Image',
    component: 'Component',
    character: 'Character',
};

const DEFAULTS = {
    rect: {
        width: 240,
        height: 160,
        fill: '#2A244B',
        cornerRadius: 20,
        stroke: '#8B5CF6',
        strokeWidth: 1,
        opacity: 0.9,
    },
    text: {
        text: 'New text block',
        width: 320,
        height: 120,
        fontSize: 24,
        fill: '#ECE9FE',
        lineHeight: 1.3,
        letterSpacing: 0,
        opacity: 1,
    },
    image: {
        width: 320,
        height: 220,
        fill: 'linear-gradient(135deg, #312E81, #9333EA)',
        cornerRadius: 24,
        imageUrl: null,
        backgroundFit: 'cover',
        opacity: 0.95,
    },
};

export function createElement(elementType, frame, point) {
    const preset = DEFAULTS[elementType] ?? DEFAULTS.rect;
    const width = preset.width ?? 200;
    const height = preset.height ?? 120;
    const localX = point.x - frame.x - width / 2;
    const localY = point.y - frame.y - height / 2;

    return {
        id: `el-${nanoid(6)}`,
        type: elementType,
        parentId: null,
        name: ELEMENT_LABELS[elementType] ?? 'Layer',
        props: {
            x: localX,
            y: localY,
            width,
            height,
            ...preset,
        },
    };
}

export function getElementLabel(element) {
    return element.name ?? ELEMENT_LABELS[element.type] ?? 'Layer';
}
