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
    path: 'Stroke',
};

const BASE_PROPS = {
    rotation: 0,
    opacity: 1,
    scaleX: 1,
    scaleY: 1,
    skewX: 0,
    skewY: 0,
    align: 'left',
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
        opacity: 1,
    },
};

const MODE_ELEMENT_OVERRIDES = {
    graphics: {
        rect: {
            width: 360,
            height: 240,
            fill: '#2E1F4E',
        },
    },
    ux: {
        rect: {
            width: 320,
            height: 240,
            fill: '#0F172A',
            cornerRadius: 24,
        },
        text: {
            width: 360,
            height: 120,
            fontSize: 20,
            fill: '#111827',
            lineHeight: 1.4,
        },
    },
    animation: {
        rect: {
            width: 200,
            height: 200,
            fill: '#1E1B4B',
        },
    },
    video: {
        overlay: {
            width: 320,
            height: 140,
            fill: 'rgba(15,23,42,0.85)',
            cornerRadius: 18,
        },
    },
    podcast: {
        script: {
            width: 520,
            height: 320,
            fontSize: 20,
            fill: '#F8FAFC',
            lineHeight: 1.6,
        },
    },
};

export function createElement(elementType, frame, point, options = {}) {
    const { mode = null, preset: customPreset = null } = options;
    const basePreset = DEFAULTS[elementType] ?? DEFAULTS.rect;
    const modePreset = mode && MODE_ELEMENT_OVERRIDES[mode]?.[elementType] ? MODE_ELEMENT_OVERRIDES[mode][elementType] : null;
    const preset = {
        ...basePreset,
        ...(modePreset ?? {}),
        ...(customPreset ?? {}),
    };
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
            ...BASE_PROPS,
            ...preset,
        },
    };
}

export function getElementLabel(element) {
    return element.name ?? ELEMENT_LABELS[element.type] ?? 'Layer';
}
