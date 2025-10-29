'use client';

import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { generateFrameExport } from '../utils/exportCode';
import { snapRectToTargets } from '../utils/alignmentUtils';
import {
    resolveAutoLayoutContainer,
    computeAutoLayoutDrop,
    createContainerTargets,
    computeEmptyContainerPreviewRect,
} from '../utils/autoLayoutUtils';
import { configureHistory, pushHistory, canUndo, canRedo, undo, redo } from '../history/historyService';
import { MODE_ASSETS, MODE_CONFIG } from '../modeConfig';

const DEFAULT_FRAME_BACKGROUND = '#0F172A';
const DEFAULT_TEXT_COLOR = '#ECE9FE';

const SHARED_ELEMENT_DEFAULTS = {
    rotation: 0,
    opacity: 1,
    scaleX: 1,
    scaleY: 1,
    skewX: 0,
    skewY: 0,
    fillType: 'solid',
    gradientType: 'linear',
    gradientAngle: 45,
    gradientStart: '#8B5CF6',
    gradientEnd: '#3B82F6',
    patternRepeat: 'repeat',
    patternScale: 1,
    patternOffsetX: 0,
    patternOffsetY: 0,
    imageUrl: null,
    backgroundFit: 'cover',
    backgroundBlendMode: 'normal',
    visible: true,
    blendMode: 'normal',
    blur: 0,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hueRotate: 0,
    shadowColor: null,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 0,
    shadowSpread: 0,
    glowColor: null,
    glowBlur: 24,
};

const TEXT_ELEMENT_DEFAULTS = {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 18,
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: 0,
    textTransform: 'none',
    align: 'left',
    fill: DEFAULT_TEXT_COLOR,
    textFillType: 'solid',
    textGradientStart: '#8B5CF6',
    textGradientEnd: '#3B82F6',
    textGradientAngle: 45,
    textShadowColor: null,
    textShadowBlur: 0,
    textShadowX: 0,
    textShadowY: 0,
};

const RECT_ELEMENT_DEFAULTS = {
    fill: '#201C3C',
    cornerRadius: 16,
    stroke: null,
    strokeWidth: 0,
};

const IMAGE_ELEMENT_DEFAULTS = {
    preserveAspectRatio: true,
};

const ELEMENT_NAME_MAP = {
    rect: 'Rectangle',
    shape: 'Rectangle',
    overlay: 'Overlay',
    clip: 'Clip',
    text: 'Text',
    script: 'Script',
    image: 'Image',
    component: 'Component',
    character: 'Character',
    group: 'Group',
};

const getDefaultElementName = (type) => ELEMENT_NAME_MAP[type] ?? 'Layer';

const DEFAULT_LAYOUT_PADDING = { top: 64, right: 64, bottom: 64, left: 64 };
const DEFAULT_GRID_COLUMNS = 3;
const DEFAULT_GRID_AUTO_ROWS = 240;
const DEFAULT_GRID_TEMPLATE = 'none';
const DEFAULT_GRID_MIN_COLUMN_WIDTH = 240;
const AUTO_FIT_OPTIONS = ['none', 'auto-fit', 'auto-fill'];
const DEFAULT_FLEX_WRAP = 'nowrap';
const FALLBACK_INTENT_ACCENT = '#6366F1';
const COLLABORATOR_COLORS = [
    '#6366F1',
    '#F97316',
    '#10B981',
    '#F59E0B',
    '#EC4899',
    '#22D3EE',
    '#A855F7',
    '#EF4444',
];
const DEFAULT_MODE_DESCRIPTION = 'Switching creative environment…';

const humanizeModeName = (value) => {
    if (!value) return 'Mode';
    return value
        .split('-')
        .map((segment) => {
            if (!segment) return segment;
            if (segment.length <= 2) {
                return segment.toUpperCase();
            }
            return segment.charAt(0).toUpperCase() + segment.slice(1);
        })
        .join(' ');
};

const normalizeModeIntent = (mode, intent = {}) => {
    const assets = MODE_ASSETS[mode] ?? {};
    const config = MODE_CONFIG[mode] ?? {};
    const source = intent.source ?? 'system';
    const label = intent.label ?? config.label ?? humanizeModeName(mode);
    const description = intent.description ?? config.description ?? DEFAULT_MODE_DESCRIPTION;
    const accent = intent.accent ?? assets.accent ?? FALLBACK_INTENT_ACCENT;
    const thumbnail = intent.thumbnail ?? assets.thumbnail ?? null;
    const message =
        intent.message ??
        (source === 'ai'
            ? 'Dropple is reconfiguring the workspace based on your request…'
            : 'Preparing tools & panels…');
    const badge =
        intent.badge ??
        (source === 'ai' ? 'AI Assist' : source === 'user' ? 'User Intent' : null);
    return {
        id: intent.id ?? `intent-${nanoid(6)}`,
        mode,
        source,
        label,
        description,
        message,
        accent,
        thumbnail,
        badge,
        payload: intent.payload ?? null,
        createdAt: Date.now(),
    };
};

const getNow = () =>
    typeof performance !== 'undefined' && typeof performance.now === 'function'
        ? performance.now()
        : Date.now();
const DEFAULT_GRADIENT_LIBRARY = [];
const DEFAULT_ASSET_LIBRARY = [
    {
        id: 'asset-ai-hero-gradient',
        label: 'AI Hero Gradient',
        category: 'ai',
        source: 'system',
        status: 'ready',
        type: 'element',
        elementType: 'rect',
        preview: {
            kind: 'gradient',
            value: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 50%, #F472B6 100%)',
        },
        props: {
            width: 640,
            height: 360,
            cornerRadius: 32,
            fill: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 50%, #F472B6 100%)',
            opacity: 1,
        },
        metadata: {
            aiPrompt: 'gradient hero background for creative app',
        },
    },
    {
        id: 'asset-ai-capsule-card',
        label: 'Capsule CTA',
        category: 'components',
        source: 'system',
        status: 'ready',
        type: 'element',
        elementType: 'group',
        children: [
            {
                type: 'rect',
                props: {
                    x: 0,
                    y: 0,
                    width: 420,
                    height: 220,
                    cornerRadius: 28,
                    fill: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.92) 100%)',
                    stroke: 'rgba(148,163,184,0.25)',
                    strokeWidth: 1,
                },
            },
            {
                type: 'text',
                props: {
                    x: 32,
                    y: 36,
                    width: 356,
                    text: 'Bring motion, copy, and design together.',
                    fontSize: 24,
                    fontWeight: 600,
                    fill: '#E0E7FF',
                },
            },
            {
                type: 'text',
                props: {
                    x: 32,
                    y: 96,
                    width: 356,
                    text: 'Dropple stitches your creative modes so nothing falls through.',
                    fontSize: 15,
                    lineHeight: 1.5,
                    fill: 'rgba(226,232,240,0.72)',
                },
            },
            {
                type: 'rect',
                props: {
                    x: 32,
                    y: 150,
                    width: 168,
                    height: 48,
                    cornerRadius: 16,
                    fill: '#8B5CF6',
                },
            },
            {
                type: 'text',
                props: {
                    x: 32,
                    y: 162,
                    width: 168,
                    text: 'Start a canvas →',
                    align: 'center',
                    fontSize: 16,
                    fontWeight: 600,
                    fill: '#111827',
                },
            },
        ],
        props: {
            width: 420,
            height: 220,
            opacity: 1,
        },
        metadata: {
            tags: ['component', 'cta'],
        },
    },
    {
        id: 'asset-brand-logo',
        label: 'Dropple Glyph',
        category: 'brand',
        source: 'system',
        status: 'ready',
        type: 'element',
        elementType: 'image',
        props: {
            width: 160,
            height: 160,
            imageUrl:
                'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="%238B5CF6"/><stop offset="1" stop-color="%233B82F6"/></linearGradient></defs><rect width="120" height="120" rx="32" fill="%230F172A"/><path d="M60 24c20 0 36 16 36 36s-16 36-36 36S24 80 24 60 40 24 60 24zm0 14c-12.15 0-22 9.85-22 22s9.85 22 22 22 22-9.85 22-22S72.15 38 60 38zm0 14a8 8 0 1 1 0 16 8 8 0 0 1 0-16z" fill="url(%23g)"/></svg>',
            opacity: 1,
        },
        metadata: {
            tags: ['brand', 'logo'],
        },
    },
    {
        id: 'asset-audio-podcast-intro',
        label: 'Podcast Intro Loop',
        category: 'audio',
        source: 'system',
        status: 'ready',
        type: 'timeline',
        timelineType: 'audio',
        duration: 12,
        offset: 0,
        waveform: [0.2, 0.35, 0.6, 0.42, -0.4, -0.55, -0.32, 0.12, 0.4, 0.58, 0.36, -0.28, -0.48, 0.18, 0.42],
        metadata: {
            bpm: 92,
            key: 'C minor',
        },
    },
    {
        id: 'asset-video-transition',
        label: 'Slide Transition',
        category: 'video',
        source: 'system',
        status: 'ready',
        type: 'timeline',
        timelineType: 'overlay',
        duration: 4,
        offset: 0,
        metadata: {
            easing: 'easeInOut',
        },
    },
];

function normalizePadding(padding) {
    const base = { ...DEFAULT_LAYOUT_PADDING };
    if (!padding) return base;
    return {
        top: Number.isFinite(padding.top) ? padding.top : base.top,
        right: Number.isFinite(padding.right) ? padding.right : base.right,
        bottom: Number.isFinite(padding.bottom) ? padding.bottom : base.bottom,
        left: Number.isFinite(padding.left) ? padding.left : base.left,
    };
}

function clampValue(value, minValue, maxValue) {
    const hasMin = Number.isFinite(minValue);
    const hasMax = Number.isFinite(maxValue);
    let next = Number.isFinite(value) ? value : 0;
    if (hasMin) {
        next = Math.max(minValue, next);
    }
    if (hasMax) {
        next = Math.min(maxValue, next);
    }
    return next;
}

function arraysEqual(a = [], b = []) {
    if (a === b) return true;
    if (a.length !== b.length) return false;
    for (let index = 0; index < a.length; index += 1) {
        if (a[index] !== b[index]) return false;
    }
    return true;
}

function computeCenteredPosition(frame, width, height) {
    const fallbackWidth = Number.isFinite(width) ? width : 320;
    const fallbackHeight = Number.isFinite(height) ? height : 240;
    const x = Math.max(32, (frame.width - fallbackWidth) / 2);
    const y = Math.max(32, (frame.height - fallbackHeight) / 2);
    return { x, y };
}

const AI_GRADIENT_PRESETS = [
    {
        label: 'Orbit',
        value: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 55%, #22D3EE 100%)',
    },
    {
        label: 'Sunmist',
        value: 'linear-gradient(135deg, #FACC15 0%, #F97316 45%, #F43F5E 100%)',
    },
    {
        label: 'Nocturne',
        value: 'linear-gradient(135deg, #0F172A 0%, #1E293B 40%, #312E81 100%)',
    },
    {
        label: 'Pulse',
        value: 'linear-gradient(135deg, #F472B6 0%, #6366F1 50%, #06B6D4 100%)',
    },
];

function hashSeed(input = '') {
    const normalized = String(input ?? '');
    let hash = 0;
    for (let index = 0; index < normalized.length; index += 1) {
        hash = (hash << 5) - hash + normalized.charCodeAt(index);
        hash |= 0;
    }
    return Math.abs(hash);
}

function pickGradientByPrompt(prompt) {
    const seed = hashSeed(prompt);
    return AI_GRADIENT_PRESETS[seed % AI_GRADIENT_PRESETS.length];
}

function pickCollaboratorColor(seedInput = '') {
    const seed = hashSeed(seedInput || `col-${Date.now()}`);
    return COLLABORATOR_COLORS[seed % COLLABORATOR_COLORS.length];
}

function generateWaveform(seedInput, length = 24) {
    const seed = hashSeed(seedInput);
    const values = [];
    let state = seed % 2147483647;
    if (state <= 0) state += 2147483646;
    for (let index = 0; index < length; index += 1) {
        state = (state * 48271) % 2147483647;
        const normalized = (state / 2147483647) * 2 - 1;
        values.push(Math.round(normalized * 100) / 100);
    }
    return values;
}

function buildAiAssetDefinition(kind = 'image', prompt = '') {
    const gradient = pickGradientByPrompt(prompt);
    const labelPrefix = prompt ? prompt.charAt(0).toUpperCase() + prompt.slice(1) : null;
    if (kind === 'audio') {
        return {
            label: labelPrefix ? `AI Audio • ${labelPrefix}` : 'AI Audio Loop',
            type: 'timeline',
            timelineType: 'audio',
            duration: 12,
            waveform: generateWaveform(prompt, 32),
            metadata: {
                aiPrompt: prompt,
                composer: 'Dropple Sonic Model',
            },
        };
    }
    if (kind === 'overlay' || kind === 'video') {
        return {
            label: labelPrefix ? `Overlay • ${labelPrefix}` : 'AI Motion Overlay',
            type: 'timeline',
            timelineType: 'overlay',
            duration: 4,
            metadata: {
                aiPrompt: prompt,
                transition: 'dynamic-swish',
            },
        };
    }
    if (kind === 'component') {
        return {
            label: labelPrefix ? `Component • ${labelPrefix}` : 'AI Component Card',
            type: 'element',
            elementType: 'group',
            props: {
                width: 420,
                height: 240,
                opacity: 1,
            },
            children: [
                {
                    type: 'rect',
                    props: {
                        x: 0,
                        y: 0,
                        width: 420,
                        height: 240,
                        cornerRadius: 28,
                        fill: gradient.value,
                        opacity: 0.9,
                    },
                },
                {
                    type: 'text',
                    props: {
                        x: 32,
                        y: 36,
                        width: 356,
                        text: labelPrefix ? `${labelPrefix}` : 'Generated UI capsule',
                        fontSize: 24,
                        fontWeight: 600,
                        fill: '#F8FAFC',
                    },
                },
                {
                    type: 'text',
                    props: {
                        x: 32,
                        y: 96,
                        width: 356,
                        text:
                            prompt && prompt.length > 6
                                ? `AI interpretation of: “${prompt}”`
                                : 'Responsive component created by Dropple.',
                        fontSize: 15,
                        lineHeight: 1.5,
                        fill: 'rgba(226,232,240,0.75)',
                    },
                },
                {
                    type: 'rect',
                    props: {
                        x: 32,
                        y: 156,
                        width: 178,
                        height: 48,
                        cornerRadius: 16,
                        fill: 'rgba(15,23,42,0.88)',
                    },
                },
                {
                    type: 'text',
                    props: {
                        x: 32,
                        y: 168,
                        width: 178,
                        text: 'Insert component →',
                        fontSize: 16,
                        fontWeight: 600,
                        align: 'center',
                        fill: '#F8FAFC',
                    },
                },
            ],
            preview: {
                kind: 'gradient',
                value: gradient.value,
            },
            metadata: {
                aiPrompt: prompt,
                gradientLabel: gradient.label,
            },
        };
    }

    return {
        label: labelPrefix ? `AI Visual • ${labelPrefix}` : 'AI Visual Layer',
        type: 'element',
        elementType: 'rect',
        props: {
            width: 600,
            height: 360,
            cornerRadius: 28,
            fill: gradient.value,
            opacity: 1,
        },
        preview: {
            kind: 'gradient',
            value: gradient.value,
        },
        metadata: {
            aiPrompt: prompt,
            gradientLabel: gradient.label,
        },
    };
}

function computeFlexColumnLayout(frame) {
    const padding = normalizePadding(frame.layoutPadding);
    const gap = Number.isFinite(frame.layoutGap) ? frame.layoutGap : 0;
    const availableWidth = Math.max(0, frame.width - padding.left - padding.right);
    const availableHeight = Math.max(0, frame.height - padding.top - padding.bottom);
    const layoutAlign = frame.layoutAlign ?? 'start';
    const layoutCrossAlign = frame.layoutCrossAlign ?? 'stretch';
    const layoutWrap = frame.layoutWrap ?? DEFAULT_FLEX_WRAP;

    const topLevel = frame.elements.filter((element) => !element.parentId);
    if (topLevel.length === 0) {
        return { elements: frame.elements, changed: false };
    }

    const metrics = topLevel.map((element) => {
        const props = element.props ?? {};
        const layout = element.layout ?? {};
        const basis = layout.basis;
        const minHeight = Number.isFinite(layout.minHeight) ? layout.minHeight : undefined;
        const maxHeight = Number.isFinite(layout.maxHeight) ? layout.maxHeight : undefined;
        const minWidth = Number.isFinite(layout.minWidth) ? layout.minWidth : undefined;
        const maxWidth = Number.isFinite(layout.maxWidth) ? layout.maxWidth : undefined;
        const desiredHeight = Number.isFinite(basis)
            ? basis
            : Number.isFinite(props.height)
                ? props.height
                : 120;
        const desiredWidth = Number.isFinite(props.width) ? props.width : availableWidth || 320;
        const alignSelf =
            layout.alignSelf !== null && layout.alignSelf !== undefined
                ? layout.alignSelf
                : layoutCrossAlign;
        const grow = Number.isFinite(layout.grow) ? Math.max(0, layout.grow) : 0;
        const shrink = Number.isFinite(layout.shrink) ? Math.max(0, layout.shrink) : 1;
        return {
            element,
            props,
            layout,
            desiredWidth: Math.max(1, desiredWidth),
            targetHeight: Math.max(1, clampValue(desiredHeight, minHeight, maxHeight)),
            alignSelf,
            grow,
            shrink,
            minHeight,
            maxHeight,
            minWidth,
            maxWidth,
        };
    });

    if (layoutWrap !== 'nowrap' && availableHeight > 0) {
        return layoutFlexColumnWithWrap({
            frame,
            metrics,
            padding,
            gap,
            availableWidth,
            availableHeight,
            layoutAlign,
            layoutCrossAlign,
            layoutWrap,
        });
    }

    const gapCount = Math.max(0, metrics.length - 1);
    let gapToUse = gap;
    const totalContentHeight = metrics.reduce((total, item) => total + item.targetHeight, 0);
    const baseTotalHeight = totalContentHeight + gapToUse * gapCount;
    let freeSpace = availableHeight - baseTotalHeight;

    if (freeSpace > 0) {
        const totalGrow = metrics.reduce((sum, item) => sum + item.grow, 0);
        if (totalGrow > 0) {
            metrics.forEach((item) => {
                const delta = (freeSpace * item.grow) / totalGrow;
                const nextHeight = clampValue(item.targetHeight + delta, item.minHeight, item.maxHeight);
                item.targetHeight = Math.max(1, nextHeight);
            });
            freeSpace = 0;
        }
    } else if (freeSpace < 0) {
        const deficit = -freeSpace;
        const totalShrink = metrics.reduce((sum, item) => sum + item.shrink, 0);
        if (totalShrink > 0) {
            metrics.forEach((item) => {
                const delta = (deficit * item.shrink) / totalShrink;
                const nextHeight = clampValue(item.targetHeight - delta, item.minHeight, item.maxHeight);
                item.targetHeight = Math.max(1, nextHeight);
            });
            freeSpace = 0;
        }
    }

    const adjustedContentHeight = metrics.reduce((total, item) => total + item.targetHeight, 0);
    const totalGapSpace = gapToUse * gapCount;
    let occupiedHeight = adjustedContentHeight + totalGapSpace;
    let startY = padding.top;
    let remaining = availableHeight - occupiedHeight;

    if (layoutAlign === 'space-between' && gapCount > 0) {
        const spreadable = availableHeight - adjustedContentHeight;
        if (spreadable > 0) {
            gapToUse = spreadable / gapCount;
        }
        occupiedHeight = adjustedContentHeight + gapToUse * gapCount;
        remaining = availableHeight - occupiedHeight;
        startY = padding.top;
    } else if (layoutAlign === 'center') {
        startY = padding.top + Math.max(0, remaining / 2);
    } else if (layoutAlign === 'end') {
        startY = padding.top + Math.max(0, remaining);
    } else {
        startY = padding.top;
    }

    const updates = new Map();
    let cursorY = startY;

    metrics.forEach((item) => {
        let width = item.desiredWidth;
        let x = padding.left;
        const alignSelf = item.alignSelf ?? 'stretch';
        const minWidth = item.minWidth;
        const maxWidth = item.maxWidth;

        if (alignSelf === 'start') {
            width = clampValue(Math.min(width, availableWidth) || width, minWidth, maxWidth);
            x = padding.left;
        } else if (alignSelf === 'center') {
            width = clampValue(Math.min(width, availableWidth) || width, minWidth, maxWidth);
            x = padding.left + Math.max(0, (availableWidth - width) / 2);
        } else if (alignSelf === 'end') {
            width = clampValue(Math.min(width, availableWidth) || width, minWidth, maxWidth);
            x = padding.left + Math.max(0, availableWidth - width);
        } else {
            const stretchedWidth = availableWidth > 0 ? availableWidth : width;
            width = clampValue(stretchedWidth, minWidth, maxWidth);
            x = padding.left;
        }

        const y = cursorY;
        cursorY += item.targetHeight + gapToUse;

        const { props } = item;
        if (
            props.x !== x ||
            props.y !== y ||
            props.width !== width ||
            props.height !== item.targetHeight
        ) {
            updates.set(item.element.id, {
                x,
                y,
                width,
                height: item.targetHeight,
            });
        }
    });

    if (updates.size === 0) {
        return { elements: frame.elements, changed: false };
    }

    const elements = frame.elements.map((element) => {
        if (!updates.has(element.id)) return element;
        const overrides = updates.get(element.id);
        return {
            ...element,
            props: {
                ...element.props,
                ...overrides,
            },
        };
    });

    return { elements, changed: true };
}

function computeFlexRowLayout(frame) {
    const padding = normalizePadding(frame.layoutPadding);
    const gap = Number.isFinite(frame.layoutGap) ? frame.layoutGap : 0;
    const availableWidth = Math.max(0, frame.width - padding.left - padding.right);
    const availableHeight = Math.max(0, frame.height - padding.top - padding.bottom);
    const layoutAlign = frame.layoutAlign ?? 'start';
    const layoutCrossAlign = frame.layoutCrossAlign ?? 'stretch';
    const layoutWrap = frame.layoutWrap ?? DEFAULT_FLEX_WRAP;

    const topLevel = frame.elements.filter((element) => !element.parentId);
    if (topLevel.length === 0) {
        return { elements: frame.elements, changed: false };
    }

    const metrics = topLevel.map((element) => {
        const props = element.props ?? {};
        const layout = element.layout ?? {};
        const basis = layout.basis;
        const minWidth = Number.isFinite(layout.minWidth) ? layout.minWidth : undefined;
        const maxWidth = Number.isFinite(layout.maxWidth) ? layout.maxWidth : undefined;
        const minHeight = Number.isFinite(layout.minHeight) ? layout.minHeight : undefined;
        const maxHeight = Number.isFinite(layout.maxHeight) ? layout.maxHeight : undefined;
        const fallbackWidth = availableWidth > 0 ? Math.min(availableWidth, 320) : 320;
        const desiredWidth = Number.isFinite(basis)
            ? basis
            : Number.isFinite(props.width)
                ? props.width
                : fallbackWidth;
        const desiredHeight = Number.isFinite(props.height)
            ? props.height
            : availableHeight > 0
                ? Math.min(availableHeight, 240)
                : 240;
        const alignSelf =
            layout.alignSelf !== null && layout.alignSelf !== undefined
                ? layout.alignSelf
                : layoutCrossAlign;
        const grow = Number.isFinite(layout.grow) ? Math.max(0, layout.grow) : 0;
        const shrink = Number.isFinite(layout.shrink) ? Math.max(0, layout.shrink) : 1;
        return {
            element,
            props,
            layout,
            targetWidth: Math.max(1, clampValue(desiredWidth, minWidth, maxWidth)),
            desiredHeight: Math.max(1, clampValue(desiredHeight, minHeight, maxHeight)),
            alignSelf,
            grow,
            shrink,
            minWidth,
            maxWidth,
            minHeight,
            maxHeight,
        };
    });

    if (layoutWrap !== 'nowrap' && availableWidth > 0) {
        return layoutFlexRowWithWrap({
            frame,
            metrics,
            padding,
            gap,
            availableWidth,
            availableHeight,
            layoutAlign,
            layoutCrossAlign,
            layoutWrap,
        });
    }

    const gapCount = Math.max(0, metrics.length - 1);
    let gapToUse = gap;
    const totalContentWidth = metrics.reduce((total, item) => total + item.targetWidth, 0);
    const baseTotalWidth = totalContentWidth + gapToUse * gapCount;
    let freeSpace = availableWidth - baseTotalWidth;

    if (freeSpace > 0) {
        const totalGrow = metrics.reduce((sum, item) => sum + item.grow, 0);
        if (totalGrow > 0) {
            metrics.forEach((item) => {
                const delta = (freeSpace * item.grow) / totalGrow;
                const nextWidth = clampValue(item.targetWidth + delta, item.minWidth, item.maxWidth);
                item.targetWidth = Math.max(1, nextWidth);
            });
            freeSpace = 0;
        }
    } else if (freeSpace < 0) {
        const deficit = -freeSpace;
        const totalShrink = metrics.reduce((sum, item) => sum + item.shrink, 0);
        if (totalShrink > 0) {
            metrics.forEach((item) => {
                const delta = (deficit * item.shrink) / totalShrink;
                const nextWidth = clampValue(item.targetWidth - delta, item.minWidth, item.maxWidth);
                item.targetWidth = Math.max(1, nextWidth);
            });
            freeSpace = 0;
        }
    }

    const adjustedContentWidth = metrics.reduce((total, item) => total + item.targetWidth, 0);
    const gapSpace = gapToUse * gapCount;
    let occupiedWidth = adjustedContentWidth + gapSpace;
    let startX = padding.left;
    let remaining = availableWidth - occupiedWidth;

    if (layoutAlign === 'space-between' && gapCount > 0) {
        const spreadable = availableWidth - adjustedContentWidth;
        if (spreadable > 0) {
            gapToUse = spreadable / gapCount;
        }
        occupiedWidth = adjustedContentWidth + gapToUse * gapCount;
        remaining = availableWidth - occupiedWidth;
        startX = padding.left;
    } else if (layoutAlign === 'center') {
        startX = padding.left + Math.max(0, remaining / 2);
    } else if (layoutAlign === 'end') {
        startX = padding.left + Math.max(0, remaining);
    } else {
        startX = padding.left;
    }

    const updates = new Map();
    let cursorX = startX;

    metrics.forEach((item) => {
        let width = item.targetWidth;
        let height = item.desiredHeight;
        const alignSelf = item.alignSelf ?? 'stretch';
        let y = padding.top;
        const minHeight = item.minHeight;
        const maxHeight = item.maxHeight;

        if (alignSelf === 'start') {
            height = clampValue(Math.min(height, availableHeight || height), minHeight, maxHeight);
            y = padding.top;
        } else if (alignSelf === 'center') {
            height = clampValue(Math.min(height, availableHeight || height), minHeight, maxHeight);
            y = padding.top + Math.max(0, (availableHeight - height) / 2);
        } else if (alignSelf === 'end') {
            height = clampValue(Math.min(height, availableHeight || height), minHeight, maxHeight);
            y = padding.top + Math.max(0, availableHeight - height);
        } else {
            const stretchedHeight = availableHeight > 0 ? availableHeight : height;
            height = clampValue(stretchedHeight, minHeight, maxHeight);
            y = padding.top;
        }

        const x = cursorX;
        cursorX += width + gapToUse;

        const { props } = item;
        if (
            props.x !== x ||
            props.y !== y ||
            props.width !== width ||
            props.height !== height
        ) {
            updates.set(item.element.id, {
                x,
                y,
                width,
                height,
            });
        }
    });

    if (updates.size === 0) {
        return { elements: frame.elements, changed: false };
    }

    const elements = frame.elements.map((element) => {
        if (!updates.has(element.id)) return element;
        const overrides = updates.get(element.id);
        return {
            ...element,
            props: {
                ...element.props,
                ...overrides,
            },
        };
    });

    return { elements, changed: true };
}

function layoutFlexRowWithWrap({
    metrics,
    padding,
    gap,
    availableWidth,
    availableHeight,
    layoutAlign,
    layoutCrossAlign,
    layoutWrap,
    frame,
}) {
    const maxLineWidth = availableWidth > 0 ? availableWidth : Number.POSITIVE_INFINITY;
    const lines = [];
    let currentLine = {
        items: [],
        widthNoGap: 0,
        count: 0,
        maxHeight: 0,
    };

    metrics.forEach((item) => {
        const itemWidth = Math.max(1, item.targetWidth);
        const prospectiveCount = currentLine.count + 1;
        const prospectiveWidthNoGap = currentLine.widthNoGap + itemWidth;
        const prospectiveWidthWithGap =
            prospectiveWidthNoGap + gap * Math.max(0, prospectiveCount - 1);
        if (
            layoutWrap !== 'nowrap' &&
            currentLine.count > 0 &&
            prospectiveWidthWithGap > maxLineWidth + 0.01
        ) {
            lines.push({ ...currentLine });
            currentLine = {
                items: [],
                widthNoGap: 0,
                count: 0,
                maxHeight: 0,
            };
        }
        currentLine.items.push(item);
        currentLine.count += 1;
        currentLine.widthNoGap += itemWidth;
        currentLine.maxHeight = Math.max(currentLine.maxHeight, item.desiredHeight);
    });
    if (currentLine.count > 0) {
        lines.push({ ...currentLine });
    }

    if (lines.length === 0) {
        return { elements: frame.elements, changed: false };
    }

    const totalHeight =
        lines.reduce((sum, line) => sum + line.maxHeight, 0) + gap * Math.max(0, lines.length - 1);

    const linesToRender =
        layoutWrap === 'wrap-reverse' ? [...lines].reverse() : lines;

    let currentY = padding.top;
    if (layoutWrap === 'wrap-reverse' && availableHeight > 0) {
        currentY = padding.top + Math.max(0, availableHeight - totalHeight);
    }

    const updates = new Map();

    linesToRender.forEach((line, index) => {
        const count = line.count;
        const lineWidthNoGap = line.widthNoGap;
        let gapSpacing = gap;
        let startX = padding.left;

        if (availableWidth > 0) {
            if (layoutAlign === 'space-between' && count > 1) {
                gapSpacing = Math.max(0, (availableWidth - lineWidthNoGap) / (count - 1));
            } else {
                const baseGapTotal = gapSpacing * Math.max(0, count - 1);
                const freeSpace = Math.max(0, availableWidth - lineWidthNoGap - baseGapTotal);
                if (layoutAlign === 'center') {
                    startX += freeSpace / 2;
                } else if (layoutAlign === 'end') {
                    startX += freeSpace;
                }
            }
        }

        let cursorX = startX;
        line.items.forEach((item, itemIndex) => {
            let width = Math.max(1, clampValue(item.targetWidth, item.minWidth, item.maxWidth));
            let height = Math.max(1, clampValue(item.desiredHeight, item.minHeight, item.maxHeight));
            const alignSelf = item.alignSelf ?? layoutCrossAlign;
            let offsetY = 0;

            if (alignSelf === 'stretch') {
                height = Math.max(1, clampValue(line.maxHeight, item.minHeight, item.maxHeight));
            } else if (alignSelf === 'center') {
                offsetY = Math.max(0, (line.maxHeight - height) / 2);
            } else if (alignSelf === 'end') {
                offsetY = Math.max(0, line.maxHeight - height);
            }

            const x = cursorX;
            const y = currentY + offsetY;

            const { props } = item;
            if (
                props.x !== x ||
                props.y !== y ||
                props.width !== width ||
                props.height !== height
            ) {
                updates.set(item.element.id, {
                    x,
                    y,
                    width,
                    height,
                });
            }

            cursorX += width;
            if (itemIndex < count - 1) {
                cursorX += gapSpacing;
            }
        });

        currentY += line.maxHeight;
        if (index < linesToRender.length - 1) {
            currentY += gap;
        }
    });

    if (updates.size === 0) {
        return { elements: frame.elements, changed: false };
    }

    const elements = frame.elements.map((element) => {
        const overrides = updates.get(element.id);
        if (!overrides) return element;
        return {
            ...element,
            props: {
                ...element.props,
                ...overrides,
            },
        };
    });

    return { elements, changed: true };
}

function layoutFlexColumnWithWrap({
    metrics,
    padding,
    gap,
    availableWidth,
    availableHeight,
    layoutAlign,
    layoutCrossAlign,
    layoutWrap,
    frame,
}) {
    const maxColumnHeight = availableHeight > 0 ? availableHeight : Number.POSITIVE_INFINITY;
    const columns = [];
    let currentColumn = {
        items: [],
        heightNoGap: 0,
        count: 0,
        maxWidth: 0,
    };

    metrics.forEach((item) => {
        const itemHeight = Math.max(1, item.targetHeight ?? item.targetWidth ?? 0);
        const prospectiveCount = currentColumn.count + 1;
        const prospectiveHeightNoGap = currentColumn.heightNoGap + itemHeight;
        const prospectiveHeightWithGap =
            prospectiveHeightNoGap + gap * Math.max(0, prospectiveCount - 1);
        if (
            layoutWrap !== 'nowrap' &&
            currentColumn.count > 0 &&
            prospectiveHeightWithGap > maxColumnHeight + 0.01
        ) {
            columns.push({ ...currentColumn });
            currentColumn = {
                items: [],
                heightNoGap: 0,
                count: 0,
                maxWidth: 0,
            };
        }
        currentColumn.items.push(item);
        currentColumn.count += 1;
        currentColumn.heightNoGap += itemHeight;
        const desiredWidth = Math.max(1, clampValue(item.desiredWidth, item.minWidth, item.maxWidth));
        currentColumn.maxWidth = Math.max(currentColumn.maxWidth, desiredWidth);
    });
    if (currentColumn.count > 0) {
        columns.push({ ...currentColumn });
    }

    if (columns.length === 0) {
        return { elements: frame.elements, changed: false };
    }

    const totalWidth =
        columns.reduce((sum, column) => sum + column.maxWidth, 0) +
        gap * Math.max(0, columns.length - 1);

    const columnsToRender =
        layoutWrap === 'wrap-reverse' ? [...columns].reverse() : columns;

    let currentX = padding.left;
    if (layoutWrap === 'wrap-reverse' && availableWidth > 0) {
        currentX = padding.left + Math.max(0, availableWidth - totalWidth);
    }

    const updates = new Map();

    columnsToRender.forEach((column, columnIndex) => {
        const columnWidth = column.maxWidth;

        let columnGapSpacing = gap;
        const count = column.count;
        const columnHeightNoGap = column.heightNoGap;
        let columnStartY = padding.top;

        if (availableHeight > 0) {
            if (layoutAlign === 'space-between' && count > 1) {
                columnGapSpacing = Math.max(
                    0,
                    (availableHeight - columnHeightNoGap) / (count - 1),
                );
            } else {
                const baseGapTotal = columnGapSpacing * Math.max(0, count - 1);
                const freeSpace = Math.max(0, availableHeight - columnHeightNoGap - baseGapTotal);
                if (layoutAlign === 'center') {
                    columnStartY += freeSpace / 2;
                } else if (layoutAlign === 'end') {
                    columnStartY += freeSpace;
                }
            }
        }

        let cursorY = columnStartY;
        column.items.forEach((item, itemIndex) => {
            let height = Math.max(1, clampValue(item.targetHeight, item.minHeight, item.maxHeight));
            let width = Math.max(1, clampValue(item.desiredWidth, item.minWidth, item.maxWidth));
            const alignSelf = item.alignSelf ?? layoutCrossAlign;
            let offsetX = 0;

            if (alignSelf === 'stretch') {
                width = Math.max(1, clampValue(columnWidth, item.minWidth, item.maxWidth));
            } else if (alignSelf === 'center') {
                offsetX = Math.max(0, (columnWidth - width) / 2);
            } else if (alignSelf === 'end') {
                offsetX = Math.max(0, columnWidth - width);
            }

            const x = currentX + offsetX;
            const y = cursorY;

            const { props } = item;
            if (
                props.x !== x ||
                props.y !== y ||
                props.width !== width ||
                props.height !== height
            ) {
                updates.set(item.element.id, {
                    x,
                    y,
                    width,
                    height,
                });
            }

            cursorY += height;
            if (itemIndex < count - 1) {
                cursorY += columnGapSpacing;
            }
        });

        currentX += columnWidth;
        if (columnIndex < columnsToRender.length - 1) {
            currentX += gap;
        }
    });

    if (updates.size === 0) {
        return { elements: frame.elements, changed: false };
    }

    const elements = frame.elements.map((element) => {
        const overrides = updates.get(element.id);
        if (!overrides) return element;
        return {
            ...element,
            props: {
                ...element.props,
                ...overrides,
            },
        };
    });

    return { elements, changed: true };
}

function computeGridLayout(frame) {
    const padding = normalizePadding(frame.layoutPadding);
    const columnGap = Number.isFinite(frame.layoutGap) ? frame.layoutGap : 0;
    const rowGap = Number.isFinite(frame.layoutRowGap) ? frame.layoutRowGap : columnGap;
    const hasAutoFit = frame.layoutGridAutoFit && frame.layoutGridAutoFit !== 'none';
    const minColumnWidth = Number.isFinite(frame.layoutGridMinColumnWidth)
        ? frame.layoutGridMinColumnWidth
        : DEFAULT_GRID_MIN_COLUMN_WIDTH;
    const autoRowHeight = Number.isFinite(frame.layoutGridAutoRows) ? frame.layoutGridAutoRows : DEFAULT_GRID_AUTO_ROWS;
    const availableWidth = Math.max(0, frame.width - padding.left - padding.right);
    const availableHeight = Math.max(0, frame.height - padding.top - padding.bottom);

    const explicitColumns = Math.max(
        1,
        Number.isFinite(frame.layoutGridColumns) ? Math.floor(frame.layoutGridColumns) : DEFAULT_GRID_COLUMNS,
    );

    let columns = explicitColumns;
    if (hasAutoFit) {
        const unit = minColumnWidth + columnGap;
        if (unit > 0) {
            const possible = Math.floor((availableWidth + columnGap) / unit);
            if (Number.isFinite(possible) && possible > 0) {
                columns = possible;
            } else {
                columns = 1;
            }
        }
    }
    if (columns < 1) {
        columns = 1;
    }

    const baseColumnWidth =
        columns > 0 ? Math.max(0, (availableWidth - columnGap * (columns - 1)) / columns) : availableWidth;
    const columnWidth = hasAutoFit
        ? Math.max(baseColumnWidth, Math.min(minColumnWidth, availableWidth || minColumnWidth))
        : baseColumnWidth;

    const topLevel = frame.elements.filter((element) => !element.parentId);
    if (topLevel.length === 0) {
        return { elements: frame.elements, changed: false };
    }

    const sorted = topLevel
        .map((element, index) => ({ element, index }))
        .sort((a, b) => {
            const orderA = Number.isFinite(a.element.layout?.order) ? a.element.layout.order : a.index;
            const orderB = Number.isFinite(b.element.layout?.order) ? b.element.layout.order : b.index;
            if (orderA === orderB) return a.index - b.index;
            return orderA - orderB;
        });

    const occupied = new Map();
    const placements = [];

    const ensureRow = (rowIndex) => {
        if (!occupied.has(rowIndex)) {
            occupied.set(rowIndex, Array.from({ length: columns }, () => false));
        }
    };

    const isFree = (rowIndex, colIndex, colSpan, rowSpan) => {
        const maxColumn = columns - 1;
        for (let r = 0; r < rowSpan; r += 1) {
            const targetRow = rowIndex + r;
            ensureRow(targetRow);
            const row = occupied.get(targetRow);
            for (let c = 0; c < colSpan; c += 1) {
                const targetCol = colIndex + c - 1;
                if (targetCol > maxColumn || targetCol < 0 || row[targetCol]) {
                    return false;
                }
            }
        }
        return true;
    };

    const reserve = (rowIndex, colIndex, colSpan, rowSpan) => {
        for (let r = 0; r < rowSpan; r += 1) {
            const targetRow = rowIndex + r;
            ensureRow(targetRow);
            const row = occupied.get(targetRow);
            for (let c = 0; c < colSpan; c += 1) {
                const targetCol = colIndex + c - 1;
                if (targetCol >= 0 && targetCol < row.length) {
                    row[targetCol] = true;
                }
            }
        }
    };

    const findSlot = (colSpan, rowSpan, preferredRow = 1, preferredCol = 1) => {
        let rowIndex = Math.max(1, preferredRow);
        let attempts = 0;
        const maxColStart = Math.max(1, columns - colSpan + 1);
        let colStart = Math.max(1, Math.min(preferredCol, maxColStart));

        while (attempts < 1000) {
            const limit = Math.max(1, columns - colSpan + 1);
            let colIndex = colStart;
            while (colIndex <= limit) {
                if (isFree(rowIndex, colIndex, colSpan, rowSpan)) {
                    return { row: rowIndex, col: colIndex };
                }
                colIndex += 1;
            }
            rowIndex += 1;
            colStart = 1;
            attempts += 1;
        }

        return { row: rowIndex, col: 1 };
    };

    sorted.forEach(({ element }) => {
        const props = element.props ?? {};
        const layout = element.layout ?? {};
        const span = Math.max(1, Number.isFinite(layout.gridColumnSpan) ? Math.floor(layout.gridColumnSpan) : 1);
        const colSpan = Math.min(span, columns);
        const rowSpan = Math.max(1, Number.isFinite(layout.gridRowSpan) ? Math.floor(layout.gridRowSpan) : 1);
        const preferredCol =
            layout.gridColumnStart !== null && layout.gridColumnStart !== undefined
                ? Math.max(1, Math.floor(layout.gridColumnStart))
                : null;
        const preferredRow =
            layout.gridRowStart !== null && layout.gridRowStart !== undefined
                ? Math.max(1, Math.floor(layout.gridRowStart))
                : null;

        const slot = findSlot(colSpan, rowSpan, preferredRow ?? 1, preferredCol ?? 1);
        reserve(slot.row, slot.col, colSpan, rowSpan);

        const width = colSpan * columnWidth + columnGap * (colSpan - 1);
        const definedHeight = Number.isFinite(props.height) ? props.height : null;
        const contentHeight = definedHeight ?? autoRowHeight * rowSpan;

        placements.push({
            element,
            colSpan,
            rowSpan,
            rowStart: slot.row,
            colStart: slot.col,
            width,
            contentHeight,
            explicitHeight: definedHeight,
        });
    });

    if (placements.length === 0) {
        return { elements: frame.elements, changed: false };
    }

    const rowHeights = new Map();
    placements.forEach((item) => {
        const perRowHeight = item.contentHeight > 0 ? item.contentHeight / item.rowSpan : autoRowHeight;
        for (let offset = 0; offset < item.rowSpan; offset += 1) {
            const rowIndex = item.rowStart + offset;
            const current = rowHeights.get(rowIndex) ?? 0;
            rowHeights.set(rowIndex, Math.max(current, perRowHeight, autoRowHeight));
        }
    });

    const sortedRows = Array.from(rowHeights.keys()).sort((a, b) => a - b);
    const rowOffsets = new Map();
    let currentY = padding.top;
    let lastRowIndex = 0;

    sortedRows.forEach((rowIndex) => {
        if (rowIndex > lastRowIndex + 1) {
            const gapRows = rowIndex - lastRowIndex - 1;
            currentY += gapRows * (autoRowHeight + rowGap);
        }
        rowOffsets.set(rowIndex, currentY);
        const rowHeight = rowHeights.get(rowIndex) ?? autoRowHeight;
        currentY += rowHeight + rowGap;
        lastRowIndex = rowIndex;
    });

    const updates = new Map();
    placements.forEach((item) => {
        const props = item.element.props ?? {};
        const x = padding.left + (item.colStart - 1) * (columnWidth + columnGap);
        const y =
            rowOffsets.get(item.rowStart) ??
            padding.top + (item.rowStart - 1) * (autoRowHeight + rowGap);

        let computedHeight = 0;
        for (let offset = 0; offset < item.rowSpan; offset += 1) {
            const rowIndex = item.rowStart + offset;
            const rowHeight = rowHeights.get(rowIndex) ?? autoRowHeight;
            computedHeight += rowHeight;
            if (offset < item.rowSpan - 1) {
                computedHeight += rowGap;
            }
        }

        const finalHeight = Number.isFinite(props.height) ? props.height : computedHeight;
        updates.set(item.element.id, {
            x,
            y,
            width: item.width,
            height: finalHeight,
        });
    });

    const totalContentHeight =
        placements.length === 0
            ? padding.top + padding.bottom
            : currentY - rowGap - padding.top + padding.bottom;
    const heightChanged = availableHeight > 0 && totalContentHeight > availableHeight;

    if (updates.size === 0) {
        return { elements: frame.elements, changed: heightChanged };
    }

    const elements = frame.elements.map((element) => {
        const overrides = updates.get(element.id);
        if (!overrides) return element;
        return {
            ...element,
            props: {
                ...element.props,
                ...overrides,
            },
        };
    });

    return { elements, changed: true };
}

function withElementDefaults(element) {
    if (!element) return element;
    if (element.type === 'group') {
        return {
            ...element,
            name: element.name ?? getDefaultElementName('group'),
            props: {
                opacity: element.props?.opacity ?? 1,
                rotation: element.props?.rotation ?? 0,
                scaleX: element.props?.scaleX ?? 1,
                scaleY: element.props?.scaleY ?? 1,
                skewX: element.props?.skewX ?? 0,
                skewY: element.props?.skewY ?? 0,
                visible: element.props?.visible ?? true,
                ...(element.props ?? {}),
            },
            layoutMode: element.layoutMode ?? 'absolute',
            layoutGap: element.layoutGap ?? 24,
            layoutAlign: element.layoutAlign ?? 'start',
            layoutCrossAlign: element.layoutCrossAlign ?? 'stretch',
            layoutWrap: element.layoutWrap ?? DEFAULT_FLEX_WRAP,
            layoutPadding: element.layoutPadding
                ? normalizePadding(element.layoutPadding)
                : { ...DEFAULT_LAYOUT_PADDING },
            layoutRowGap: element.layoutRowGap ?? element.layoutGap ?? 24,
            layoutGridColumns: element.layoutGridColumns ?? DEFAULT_GRID_COLUMNS,
            layoutGridAutoRows: element.layoutGridAutoRows ?? DEFAULT_GRID_AUTO_ROWS,
            layoutGridAutoFit: AUTO_FIT_OPTIONS.includes(element.layoutGridAutoFit)
                ? element.layoutGridAutoFit
                : 'none',
            layoutGridMinColumnWidth: Number.isFinite(element.layoutGridMinColumnWidth)
                ? element.layoutGridMinColumnWidth
                : DEFAULT_GRID_MIN_COLUMN_WIDTH,
            layout: {
                order: element.layout?.order ?? null,
                basis: element.layout?.basis ?? null,
                grow: element.layout?.grow ?? 0,
                shrink: element.layout?.shrink ?? 1,
                minWidth: element.layout?.minWidth ?? null,
                maxWidth: element.layout?.maxWidth ?? null,
                minHeight: element.layout?.minHeight ?? null,
                maxHeight: element.layout?.maxHeight ?? null,
                alignSelf: element.layout?.alignSelf ?? null,
                gridColumnSpan: element.layout?.gridColumnSpan ?? 1,
                gridRowSpan: element.layout?.gridRowSpan ?? 1,
                gridColumnStart: element.layout?.gridColumnStart ?? null,
                gridRowStart: element.layout?.gridRowStart ?? null,
            },
        };
    }

    const typeDefaults =
        element.type === 'text'
            ? TEXT_ELEMENT_DEFAULTS
            : element.type === 'rect'
                ? RECT_ELEMENT_DEFAULTS
                : element.type === 'image'
                    ? IMAGE_ELEMENT_DEFAULTS
                    : {};

    return {
        ...element,
        name: element.name ?? getDefaultElementName(element.type),
        props: {
            ...SHARED_ELEMENT_DEFAULTS,
            ...typeDefaults,
            ...(element.props ?? {}),
        },
            layout: {
                order: element.layout?.order ?? null,
                basis: element.layout?.basis ?? null,
                grow: element.layout?.grow ?? 0,
                shrink: element.layout?.shrink ?? 1,
                minWidth: element.layout?.minWidth ?? null,
                maxWidth: element.layout?.maxWidth ?? null,
                minHeight: element.layout?.minHeight ?? null,
                maxHeight: element.layout?.maxHeight ?? null,
                alignSelf: element.layout?.alignSelf ?? null,
                gridColumnSpan: element.layout?.gridColumnSpan ?? 1,
                gridRowSpan: element.layout?.gridRowSpan ?? 1,
                gridColumnStart: element.layout?.gridColumnStart ?? null,
                gridRowStart: element.layout?.gridRowStart ?? null,
            },
    };
}

const initialFrame = {
    id: 'frame-1',
    name: 'Home Page',
    x: 160,
    y: 120,
    width: 1440,
    height: 1024,
    opacity: 1,
    backgroundColor: DEFAULT_FRAME_BACKGROUND,
    backgroundImage: null,
    backgroundFit: 'cover',
    backgroundFillType: 'solid',
    backgroundGradientType: 'linear',
    backgroundGradientStart: '#8B5CF6',
    backgroundGradientEnd: '#3B82F6',
    backgroundGradientAngle: 45,
    backgroundPatternScale: 1,
    backgroundPatternOffsetX: 0,
    backgroundPatternOffsetY: 0,
    backgroundPatternRepeat: 'repeat',
    backgroundBlendMode: 'normal',
    layoutMode: 'absolute',
    layoutGap: 32,
    layoutAlign: 'start',
    layoutCrossAlign: 'start',
    layoutWrap: DEFAULT_FLEX_WRAP,
    layoutPadding: { ...DEFAULT_LAYOUT_PADDING },
    layoutRowGap: 32,
    layoutGridColumns: DEFAULT_GRID_COLUMNS,
    layoutGridAutoRows: DEFAULT_GRID_AUTO_ROWS,
    layoutGridAutoFit: 'none',
    layoutGridMinColumnWidth: DEFAULT_GRID_MIN_COLUMN_WIDTH,
    timelineDuration: 20,
    elements: [
        withElementDefaults({
            id: 'text-hero',
            type: 'text',
            parentId: null,
            name: 'Hero Text',
            props: {
                text: 'Welcome to Dropple',
                fontSize: 48,
                fontWeight: 700,
                fill: DEFAULT_TEXT_COLOR,
                x: 120,
                y: 140,
                width: 520,
                lineHeight: 1.2,
                letterSpacing: 0,
                align: 'left',
                opacity: 1,
            },
        }),
        withElementDefaults({
            id: 'rect-card',
            type: 'rect',
            parentId: null,
            name: 'Hero Card',
            props: {
                x: 120,
                y: 260,
                width: 420,
                height: 220,
                fill: '#201C3C',
                cornerRadius: 24,
                stroke: '#8B5CF6',
                strokeWidth: 1,
                opacity: 0.92,
                shadowColor: 'rgba(139,92,246,0.35)',
                shadowBlur: 48,
                shadowOffsetX: 0,
                shadowOffsetY: 24,
            },
        }),
    ],
};

function computeBoundingBox(elements) {
    if (!Array.isArray(elements) || elements.length === 0) return null;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    elements.forEach((element) => {
        const props = element?.props ?? {};
        const width = Number.isFinite(props.width) ? props.width : 0;
        const height = Number.isFinite(props.height) ? props.height : 0;
        const x = Number.isFinite(props.x) ? props.x : 0;
        const y = Number.isFinite(props.y) ? props.y : 0;

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + width);
        maxY = Math.max(maxY, y + height);
    });

    if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
        return null;
    }

    return {
        x: minX,
        y: minY,
        width: Math.max(0, maxX - minX),
        height: Math.max(0, maxY - minY),
    };
}

const safeStorage = {
    getItem: (name) => {
        try {
            return globalThis.localStorage?.getItem(name) ?? null;
        } catch (error) {
            console.warn('Canvas store persist getItem failed', error);
            return null;
        }
    },
    setItem: (name, value) => {
        try {
            globalThis.localStorage?.setItem(name, value);
        } catch (error) {
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                console.warn('Canvas store persisted state skipped (quota exceeded)', error);
                return;
            }
            console.warn('Canvas store persist setItem failed', error);
        }
    },
    removeItem: (name) => {
        try {
            globalThis.localStorage?.removeItem(name);
        } catch (error) {
            console.warn('Canvas store persist removeItem failed', error);
        }
    },
};

export const useCanvasStore = create(
    persist(
        (set, get) => ({
            mode: 'design',
            scale: 1,
            position: { x: 0, y: 0 },
            frames: [initialFrame],
            selectedFrameId: initialFrame.id,
            selectedElementId: null,
            selectedElementIds: [],
            selectedTool: 'pointer',
            prototypeMode: false,
            activePrototypeFrameId: initialFrame.id,
            frameLinks: [],
            activeGuides: [],
            autoLayoutPreview: null,
            activeToolOverlay: null,
            comments: [],
            timelineAssets: [],
            timelineActions: [],
            assetLibrary: [...DEFAULT_ASSET_LIBRARY],
            assetUploadQueue: [],
            gradientLibrary: [...DEFAULT_GRADIENT_LIBRARY],
            collaborators: [
                {
                    id: 'collab-local',
                    name: 'You',
                    color: '#6366F1',
                    isMe: true,
                    presence: 'online',
                    lastActiveAt: Date.now(),
                },
            ],
            timelinePlayback: {
                frameId: null,
                isPlaying: false,
                playhead: 0,
                loop: true,
                speed: 1,
                duration: 0,
                lastTick: null,
            },
            gridVisible: false,
            gridSize: 40,
            clipboard: null,
            modeState: {},
            sceneSnapshot: null,
            modeTransitionIntent: null,
            isModeSwitching: false,
            isSceneHydrating: false,
            hydrationTimeoutId: null,
            autosaveStatus: 'idle',
            lastAutosaveAt: null,
            commitHistory: (label, source = 'user') => pushHistory(label, source),
            undoCanvas: () => {
                const snapshot = undo();
                if (!snapshot) return null;
                const { frames, selection, timelineAssets = [], timelineActions = [] } = snapshot.payload;
                set({
                    frames: JSON.parse(JSON.stringify(frames)),
                    selectedFrameId: selection.frameId ?? null,
                    selectedElementIds: [...selection.elementIds],
                    selectedElementId: selection.elementIds[0] ?? null,
                    timelineAssets: JSON.parse(JSON.stringify(timelineAssets)),
                    timelineActions: [...timelineActions],
                });
                return snapshot.label ?? 'change';
            },
            redoCanvas: () => {
                const snapshot = redo();
                if (!snapshot) return null;
                const { frames, selection, timelineAssets = [], timelineActions = [] } = snapshot.payload;
                set({
                    frames: JSON.parse(JSON.stringify(frames)),
                    selectedFrameId: selection.frameId ?? null,
                    selectedElementIds: [...selection.elementIds],
                    selectedElementId: selection.elementIds[0] ?? null,
                    timelineAssets: JSON.parse(JSON.stringify(timelineAssets)),
                    timelineActions: [...timelineActions],
                });
                return snapshot.label ?? 'change';
            },
            contextMenu: null,

    switchMode: async (nextMode, intentOptions = null) => {
        const state = get();
        const normalizedIntent = intentOptions ? normalizeModeIntent(nextMode, intentOptions) : null;
        if (state.mode === nextMode) {
            if (normalizedIntent) {
                set({ modeTransitionIntent: normalizedIntent });
            }
            return;
        }
        const currentMode = state.mode;
        const snapshot = {
            scale: state.scale,
            position: state.position,
            selectedTool: state.selectedTool,
            activeToolOverlay: state.activeToolOverlay,
            selectedFrameId: state.selectedFrameId,
            selectedElementIds: state.selectedElementIds,
            timelineAssets: JSON.parse(JSON.stringify(state.timelineAssets ?? [])),
            frames: JSON.parse(JSON.stringify(state.frames ?? [])),
            scene: JSON.parse(JSON.stringify(state.frames ?? [])),
        };
        set((state) => ({
            modeState: {
                ...state.modeState,
                [currentMode]: snapshot,
            },
            mode: nextMode,
            isModeSwitching: true,
            sceneSnapshot: snapshot.scene,
            modeTransitionIntent: normalizedIntent,
        }));
        const saved = state.modeState?.[nextMode];
        const heavyMode = MODE_ASSETS[nextMode]?.heavy ?? false;
        const hasScene = Array.isArray(saved?.scene) && saved.scene.length > 0;
        const requireLoader = hasScene || heavyMode;

        if (requireLoader) {
            const fallbackTimer = setTimeout(() => {
                const current = get();
                if (current.isSceneHydrating) {
                    set({ isSceneHydrating: false, hydrationTimeoutId: null });
                }
            }, 2000);
            set({ isSceneHydrating: true, hydrationTimeoutId: fallbackTimer });
        } else {
            set({ isSceneHydrating: false, hydrationTimeoutId: null });
        }

        const applySavedState = () => {
            if (saved) {
                set({
                    scale: saved.scale ?? state.scale,
                    position: saved.position ?? state.position,
                    selectedTool: saved.selectedTool ?? 'pointer',
                    activeToolOverlay: saved.activeToolOverlay ?? null,
                    selectedFrameId: saved.selectedFrameId ?? state.frames[0]?.id ?? null,
                    selectedElementIds: Array.isArray(saved.selectedElementIds) ? saved.selectedElementIds : [],
                    selectedElementId: saved.selectedElementIds?.[0] ?? null,
                    timelineAssets: saved.timelineAssets ?? [],
                    frames: saved.frames ?? state.frames,
                    isModeSwitching: false,
                });
            } else {
                set({
                    selectedTool: 'pointer',
                    activeToolOverlay: null,
                    selectedFrameId: state.frames[0]?.id ?? null,
                    selectedElementIds: [],
                    selectedElementId: null,
                    isModeSwitching: false,
                });
            }
        };

        const finishIfNeeded = () => {
            if (!requireLoader || !heavyMode) {
                get().finishSceneHydration();
            }
        };

        if (hasScene) {
            requestAnimationFrame(() => {
                set({ frames: saved.scene ?? state.frames });
                applySavedState();
                if (!heavyMode) {
                    finishIfNeeded();
                }
            });
        } else if (heavyMode) {
            setTimeout(() => {
                applySavedState();
            }, 120);
        } else {
            applySavedState();
            finishIfNeeded();
        }
    },
    setMode: (mode) => get().switchMode(mode),
    finishSceneHydration: () => {
        const timer = get().hydrationTimeoutId;
        if (timer) {
            clearTimeout(timer);
        }
        set({ isSceneHydrating: false, hydrationTimeoutId: null, sceneSnapshot: null });
    },
    setScale: (value) =>
        set((state) => ({ scale: typeof value === 'function' ? value(state.scale) : value })),
    setPosition: (value) =>
        set((state) => ({ position: typeof value === 'function' ? value(state.position) : value })),
    setGridVisible: (visible) => set({ gridVisible: Boolean(visible) }),
    toggleGrid: () => set((state) => ({ gridVisible: !state.gridVisible })),
    setGridSize: (size) => set({ gridSize: Math.max(4, Number(size) || 4) }),
    setSelectedTool: (tool) => set({ selectedTool: tool }),
    setActiveGuides: (guides) => set({ activeGuides: Array.isArray(guides) ? guides : [] }),
    setAutoLayoutPreview: (preview) => set({ autoLayoutPreview: preview }),
    clearAutoLayoutPreview: () => set({ autoLayoutPreview: null, activeGuides: [] }),
    clearActiveGuides: () => set({ activeGuides: [] }),
    setActiveToolOverlay: (overlay) => set({ activeToolOverlay: overlay }),
    setAutosaveStatus: (status) => {
        set({ autosaveStatus: status });
    },
    markAutosaveComplete: (timestamp = Date.now()) => {
        set({ autosaveStatus: 'saved', lastAutosaveAt: timestamp });
    },
    setModeTransitionIntent: (intent) => {
        if (!intent) {
            set({ modeTransitionIntent: null });
            return;
        }
        const currentMode = get().mode;
        set({ modeTransitionIntent: normalizeModeIntent(currentMode, intent) });
    },
    clearModeTransitionIntent: () => set({ modeTransitionIntent: null }),
    sendModeIntent: (mode, intent = {}) => get().switchMode(mode, intent),
    previewAutoLayoutSuggestion: (options = {}) => {
        const state = get();
        const frameId = options.frameId ?? state.selectedFrameId ?? state.frames[0]?.id ?? null;
        if (!frameId) return null;
        const frame = state.frames.find((item) => item.id === frameId);
        if (!frame) return null;

        const parentId = options.parentId ?? null;
        const container = resolveAutoLayoutContainer(frame, parentId);
        if (!container) return null;

        const parentElement = parentId
            ? frame.elements.find((item) => item.id === parentId)
            : null;
        const layoutMode =
            options.layoutMode ??
            (parentElement?.layoutMode ?? frame.layoutMode ?? 'flex-column');

        const fallbackRect = computeEmptyContainerPreviewRect(container);
        const elementWidth =
            Number.isFinite(options.elementSize?.width)
                ? options.elementSize.width
                : Math.max(120, Math.min(fallbackRect.width, 360));
        const elementHeight =
            Number.isFinite(options.elementSize?.height)
                ? options.elementSize.height
                : Math.max(120, Math.min(fallbackRect.height, layoutMode === 'flex-row' ? fallbackRect.height - (container.gap ?? 0) : fallbackRect.height / 2));

        const columns = Math.max(1, Number.isFinite(options.columns) ? options.columns : 1);
        const rows = Math.max(1, Number.isFinite(options.rows) ? options.rows : 1);

        const baseRect = options.rect ?? {
            x: fallbackRect.x,
            y: fallbackRect.y,
            width: elementWidth,
            height: elementHeight,
        };

        const candidatePoint = options.targetPoint ?? {
            x: baseRect.x + baseRect.width / 2,
            y: baseRect.y + baseRect.height / 2,
        };

        const drop = computeAutoLayoutDrop({
            frame,
            parentId,
            elementId: options.elementId ?? null,
            layoutMode,
            candidatePoint,
            container,
        });

        const previewRect = drop.previewRect ?? baseRect;
        const targets = createContainerTargets(
            frame,
            parentId,
            options.ignoreId ?? null,
            container,
        );
        const snapped = snapRectToTargets({
            rect: previewRect,
            targets,
            threshold: options.snapThreshold ?? 8,
        });

        const guideOffsetX = container.offsetX ?? 0;
        const guideOffsetY = container.offsetY ?? 0;
        const baseGuides = (snapped.guides ?? []).map((guide) => ({
            orientation: guide.orientation,
            position:
                guide.position +
                (guide.orientation === 'vertical' ? guideOffsetX : guideOffsetY),
        }));

        const mergedGuides = [...baseGuides];
        const ensureGuide = (orientation, position) => {
            if (!Number.isFinite(position)) return;
            const exists = mergedGuides.some(
                (guide) => guide.orientation === orientation && Math.abs(guide.position - position) < 0.5,
            );
            if (!exists) {
                mergedGuides.push({ orientation, position });
            }
        };

        if (columns > 1) {
            const slice = fallbackRect.width / columns;
            for (let index = 1; index < columns; index += 1) {
                const position = guideOffsetX + fallbackRect.x + slice * index;
                ensureGuide('vertical', position);
            }
        }
        if (rows > 1) {
            const slice = fallbackRect.height / rows;
            for (let index = 1; index < rows; index += 1) {
                const position = guideOffsetY + fallbackRect.y + slice * index;
                ensureGuide('horizontal', position);
            }
        }
        ensureGuide('vertical', guideOffsetX + fallbackRect.x + fallbackRect.width / 2);
        ensureGuide('horizontal', guideOffsetY + fallbackRect.y + fallbackRect.height / 2);

        const preview = {
            frameId: frame.id,
            parentId,
            layoutMode,
            rect: {
                ...previewRect,
                x: snapped.x,
                y: snapped.y,
            },
            beforeId: drop.beforeId,
            afterId: drop.afterId,
            targetIndex: drop.index,
            metadata: {
                columns,
                rows,
                ordered: drop.ordered?.map((item) => item.id) ?? [],
            },
        };

        set({
            autoLayoutPreview: preview,
            activeGuides: mergedGuides,
        });

        const duration = Number.isFinite(options.duration) ? options.duration : 2200;
        if (typeof window !== 'undefined' && duration > 0) {
            const timeoutId = window.setTimeout(() => {
                const latest = get();
                if (latest.autoLayoutPreview === preview) {
                    latest.clearAutoLayoutPreview();
                    latest.clearActiveGuides();
                }
            }, duration);
            return { preview, timeoutId };
        }
        return { preview };
    },

    setSelectedFrame: (id) => {
        const state = get();
        const nextFrameId = id ?? null;
        const selectionUnchanged =
            state.selectedFrameId === nextFrameId &&
            state.selectedElementIds.length === 0 &&
            state.selectedElementId === null;
        if (selectionUnchanged) return;
        const nextPrototype = state.activePrototypeFrameId ?? nextFrameId ?? state.frames[0]?.id ?? null;
        set({
            selectedFrameId: nextFrameId,
            selectedElementId: null,
            selectedElementIds: [],
            activePrototypeFrameId: nextPrototype,
        });
        get().commitHistory('Selection change', 'system');
    },

    setSelectedElement: (frameId, elementId, options = {}) => {
        const state = get();
        let nextFrameId;
        let nextIds;

        if (!frameId || !elementId) {
            nextFrameId = frameId ?? state.selectedFrameId ?? null;
            nextIds = elementId ? [elementId] : [];
        } else {
            const additive = Boolean(options.additive);
            const sameFrame = state.selectedFrameId === frameId;
            if (additive && sameFrame) {
                nextIds = state.selectedElementIds.includes(elementId)
                    ? state.selectedElementIds
                    : [...state.selectedElementIds, elementId];
            } else {
                nextIds = [elementId];
            }
            nextFrameId = frameId;
        }

        const nextPrimary = nextIds[0] ?? null;
        const selectionUnchanged =
            state.selectedFrameId === nextFrameId &&
            state.selectedElementId === nextPrimary &&
            arraysEqual(state.selectedElementIds, nextIds);
        if (selectionUnchanged) return;

        set({
            selectedFrameId: nextFrameId,
            selectedElementId: nextPrimary,
            selectedElementIds: nextIds,
        });
        get().commitHistory('Selection change', 'system');
    },

    toggleElementSelection: (frameId, elementId) => {
        const state = get();
        if (!frameId || !elementId) return;

        let nextIds;
        if (state.selectedFrameId !== frameId) {
            nextIds = [elementId];
        } else {
            const exists = state.selectedElementIds.includes(elementId);
            nextIds = exists
                ? state.selectedElementIds.filter((id) => id !== elementId)
                : [...state.selectedElementIds, elementId];
        }

        const nextPrimary = nextIds[0] ?? null;
        const selectionUnchanged =
            state.selectedFrameId === frameId &&
            state.selectedElementId === nextPrimary &&
            arraysEqual(state.selectedElementIds, nextIds);
        if (selectionUnchanged) return;

        set({
            selectedFrameId: frameId,
            selectedElementId: nextPrimary,
            selectedElementIds: nextIds,
        });
        get().commitHistory('Selection change', 'system');
    },

    clearSelection: () => {
        const state = get();
        const noSelection =
            state.selectedFrameId === null &&
            state.selectedElementId === null &&
            state.selectedElementIds.length === 0;
        if (noSelection) return;
        set({ selectedFrameId: null, selectedElementId: null, selectedElementIds: [] });
        get().commitHistory('Selection change', 'system');
    },

    selectAllElements: (frameId = null) => {
        const state = get();
        const targetFrameId =
            frameId ?? state.selectedFrameId ?? state.frames[0]?.id ?? null;
        if (!targetFrameId) return;
        const frame = state.getFrameById(targetFrameId);
        if (!frame) return;
        const elementIds = frame.elements.map((element) => element.id);
        if (elementIds.length === 0) return;
        const primary = elementIds[0] ?? null;
        const selectionUnchanged =
            state.selectedFrameId === targetFrameId &&
            state.selectedElementId === primary &&
            arraysEqual(state.selectedElementIds, elementIds);
        if (selectionUnchanged) return;
        set({
            selectedFrameId: targetFrameId,
            selectedElementId: primary,
            selectedElementIds: elementIds,
        });
        get().commitHistory('Select all elements', 'user');
    },

    removeSelectedElements: () => {
        const state = get();
        const { selectedFrameId, selectedElementIds } = state;
        if (!selectedFrameId || selectedElementIds.length === 0) return;
        selectedElementIds.forEach((elementId) => {
            get().removeElement(selectedFrameId, elementId, {
                skipHistory: true,
                source: 'user',
            });
        });
        set({ selectedElementId: null, selectedElementIds: [] });
        get().commitHistory('Remove selection', 'user');
    },

    addFrame: (frame) =>
        set((state) => ({
            frames: [...state.frames, frame],
        })),

    addFrameAt: (position, overrides = {}) => {
        let createdFrame = null;
        set((state) => {
            const width = overrides.width ?? 960;
            const height = overrides.height ?? 640;
            const newFrame = {
                id: `frame-${nanoid(6)}`,
                name: overrides.name ?? `Frame ${state.frames.length + 1}`,
                x: position.x,
                y: position.y,
                width,
                height,
                opacity: overrides.opacity ?? 1,
                backgroundColor: overrides.backgroundColor ?? DEFAULT_FRAME_BACKGROUND,
                backgroundImage: overrides.backgroundImage ?? null,
                backgroundFit: overrides.backgroundFit ?? 'cover',
                backgroundFillType: overrides.backgroundFillType ?? 'solid',
                backgroundGradientType: overrides.backgroundGradientType ?? 'linear',
                backgroundGradientStart: overrides.backgroundGradientStart ?? '#8B5CF6',
                backgroundGradientEnd: overrides.backgroundGradientEnd ?? '#3B82F6',
                backgroundGradientAngle: overrides.backgroundGradientAngle ?? 45,
                backgroundPatternScale: overrides.backgroundPatternScale ?? 1,
                backgroundPatternOffsetX: overrides.backgroundPatternOffsetX ?? 0,
                backgroundPatternOffsetY: overrides.backgroundPatternOffsetY ?? 0,
                backgroundPatternRepeat: overrides.backgroundPatternRepeat ?? 'repeat',
                backgroundBlendMode: overrides.backgroundBlendMode ?? 'normal',
                layoutMode: overrides.layoutMode ?? 'absolute',
                layoutGap: overrides.layoutGap ?? 32,
                layoutAlign: overrides.layoutAlign ?? 'start',
                layoutCrossAlign: overrides.layoutCrossAlign ?? 'start',
                layoutWrap: overrides.layoutWrap ?? DEFAULT_FLEX_WRAP,
                layoutPadding: overrides.layoutPadding
                    ? { ...DEFAULT_LAYOUT_PADDING, ...overrides.layoutPadding }
                    : { ...DEFAULT_LAYOUT_PADDING },
                layoutRowGap: overrides.layoutRowGap ?? 32,
                layoutGridColumns: overrides.layoutGridColumns ?? DEFAULT_GRID_COLUMNS,
                layoutGridAutoRows: overrides.layoutGridAutoRows ?? DEFAULT_GRID_AUTO_ROWS,
                timelineDuration: overrides.timelineDuration ?? 20,
                elements: [],
            };
            createdFrame = newFrame;
            return {
                frames: [...state.frames, newFrame],
                selectedFrameId: newFrame.id,
                selectedElementId: null,
                selectedElementIds: [],
            };
        });
        return createdFrame;
    },

    updateFrame: (id, updates, options = {}) => {
        const { skipHistory = false, historyLabel = 'Update frame', source = 'user' } = options;
        let shouldReflow = false;
        let frameChanged = false;
        set((state) => ({
            frames: state.frames.map((frame) => {
                if (frame.id !== id) return frame;
                const next = {
                    ...frame,
                    ...updates,
                };
                let localChanged = false;

                if (updates.layoutPadding) {
                    next.layoutPadding = {
                        ...normalizePadding(frame.layoutPadding),
                        ...updates.layoutPadding,
                    };
                    localChanged = true;
                }

                if (updates.layoutRowGap !== undefined) {
                    next.layoutRowGap = Number.isFinite(updates.layoutRowGap)
                        ? updates.layoutRowGap
                        : frame.layoutRowGap ?? 0;
                    shouldReflow = true;
                    localChanged = true;
                }

                if (updates.layoutGridColumns !== undefined) {
                    next.layoutGridColumns = Number.isFinite(updates.layoutGridColumns)
                        ? updates.layoutGridColumns
                        : frame.layoutGridColumns ?? DEFAULT_GRID_COLUMNS;
                    shouldReflow = true;
                    localChanged = true;
                }

                if (updates.layoutGridAutoRows !== undefined) {
                    next.layoutGridAutoRows = Number.isFinite(updates.layoutGridAutoRows)
                        ? updates.layoutGridAutoRows
                        : frame.layoutGridAutoRows ?? DEFAULT_GRID_AUTO_ROWS;
                    shouldReflow = true;
                    localChanged = true;
                }

                if (updates.layoutWrap !== undefined) {
                    const allowedWrap = ['nowrap', 'wrap', 'wrap-reverse'];
                    next.layoutWrap = typeof updates.layoutWrap === 'string' && allowedWrap.includes(updates.layoutWrap)
                        ? updates.layoutWrap
                        : frame.layoutWrap ?? DEFAULT_FLEX_WRAP;
                    shouldReflow = true;
                    localChanged = true;
                }

                if (frame.layoutMode !== 'absolute' || next.layoutMode !== 'absolute') {
                    if (updates.width !== undefined || updates.height !== undefined) {
                        shouldReflow = true;
                        localChanged = true;
                    }
                }

                if (!localChanged) {
                    const keys = Object.keys(updates || {});
                    localChanged = keys.some((key) => next[key] !== frame[key]);
                    if (!localChanged) return frame;
                }
                frameChanged = true;

                if (
                    updates.layoutMode !== undefined ||
                    updates.layoutGap !== undefined ||
                    updates.layoutAlign !== undefined ||
                    updates.layoutCrossAlign !== undefined ||
                    updates.layoutWrap !== undefined ||
                    updates.layoutPadding !== undefined ||
                    updates.layoutRowGap !== undefined ||
                    updates.layoutGridColumns !== undefined ||
                    updates.layoutGridAutoRows !== undefined ||
                    updates.layoutGridAutoFit !== undefined ||
                    updates.layoutGridMinColumnWidth !== undefined
                ) {
                    shouldReflow = true;
                }

                return next;
            }),
        }));

        if (!frameChanged && !shouldReflow) return;

        if (shouldReflow) {
            const latest = get().frames.find((frame) => frame.id === id);
            if (latest && latest.layoutMode && latest.layoutMode !== 'absolute') {
                get().reflowFrame(id);
                frameChanged = true;
            }
        }

        if (updates.timelineDuration !== undefined) {
            const playback = get().timelinePlayback;
            if (playback.frameId === id) {
                const latestFrame = get().frames.find((frame) => frame.id === id);
                if (latestFrame) {
                    const duration = Math.max(latestFrame.timelineDuration ?? playback.duration ?? 20, 0.1);
                    const clamped = Math.min(playback.playhead ?? 0, duration);
                    set({
                        timelinePlayback: {
                            ...playback,
                            duration,
                            playhead: clamped,
                            lastTick: playback.isPlaying ? getNow() : playback.lastTick,
                        },
                    });
                }
            }
        }

        if (frameChanged && !skipHistory) {
            get().commitHistory(historyLabel, source);
        }
    },

    setFrameLayout: (frameId, updates, options = {}) => {
        const { skipHistory = false, historyLabel = 'Update frame layout', source = 'user' } = options;
        if (!frameId || !updates) return;
        let changed = false;
        set((state) => ({
            frames: state.frames.map((frame) => {
                if (frame.id !== frameId) return frame;
                const currentPadding = normalizePadding(frame.layoutPadding);
                const nextPadding = updates.layoutPadding
                    ? { ...currentPadding, ...updates.layoutPadding }
                    : currentPadding;
                const nextFrame = {
                    ...frame,
                    layoutMode: updates.layoutMode ?? frame.layoutMode ?? 'absolute',
                    layoutGap: updates.layoutGap ?? frame.layoutGap ?? 0,
                    layoutAlign: updates.layoutAlign ?? frame.layoutAlign ?? 'start',
                    layoutCrossAlign: updates.layoutCrossAlign ?? frame.layoutCrossAlign ?? 'start',
                    layoutWrap: updates.layoutWrap ?? frame.layoutWrap ?? DEFAULT_FLEX_WRAP,
                    layoutPadding: nextPadding,
                    layoutRowGap: updates.layoutRowGap ?? frame.layoutRowGap ?? 0,
                    layoutGridColumns: updates.layoutGridColumns ?? frame.layoutGridColumns ?? DEFAULT_GRID_COLUMNS,
                    layoutGridAutoRows: updates.layoutGridAutoRows ?? frame.layoutGridAutoRows ?? DEFAULT_GRID_AUTO_ROWS,
                    layoutGridAutoFit: updates.layoutGridAutoFit ?? frame.layoutGridAutoFit ?? 'none',
                    layoutGridMinColumnWidth:
                        updates.layoutGridMinColumnWidth ?? frame.layoutGridMinColumnWidth ?? DEFAULT_GRID_MIN_COLUMN_WIDTH,
                };
                const layoutChanged =
                    nextFrame.layoutMode !== frame.layoutMode ||
                    nextFrame.layoutGap !== frame.layoutGap ||
                    nextFrame.layoutAlign !== frame.layoutAlign ||
                    nextFrame.layoutCrossAlign !== frame.layoutCrossAlign ||
                    nextFrame.layoutWrap !== frame.layoutWrap ||
                    nextFrame.layoutRowGap !== frame.layoutRowGap ||
                    nextFrame.layoutGridColumns !== frame.layoutGridColumns ||
                    nextFrame.layoutGridAutoRows !== frame.layoutGridAutoRows ||
                    nextFrame.layoutGridAutoFit !== frame.layoutGridAutoFit ||
                    nextFrame.layoutGridMinColumnWidth !== frame.layoutGridMinColumnWidth ||
                    JSON.stringify(frame.layoutPadding) !== JSON.stringify(nextFrame.layoutPadding);
                if (!layoutChanged) return frame;
                changed = true;
                return nextFrame;
            }),
        }));
        if (!changed) return;
        const latest = get().frames.find((frame) => frame.id === frameId);
        if (latest && latest.layoutMode && latest.layoutMode !== 'absolute') {
            get().reflowFrame(frameId);
        }
        if (!skipHistory) {
            get().commitHistory(historyLabel, source);
        }
    },

    setGroupLayout: (frameId, groupId, updates, options = {}) => {
        const {
            skipHistory = false,
            historyLabel = 'Update group layout',
            source = 'user',
        } = options;
        if (!frameId || !groupId || !updates) return;
        let shouldReflow = false;
        let groupChanged = false;
        set((state) => ({
            frames: state.frames.map((frame) => {
                if (frame.id !== frameId) return frame;
                let elementChanged = false;
                const elements = frame.elements.map((element) => {
                    if (element.id !== groupId || element.type !== 'group') return element;
                    const currentPadding = normalizePadding(element.layoutPadding);
                    const nextPadding = updates.layoutPadding
                        ? { ...currentPadding, ...updates.layoutPadding }
                        : currentPadding;
                    const nextLayoutMode = updates.layoutMode ?? element.layoutMode ?? 'absolute';
                    const nextGap = updates.layoutGap ?? element.layoutGap ?? 0;
                    const nextAlign = updates.layoutAlign ?? element.layoutAlign ?? 'start';
                    const nextCrossAlign = updates.layoutCrossAlign ?? element.layoutCrossAlign ?? 'stretch';
                    const nextWrap = updates.layoutWrap ?? element.layoutWrap ?? DEFAULT_FLEX_WRAP;
                    const nextRowGap = updates.layoutRowGap ?? element.layoutRowGap ?? 0;
                    const nextColumns = updates.layoutGridColumns ?? element.layoutGridColumns ?? DEFAULT_GRID_COLUMNS;
                    const nextAutoRows = updates.layoutGridAutoRows ?? element.layoutGridAutoRows ?? DEFAULT_GRID_AUTO_ROWS;
                    const nextAutoFit = updates.layoutGridAutoFit ?? element.layoutGridAutoFit ?? 'none';
                    const nextMinColumnWidth =
                        updates.layoutGridMinColumnWidth ?? element.layoutGridMinColumnWidth ?? DEFAULT_GRID_MIN_COLUMN_WIDTH;
                    if (
                        element.layoutMode !== nextLayoutMode ||
                        element.layoutGap !== nextGap ||
                        element.layoutAlign !== nextAlign ||
                        element.layoutCrossAlign !== nextCrossAlign ||
                        element.layoutWrap !== nextWrap ||
                        element.layoutRowGap !== nextRowGap ||
                        element.layoutGridColumns !== nextColumns ||
                        element.layoutGridAutoRows !== nextAutoRows ||
                        element.layoutGridAutoFit !== nextAutoFit ||
                        element.layoutGridMinColumnWidth !== nextMinColumnWidth ||
                        JSON.stringify(element.layoutPadding) !== JSON.stringify(nextPadding)
                    ) {
                        shouldReflow = true;
                    }
                    elementChanged = true;
                    return {
                        ...element,
                        layoutMode: nextLayoutMode,
                        layoutGap: nextGap,
                        layoutAlign: nextAlign,
                        layoutCrossAlign: nextCrossAlign,
                        layoutWrap: nextWrap,
                        layoutPadding: nextPadding,
                        layoutRowGap: nextRowGap,
                        layoutGridColumns: nextColumns,
                        layoutGridAutoRows: nextAutoRows,
                        layoutGridAutoFit: nextAutoFit,
                        layoutGridMinColumnWidth: nextMinColumnWidth,
                    };
                });
                if (!elementChanged) return frame;
                groupChanged = true;
                return { ...frame, elements };
            }),
        }));

        if (shouldReflow) {
            const latest = get().frames.find((frame) => frame.id === frameId);
            if (!latest) return;
            const target = latest.elements.find((element) => element.id === groupId && element.type === 'group');
            if (!target) return;
            get().reflowGroup(frameId, groupId);
            if (target.parentId) {
                get().reflowGroup(frameId, target.parentId);
            } else if (latest.layoutMode && latest.layoutMode !== 'absolute') {
                get().reflowFrame(frameId);
            }
        }

        if (groupChanged && !skipHistory) {
            get().commitHistory(historyLabel, source);
        }
    },

    setElementLayout: (frameId, elementId, updates, options = {}) => {
        const {
            skipHistory = false,
            historyLabel = 'Update element layout',
            source = 'user',
        } = options;
        if (!frameId || !elementId || !updates) return;
        let changed = false;
        set((state) => ({
            frames: state.frames.map((frame) => {
                if (frame.id !== frameId) return frame;
                const elements = frame.elements.map((element) => {
                    if (element.id !== elementId) return element;
                    const currentLayout = element.layout ?? {};
                    const nextLayout = {
                        ...currentLayout,
                        ...updates,
                    };
                    let localChanged = false;
                    const keys = new Set([
                        ...Object.keys(currentLayout),
                        ...Object.keys(updates),
                    ]);
                    keys.forEach((key) => {
                        if (currentLayout[key] !== nextLayout[key]) {
                            localChanged = true;
                        }
                    });
                    if (!localChanged) {
                        return element;
                    }
                    changed = true;
                    return {
                        ...element,
                        layout: nextLayout,
                    };
                });
                return {
                    ...frame,
                    elements,
                };
            }),
        }));
        const latest = get().frames.find((frame) => frame.id === frameId);
        if (changed && latest && latest.layoutMode && latest.layoutMode !== 'absolute') {
            get().reflowFrame(frameId);
        }
        if (changed && !skipHistory) {
            get().commitHistory(historyLabel, source);
        }
    },
    reflowFrame: (frameId) => {
        const state = get();
        const frame = state.frames.find((item) => item.id === frameId);
        if (!frame) return;
        if (frame.layoutMode && frame.layoutMode !== 'absolute') {
            if (frame.layoutMode === 'flex-column') {
                const { elements, changed } = computeFlexColumnLayout(frame);
                if (changed) {
                    set((innerState) => ({
                        frames: innerState.frames.map((item) =>
                            item.id === frameId
                                ? {
                                      ...item,
                                      elements,
                                  }
                                : item,
                        ),
                    }));
                }
            }

            if (frame.layoutMode === 'flex-row') {
                const { elements, changed } = computeFlexRowLayout(frame);
                if (changed) {
                    set((innerState) => ({
                        frames: innerState.frames.map((item) =>
                            item.id === frameId
                                ? {
                                      ...item,
                                      elements,
                                  }
                                : item,
                        ),
                    }));
                }
            }
            if (frame.layoutMode === 'grid') {
                const { elements, changed } = computeGridLayout(frame);
                if (changed) {
                    set((innerState) => ({
                        frames: innerState.frames.map((item) =>
                            item.id === frameId
                                ? {
                                      ...item,
                                      elements,
                                  }
                                : item,
                        ),
                    }));
                }
            }
        }
        get().reflowGroupsWithinFrame(frameId);
    },

    reflowGroup: (frameId, groupId) => {
        const state = get();
        const frame = state.frames.find((item) => item.id === frameId);
        if (!frame) return;
        const group = frame.elements.find((element) => element.id === groupId && element.type === 'group');
        if (!group) return;
        if (!group.layoutMode || group.layoutMode === 'absolute') return;

        const children = frame.elements.filter((element) => element.parentId === groupId);
        if (children.length === 0) return;

        const padding = normalizePadding(group.layoutPadding);
        const sandboxChildren = children.map((child) => ({
            ...child,
            parentId: null,
        }));

        const containerWidth = Number.isFinite(group.props?.width) ? group.props.width : frame.width;
        const containerHeight = Number.isFinite(group.props?.height) ? group.props.height : frame.height;

        const syntheticFrame = {
            id: `${group.id}-layout`,
            width: containerWidth ?? frame.width ?? 0,
            height: containerHeight ?? frame.height ?? 0,
            layoutMode: group.layoutMode,
            layoutGap: group.layoutGap ?? 0,
            layoutAlign: group.layoutAlign ?? 'start',
            layoutCrossAlign: group.layoutCrossAlign ?? 'stretch',
            layoutWrap: group.layoutWrap ?? DEFAULT_FLEX_WRAP,
            layoutPadding: padding,
            layoutRowGap: group.layoutRowGap ?? group.layoutGap ?? 0,
            layoutGridColumns: group.layoutGridColumns ?? DEFAULT_GRID_COLUMNS,
            layoutGridAutoRows: group.layoutGridAutoRows ?? DEFAULT_GRID_AUTO_ROWS,
            layoutGridAutoFit: AUTO_FIT_OPTIONS.includes(group.layoutGridAutoFit) ? group.layoutGridAutoFit : 'none',
            layoutGridMinColumnWidth: Number.isFinite(group.layoutGridMinColumnWidth)
                ? group.layoutGridMinColumnWidth
                : DEFAULT_GRID_MIN_COLUMN_WIDTH,
            elements: sandboxChildren,
        };

        let layoutResult;
        if (group.layoutMode === 'flex-row') {
            layoutResult = computeFlexRowLayout(syntheticFrame);
        } else if (group.layoutMode === 'flex-column') {
            layoutResult = computeFlexColumnLayout(syntheticFrame);
        } else if (group.layoutMode === 'grid') {
            layoutResult = computeGridLayout(syntheticFrame);
        } else {
            return;
        }

        if (!layoutResult.changed) {
            return;
        }

        const updates = new Map();
        layoutResult.elements.forEach((child) => {
            updates.set(child.id, child.props ?? {});
        });

        const bounding = computeBoundingBox(
            layoutResult.elements.map((element) => ({
                props: element.props,
            })),
        );

        const desiredGroupWidth =
            bounding && Number.isFinite(bounding.width)
                ? bounding.width + padding.left + padding.right
                : group.props?.width;
        const desiredGroupHeight =
            bounding && Number.isFinite(bounding.height)
                ? bounding.height + padding.top + padding.bottom
                : group.props?.height;
        const widthChanged =
            Number.isFinite(desiredGroupWidth) && desiredGroupWidth !== group.props?.width;
        const heightChanged =
            Number.isFinite(desiredGroupHeight) && desiredGroupHeight !== group.props?.height;

        set((innerState) => ({
            frames: innerState.frames.map((item) => {
                if (item.id !== frameId) return item;
                let changed = false;
                const elements = item.elements.map((element) => {
                    if (updates.has(element.id)) {
                        changed = true;
                        const nextProps = {
                            ...element.props,
                            ...updates.get(element.id),
                        };
                        return {
                            ...element,
                            props: nextProps,
                        };
                    }
                    if (element.id === groupId) {
                        const nextProps = { ...(element.props ?? {}) };
                        let updated = false;
                        if (Number.isFinite(desiredGroupWidth) && desiredGroupWidth !== nextProps.width) {
                            nextProps.width = desiredGroupWidth;
                            updated = true;
                        }
                        if (Number.isFinite(desiredGroupHeight) && desiredGroupHeight !== nextProps.height) {
                            nextProps.height = desiredGroupHeight;
                            updated = true;
                        }
                        if (updated) {
                            changed = true;
                            return {
                                ...element,
                                props: nextProps,
                            };
                        }
                    }
                    return element;
                });
                return changed ? { ...item, elements } : item;
            }),
        }));

        if (group.parentId) {
            const latestFrame = get().frames.find((item) => item.id === frameId);
            const parent = latestFrame?.elements.find(
                (element) => element.id === group.parentId && element.type === 'group',
            );
            if (
                parent &&
                parent.layoutMode &&
                parent.layoutMode !== 'absolute' &&
                (widthChanged || heightChanged)
            ) {
                get().reflowGroup(frameId, parent.id);
            }
        } else if ((widthChanged || heightChanged) && frame.layoutMode && frame.layoutMode !== 'absolute') {
            get().reflowFrame(frameId);
        }
    },

    reflowGroupsWithinFrame: (frameId, parentId = null) => {
        const state = get();
        const frame = state.frames.find((item) => item.id === frameId);
        if (!frame) return;
        const groups = frame.elements.filter(
            (element) => element.type === 'group' && (parentId ? element.parentId === parentId : !element.parentId),
        );

        groups.forEach((group) => {
            get().reflowGroupsWithinFrame(frameId, group.id);
            get().reflowGroup(frameId, group.id);
        });
    },

    setFrameBackground: (frameId, updates, options = {}) => {
        const {
            skipHistory = false,
            historyLabel = 'Update frame background',
            source = 'user',
        } = options;
        if (!frameId || !updates) return;

        let changed = false;
        set((state) => ({
            frames: state.frames.map((frame) => {
                if (frame.id !== frameId) return frame;

                const nextFrame = {
                    ...frame,
                    backgroundFillType: updates.backgroundFillType ?? frame.backgroundFillType ?? 'solid',
                    backgroundColor:
                        updates.backgroundColor !== undefined ? updates.backgroundColor : frame.backgroundColor,
                    backgroundImage:
                        updates.backgroundImage !== undefined ? updates.backgroundImage : frame.backgroundImage,
                    backgroundFit: updates.backgroundFit ?? frame.backgroundFit ?? 'cover',
                    backgroundBlendMode: updates.backgroundBlendMode ?? frame.backgroundBlendMode ?? 'normal',
                    backgroundGradientType:
                        updates.backgroundGradientType ?? frame.backgroundGradientType ?? 'linear',
                    backgroundGradientStart:
                        updates.backgroundGradientStart ?? frame.backgroundGradientStart ?? '#8B5CF6',
                    backgroundGradientEnd:
                        updates.backgroundGradientEnd ?? frame.backgroundGradientEnd ?? '#3B82F6',
                    backgroundGradientAngle:
                        updates.backgroundGradientAngle ?? frame.backgroundGradientAngle ?? 45,
                    backgroundPatternScale:
                        updates.backgroundPatternScale ?? frame.backgroundPatternScale ?? 1,
                    backgroundPatternOffsetX:
                        updates.backgroundPatternOffsetX ?? frame.backgroundPatternOffsetX ?? 0,
                    backgroundPatternOffsetY:
                        updates.backgroundPatternOffsetY ?? frame.backgroundPatternOffsetY ?? 0,
                    backgroundPatternRepeat:
                        updates.backgroundPatternRepeat ?? frame.backgroundPatternRepeat ?? 'repeat',
                };

                const keys = [
                    'backgroundFillType',
                    'backgroundColor',
                    'backgroundImage',
                    'backgroundFit',
                    'backgroundBlendMode',
                    'backgroundGradientType',
                    'backgroundGradientStart',
                    'backgroundGradientEnd',
                    'backgroundGradientAngle',
                    'backgroundPatternScale',
                    'backgroundPatternOffsetX',
                    'backgroundPatternOffsetY',
                    'backgroundPatternRepeat',
                ];

                const localChanged = keys.some((key) => nextFrame[key] !== frame[key]);
                if (!localChanged) {
                    return frame;
                }

                changed = true;
                return nextFrame;
            }),
        }));

        if (changed && !skipHistory) {
            get().commitHistory(historyLabel, source);
        }
    },

    addElementToFrame: (frameId, element, parentId = null, options = {}) => {
        const {
            skipHistory = false,
            historyLabel,
            source = 'user',
        } = options;
        set((state) => ({
            frames: state.frames.map((frame) => {
                if (frame.id !== frameId) return frame;
                const newElement = withElementDefaults({
                    ...element,
                    name: element?.name ?? getDefaultElementName(element?.type),
                    parentId: parentId ?? element.parentId ?? null,
                });
                return { ...frame, elements: [...frame.elements, newElement] };
            }),
        }));

        const latestFrame = get().frames.find((item) => item.id === frameId);
        if (!latestFrame) return;
        if (parentId) {
            const parent = latestFrame.elements.find((item) => item.id === parentId && item.type === 'group');
            if (parent && parent.layoutMode && parent.layoutMode !== 'absolute') {
                get().reflowGroup(frameId, parentId);
                if (parent.parentId) {
                    get().reflowGroup(frameId, parent.parentId);
                }
            }
        } else if (latestFrame.layoutMode && latestFrame.layoutMode !== 'absolute') {
            get().reflowFrame(frameId);
        }
        if (!skipHistory) {
            const elementType = element?.type ?? 'element';
            const elementName = element?.name ?? getDefaultElementName(elementType);
            const label = historyLabel ?? `Add ${elementName}`;
            get().commitHistory(label, source);
        }
    },

    updateElement: (frameId, elementId, updates) =>
        set((state) => ({
            frames: state.frames.map((frame) => {
                if (frame.id !== frameId) return frame;
                let changed = false;
                const elements = frame.elements.map((element) => {
                    if (element.id !== elementId) return element;
                    changed = true;
                    return { ...element, ...updates };
                });
                return changed ? { ...frame, elements } : frame;
            }),
        })),

    updateElementProps: (frameId, elementId, propUpdates, options = {}) => {
        const { skipHistory = false, historyLabel = 'Edit element', source = 'user' } = options;
        if (!frameId || !elementId || !propUpdates) return;
        const state = get();
        const frame = state.frames.find((item) => item.id === frameId);
        if (!frame) return;

        const element = frame.elements.find((item) => item.id === elementId);
        if (!element) return;

        const hasWidth = Object.prototype.hasOwnProperty.call(propUpdates, 'width');
        const hasHeight = Object.prototype.hasOwnProperty.call(propUpdates, 'height');

        const frameAutoLayout = frame.layoutMode && frame.layoutMode !== 'absolute';

        const ancestorGroupIds = [];
        let currentParentId = element.parentId;
        while (currentParentId) {
            const parent = frame.elements.find((item) => item.id === currentParentId && item.type === 'group');
            if (!parent) break;
            if (parent.layoutMode && parent.layoutMode !== 'absolute') {
                ancestorGroupIds.push(parent.id);
            }
            currentParentId = parent.parentId;
        }

        let frameNeedsReflow = false;
        let selfNeedsReflow = false;
        let elementChanged = false;

        set((innerState) => {
            let frameChanged = false;
            const frames = innerState.frames.map((currentFrame) => {
                if (currentFrame.id !== frameId) return currentFrame;

                let changed = false;
                const elements = currentFrame.elements.map((currentElement) => {
                    if (currentElement.id !== elementId) return currentElement;
                    changed = true;

                    const nextProps = {
                        ...currentElement.props,
                        ...propUpdates,
                    };

                    let nextElement = {
                        ...currentElement,
                        props: nextProps,
                    };

                    const elementLayout = currentElement.layout ?? {};

                    const propKeys = Object.keys(propUpdates ?? {});
                    if (propKeys.some((key) => nextProps[key] !== currentElement.props?.[key])) {
                        elementChanged = true;
                    }

                    if (frameAutoLayout) {
                        const columnTrigger = frame.layoutMode === 'flex-column' && (hasHeight || hasWidth);
                        const rowTrigger = frame.layoutMode === 'flex-row' && (hasWidth || hasHeight);

                        if (columnTrigger || rowTrigger) {
                            frameNeedsReflow = true;
                            let nextLayout = elementLayout;
                            let layoutChanged = false;

                            if (frame.layoutMode === 'flex-column' && hasHeight && Number.isFinite(propUpdates.height)) {
                                const basis = propUpdates.height;
                                if (elementLayout.basis !== basis) {
                                    nextLayout = { ...elementLayout, basis };
                                    layoutChanged = true;
                                }
                            }

                            if (frame.layoutMode === 'flex-row' && hasWidth && Number.isFinite(propUpdates.width)) {
                                const basis = propUpdates.width;
                                if (elementLayout.basis !== basis) {
                                    nextLayout = { ...elementLayout, basis };
                                    layoutChanged = true;
                                }
                            }

                            if (layoutChanged) {
                                nextElement = {
                                    ...nextElement,
                                    layout: nextLayout,
                                };
                                elementChanged = true;
                            }
                        }
                    }

                    if (currentElement.type === 'group' && currentElement.layoutMode && currentElement.layoutMode !== 'absolute') {
                        if (hasWidth || hasHeight) {
                            selfNeedsReflow = true;
                        }
                    }

                    return nextElement;
                });

                if (!changed) return currentFrame;
                frameChanged = true;
                return { ...currentFrame, elements };
            });

            return frameChanged ? { frames } : {};
        });

        if (selfNeedsReflow) {
            get().reflowGroup(frameId, elementId);
            elementChanged = true;
        }

        if (ancestorGroupIds.length > 0 && (hasWidth || hasHeight)) {
            for (let index = 0; index < ancestorGroupIds.length; index += 1) {
                const groupId = ancestorGroupIds[index];
                get().reflowGroup(frameId, groupId);
                elementChanged = true;
            }
        }

        if (frameNeedsReflow) {
            get().reflowFrame(frameId);
            elementChanged = true;
        }

        if (elementChanged && !skipHistory) {
            get().commitHistory(historyLabel, source);
        }
    },
    updateElementsPropsBatch: (frameId, updatesList, options = {}) => {
        const { historyLabel = 'Edit elements', source = 'user', skipHistory = false } = options;
        if (!frameId || !Array.isArray(updatesList) || updatesList.length === 0) return;
        updatesList.forEach((entry, index) => {
            const isLast = index === updatesList.length - 1;
            get().updateElementProps(
                frameId,
                entry.elementId,
                entry.props ?? {},
                {
                    historyLabel,
                    source,
                    skipHistory: skipHistory || !isLast,
                },
            );
        });
    },

    setElementLink: (frameId, elementId, targetFrameId) => {
        const sanitized = targetFrameId || null;
        get().updateElementProps(frameId, elementId, { linkTarget: sanitized });
    },

    setElementParent: (frameId, elementId, parentId = null) =>
        set((state) => ({
            frames: state.frames.map((frame) => {
                if (frame.id !== frameId) return frame;
                return {
                    ...frame,
                    elements: frame.elements.map((element) =>
                        element.id === elementId ? { ...element, parentId } : element,
                    ),
                };
            }),
        })),

    removeElement: (frameId, elementId, options = {}) => {
        const {
            skipHistory = false,
            historyLabel,
            source = 'user',
        } = options;
        let removedElement = null;
        let parentId = null;
        let removed = false;
        set((state) => ({
            frames: state.frames.map((frame) => {
                if (frame.id !== frameId) return frame;
                const existing = frame.elements.find((element) => element.id === elementId);
                if (existing) {
                    removedElement = existing;
                    parentId = existing.parentId ?? null;
                    removed = true;
                }
                return {
                    ...frame,
                    elements: frame.elements.filter((element) => element.id !== elementId),
                };
            }),
            comments: state.comments.filter((comment) => comment.elementId !== elementId),
        }));

        const frame = get().frames.find((item) => item.id === frameId);
        if (!frame) return;

        if (parentId) {
            const parent = frame.elements.find((element) => element.id === parentId && element.type === 'group');
            if (parent && parent.layoutMode && parent.layoutMode !== 'absolute') {
                get().reflowGroup(frameId, parentId);
                if (parent.parentId) {
                    get().reflowGroup(frameId, parent.parentId);
                }
            }
        } else if (frame.layoutMode && frame.layoutMode !== 'absolute') {
            get().reflowFrame(frameId);
        }

        if (removedElement?.type === 'group') {
            const childIds = new Set(frame?.elements.filter((element) => element.parentId === elementId).map((item) => item.id));
            if (childIds.size > 0) {
                childIds.forEach((childId) => {
                    get().removeElement(frameId, childId, { skipHistory: true, historyLabel, source });
                });
            }
        }
        if (removed && !skipHistory && removedElement) {
            const elementLabel = removedElement.name ?? getDefaultElementName(removedElement.type);
            const label = historyLabel ?? `Remove ${elementLabel}`;
            get().commitHistory(label, source);
        }
    },
    removeFrame: (frameId, options = {}) => {
        const {
            skipHistory = false,
            historyLabel,
            source = 'user',
        } = options;
        const state = get();
        const removedFrame = state.frames.find((frame) => frame.id === frameId);
        if (!removedFrame) return;
        const remainingFrames = state.frames.filter((frame) => frame.id !== frameId);
        const nextFrame = state.selectedFrameId === frameId ? remainingFrames[0]?.id ?? null : state.selectedFrameId;

        set({
            frames: remainingFrames,
            selectedFrameId: nextFrame,
            selectedElementId: null,
            selectedElementIds: [],
            comments: state.comments.filter((comment) => comment.frameId !== frameId),
            timelineAssets: state.timelineAssets.filter((asset) => asset.frameId !== frameId),
            frameLinks: state.frameLinks.filter((link) => link.from !== frameId && link.to !== frameId),
        });
        if (!skipHistory) {
            const frameLabel = removedFrame.name ?? 'Frame';
            get().commitHistory(historyLabel ?? `Remove frame "${frameLabel}"`, source);
        }
    },

    bringElementForward: (frameId, elementId) => {
        if (!frameId || !elementId) return;
        let moved = false;
        set((state) => ({
            frames: state.frames.map((frame) => {
                if (frame.id !== frameId) return frame;
                const index = frame.elements.findIndex((element) => element.id === elementId);
                if (index === -1 || index === frame.elements.length - 1) return frame;
                const elements = [...frame.elements];
                [elements[index], elements[index + 1]] = [elements[index + 1], elements[index]];
                moved = true;
                return { ...frame, elements };
            }),
        }));
        if (moved) {
            get().commitHistory('Bring element forward', 'user');
        }
    },

    sendElementBackward: (frameId, elementId) => {
        if (!frameId || !elementId) return;
        let moved = false;
        set((state) => ({
            frames: state.frames.map((frame) => {
                if (frame.id !== frameId) return frame;
                const index = frame.elements.findIndex((element) => element.id === elementId);
                if (index <= 0) return frame;
                const elements = [...frame.elements];
                [elements[index], elements[index - 1]] = [elements[index - 1], elements[index]];
                moved = true;
                return { ...frame, elements };
            }),
        }));
        if (moved) {
            get().commitHistory('Send element backward', 'user');
        }
    },

    bringElementToFront: (frameId, elementId) => {
        if (!frameId || !elementId) return;
        let moved = false;
        set((state) => ({
            frames: state.frames.map((frame) => {
                if (frame.id !== frameId) return frame;
                const index = frame.elements.findIndex((element) => element.id === elementId);
                if (index === -1 || index === frame.elements.length - 1) return frame;
                const elements = [...frame.elements];
                const [target] = elements.splice(index, 1);
                elements.push(target);
                moved = true;
                return { ...frame, elements };
            }),
        }));
        if (moved) {
            get().commitHistory('Bring element to front', 'user');
        }
    },

    sendElementToBack: (frameId, elementId) => {
        if (!frameId || !elementId) return;
        let moved = false;
        set((state) => ({
            frames: state.frames.map((frame) => {
                if (frame.id !== frameId) return frame;
                const index = frame.elements.findIndex((element) => element.id === elementId);
                if (index <= 0) return frame;
                const elements = [...frame.elements];
                const [target] = elements.splice(index, 1);
                elements.unshift(target);
                moved = true;
                return { ...frame, elements };
            }),
        }));
        if (moved) {
            get().commitHistory('Send element to back', 'user');
        }
    },

    groupSelectedElements: () => {
        const state = get();
        const { selectedFrameId, selectedElementIds } = state;
        if (!selectedFrameId || selectedElementIds.length < 2) return;

        const frame = state.getFrameById(selectedFrameId);
        if (!frame) return;

        const selectedSet = new Set(selectedElementIds);
        const elementsToGroup = frame.elements.filter((element) => selectedSet.has(element.id));
        if (elementsToGroup.length < 2) return;

        const parentId = elementsToGroup[0].parentId ?? null;
        const sameParent = elementsToGroup.every((element) => (element.parentId ?? null) === parentId);
        if (!sameParent) return;

        const bounds = computeBoundingBox(elementsToGroup);
        if (!bounds) return;

        const groupId = `group-${nanoid(6)}`;
        const groupElement = withElementDefaults({
            id: groupId,
            type: 'group',
            parentId,
            name: 'Group',
            props: {
                x: bounds.x,
                y: bounds.y,
                width: bounds.width || 120,
                height: bounds.height || 120,
                fill: 'transparent',
                stroke: 'rgba(148,163,184,0.35)',
                strokeWidth: 1,
            },
        });

        let groupInserted = false;
        const updatedElements = [];

        frame.elements.forEach((element) => {
            if (selectedSet.has(element.id)) {
                if (!groupInserted) {
                    updatedElements.push(groupElement);
                    groupInserted = true;
                }
                const props = element.props ?? {};
                updatedElements.push({
                    ...element,
                    parentId: groupId,
                    props: {
                        ...props,
                        x: (props.x ?? 0) - bounds.x,
                        y: (props.y ?? 0) - bounds.y,
                    },
                });
            } else {
                updatedElements.push(element);
            }
        });

        let grouped = false;
        set({
            frames: state.frames.map((item) =>
                item.id === frame.id
                    ? (() => {
                          grouped = true;
                          return { ...item, elements: updatedElements };
                      })()
                    : item,
            ),
            selectedElementId: groupId,
            selectedElementIds: [groupId],
        });

        const latestFrame = get().frames.find((item) => item.id === frame.id);
        if (!latestFrame) return;
        if (parentId) {
            const parent = latestFrame.elements.find((element) => element.id === parentId && element.type === 'group');
            if (parent && parent.layoutMode && parent.layoutMode !== 'absolute') {
                get().reflowGroup(frame.id, parentId);
            }
        } else if (latestFrame.layoutMode && latestFrame.layoutMode !== 'absolute') {
            get().reflowFrame(frame.id);
        }
        if (grouped) {
            get().commitHistory('Group elements', 'user');
        }
    },

    ungroupElement: (frameId, groupId) => {
        const state = get();
        if (!frameId || !groupId) return;

        const frame = state.getFrameById(frameId);
        if (!frame) return;

        const group = frame.elements.find((element) => element.id === groupId && element.type === 'group');
        if (!group) return;

        const groupProps = group.props ?? {};
        const childElements = frame.elements.filter((element) => element.parentId === groupId);

        const updatedElements = [];
        frame.elements.forEach((element) => {
            if (element.id === groupId) return;

            if (element.parentId === groupId) {
                updatedElements.push({
                    ...element,
                    parentId: group.parentId ?? null,
                    props: {
                        ...element.props,
                        x: (element.props?.x ?? 0) + (groupProps.x ?? 0),
                        y: (element.props?.y ?? 0) + (groupProps.y ?? 0),
                    },
                });
            } else {
                updatedElements.push(element);
            }
        });

        let ungrouped = false;
        set({
            frames: state.frames.map((item) =>
                item.id === frame.id
                    ? (() => {
                          ungrouped = true;
                          return { ...item, elements: updatedElements };
                      })()
                    : item,
            ),
            selectedElementId: childElements[0]?.id ?? null,
            selectedElementIds: childElements.length ? [childElements[0].id] : [],
        });

        const latestFrame = get().frames.find((item) => item.id === frame.id);
        if (!latestFrame) return;
        const parentId = group.parentId ?? null;
        if (parentId) {
            const parent = latestFrame.elements.find((element) => element.id === parentId && element.type === 'group');
            if (parent && parent.layoutMode && parent.layoutMode !== 'absolute') {
                get().reflowGroup(frame.id, parentId);
            }
        } else if (latestFrame.layoutMode && latestFrame.layoutMode !== 'absolute') {
            get().reflowFrame(frame.id);
        }
        if (ungrouped) {
            get().commitHistory('Ungroup elements', 'user');
        }
    },

            liftElementOutOfGroup: (frameId, elementId) => {
                const state = get();
                const frame = state.getFrameById(frameId);
                if (!frame) return;
                const element = frame.elements.find((item) => item.id === elementId);
        if (!element || !element.parentId) return;
        const parent = frame.elements.find((item) => item.id === element.parentId);
        const parentProps = parent?.props ?? {};

        const siblings = frame.elements.filter((item) => item.parentId === element.parentId && item.id !== elementId);

        const updatedElements = frame.elements
            .map((item) => {
                if (item.id === elementId) {
                    return {
                        ...item,
                        parentId: parent?.parentId ?? null,
                        props: {
                            ...item.props,
                            x: (item.props?.x ?? 0) + (parentProps.x ?? 0),
                            y: (item.props?.y ?? 0) + (parentProps.y ?? 0),
                        },
                    };
                }
                return item;
            })
            .filter((item) => {
                if (parent && item.id === parent.id) {
                    return siblings.length > 0;
                }
                return true;
            });

        let lifted = false;
        set({
            frames: state.frames.map((item) =>
                item.id === frame.id
                    ? (() => {
                          lifted = true;
                          return { ...item, elements: updatedElements };
                      })()
                    : item,
            ),
            selectedElementIds: [elementId],
            selectedElementId: elementId,
        });

        const latestFrame = get().frames.find((item) => item.id === frame.id);
        if (!latestFrame) return;
        if (parent) {
            const updatedParent = latestFrame.elements.find((element) => element.id === parent.id);
            if (updatedParent && updatedParent.layoutMode && updatedParent.layoutMode !== 'absolute') {
                get().reflowGroup(frame.id, parent.id);
            }
            const ancestorId = parent.parentId ?? null;
            if (ancestorId) {
                const ancestor = latestFrame.elements.find(
                    (element) => element.id === ancestorId && element.type === 'group',
                );
                if (ancestor && ancestor.layoutMode && ancestor.layoutMode !== 'absolute') {
                    get().reflowGroup(frame.id, ancestor.id);
                }
            } else if (latestFrame.layoutMode && latestFrame.layoutMode !== 'absolute') {
                get().reflowFrame(frame.id);
            }
        } else if (latestFrame.layoutMode && latestFrame.layoutMode !== 'absolute') {
            get().reflowFrame(frame.id);
        }
        if (lifted) {
            get().commitHistory('Lift element from group', 'user');
        }
    },

            renameElement: (frameId, elementId, name) => {
                if (!frameId || !elementId) return;
                const trimmed = (name ?? '').trim();
                let renamed = false;
                set((state) => ({
                    frames: state.frames.map((frame) => {
                        if (frame.id !== frameId) return frame;
                        let changed = false;
                        const elements = frame.elements.map((element) => {
                            if (element.id !== elementId) return element;
                            const nextName = trimmed || getDefaultElementName(element.type);
                            if (element.name === nextName) return element;
                            changed = true;
                            return {
                                ...element,
                                name: nextName,
                            };
                        });
                        if (!changed) return frame;
                        renamed = true;
                        return {
                            ...frame,
                            elements,
                        };
                    }),
                }));
                if (renamed) {
                    get().commitHistory('Rename element', 'user');
                }
            },

    alignSelectedElements: (alignment) => {
        const state = get();
        const { selectedFrameId, selectedElementIds } = state;
        if (!selectedFrameId || selectedElementIds.length === 0) return;

        let aligned = false;
        set((currentState) => {
            const frame = currentState.frames.find((item) => item.id === selectedFrameId);
            if (!frame) return {};

            const selection = new Set(selectedElementIds);
            let changed = false;
            const updatedElements = frame.elements.map((element) => {
                if (!selection.has(element.id)) return element;
                const props = element.props ?? {};
                const width = Number.isFinite(props.width) ? props.width : 0;
                const height = Number.isFinite(props.height) ? props.height : 0;
                const updates = {};
                switch (alignment) {
                    case 'left':
                        updates.x = 0;
                        break;
                    case 'center':
                        updates.x = Number.isFinite(width) ? (frame.width - width) / 2 : props.x ?? 0;
                        break;
                    case 'right':
                        updates.x = Number.isFinite(width) ? frame.width - width : props.x ?? 0;
                        break;
                    case 'top':
                        updates.y = 0;
                        break;
                    case 'middle':
                        updates.y = Number.isFinite(height) ? (frame.height - height) / 2 : props.y ?? 0;
                        break;
                    case 'bottom':
                        updates.y = Number.isFinite(height) ? frame.height - height : props.y ?? 0;
                        break;
                    default:
                        break;
                }
                if (Object.keys(updates).length === 0) {
                    return element;
                }
                const nextProps = {
                    ...props,
                    ...updates,
                };
                const hasDiff = Object.keys(updates).some((key) => nextProps[key] !== props[key]);
                if (!hasDiff) {
                    return element;
                }
                changed = true;
                return {
                    ...element,
                    props: nextProps,
                };
            });

            if (!changed) return {};
            aligned = true;
            const updatedFrame = { ...frame, elements: updatedElements };
            return {
                frames: currentState.frames.map((item) =>
                    item.id === frame.id ? updatedFrame : item,
                ),
            };
        });
        if (aligned) {
            get().commitHistory(`Align elements (${alignment})`, 'user');
        }
    },

    distributeSelectedElements: (axis) => {
        const state = get();
        const { selectedFrameId, selectedElementIds } = state;
        if (!selectedFrameId || selectedElementIds.length < 3) return;

        let distributed = false;
        set((currentState) => {
            const frame = currentState.frames.find((item) => item.id === selectedFrameId);
            if (!frame) return {};

            const selection = frame.elements
                .filter((element) => selectedElementIds.includes(element.id))
                .filter((element) => {
                    const props = element.props ?? {};
                    return axis === 'horizontal'
                        ? Number.isFinite(props.width)
                        : Number.isFinite(props.height);
                });

            if (selection.length < 3) return {};

            const sorted = [...selection].sort((a, b) => {
                const aProps = a.props ?? {};
                const bProps = b.props ?? {};
                if (axis === 'horizontal') {
                    return (aProps.x ?? 0) - (bProps.x ?? 0);
                }
                return (aProps.y ?? 0) - (bProps.y ?? 0);
            });

            const firstProps = sorted[0]?.props ?? {};
            const lastProps = sorted[sorted.length - 1]?.props ?? {};
            const firstStart = axis === 'horizontal' ? firstProps.x ?? 0 : firstProps.y ?? 0;
            const lastEnd =
                axis === 'horizontal'
                    ? (lastProps.x ?? 0) + (lastProps.width ?? 0)
                    : (lastProps.y ?? 0) + (lastProps.height ?? 0);

            const totalSpan = lastEnd - firstStart;
            const totalSize = sorted.reduce((acc, element) => {
                const props = element.props ?? {};
                return acc + (axis === 'horizontal' ? props.width ?? 0 : props.height ?? 0);
            }, 0);
            const gap = (totalSpan - totalSize) / (sorted.length - 1);

            if (!Number.isFinite(gap)) return {};

            const firstWidth = axis === 'horizontal' ? firstProps.width ?? 0 : firstProps.height ?? 0;
            let cursor = firstStart + firstWidth + gap;
            const updates = new Map();
            sorted.forEach((element, index) => {
                const props = element.props ?? {};
                if (index === 0) {
                    return;
                }

                const targetPosition = cursor;
                const key = axis === 'horizontal' ? 'x' : 'y';
                const currentValue = props[key] ?? 0;
                if (currentValue !== targetPosition) {
                    updates.set(element.id, {
                        ...props,
                        [key]: targetPosition,
                    });
                }
                cursor += (axis === 'horizontal' ? props.width ?? 0 : props.height ?? 0) + gap;
            });

            if (updates.size === 0) return {};

            const updatedElements = frame.elements.map((element) => {
                if (!updates.has(element.id)) return element;
                return {
                    ...element,
                    props: {
                        ...element.props,
                        ...updates.get(element.id),
                    },
                };
            });

            const updatedFrame = { ...frame, elements: updatedElements };
            distributed = true;
            return {
                frames: currentState.frames.map((item) =>
                    item.id === frame.id ? updatedFrame : item,
                ),
            };
        });
        if (distributed) {
            get().commitHistory(`Distribute elements (${axis})`, 'user');
        }
    },
    selectElementsInRect: (frameId, rect, options = {}) => {
        const { additive = false } = options;
        if (!frameId || !rect) return;
        const state = get();
        const normalized = {
            x: rect.width >= 0 ? rect.x : rect.x + rect.width,
            y: rect.height >= 0 ? rect.y : rect.y + rect.height,
            width: Math.abs(rect.width ?? 0),
            height: Math.abs(rect.height ?? 0),
        };
        if (normalized.width === 0 && normalized.height === 0) return;

        const frame = state.frames.find((item) => item.id === frameId);
        if (!frame) return;

        const intersects = (elementRect, selectionRect) =>
            elementRect.x < selectionRect.x + selectionRect.width &&
            elementRect.x + elementRect.width > selectionRect.x &&
            elementRect.y < selectionRect.y + selectionRect.height &&
            elementRect.y + elementRect.height > selectionRect.y;

        const selectionIds = frame.elements
            .filter((element) => (element.parentId ?? null) === null)
            .filter((element) => {
                const props = element.props ?? {};
                const rectElement = {
                    x: props.x ?? 0,
                    y: props.y ?? 0,
                    width: Math.max(props.width ?? 0, 0),
                    height: Math.max(props.height ?? 0, 0),
                };
                return intersects(rectElement, normalized);
            })
            .map((element) => element.id);

        const baseSet = new Set(additive ? state.selectedElementIds : []);
        selectionIds.forEach((id) => baseSet.add(id));
        const selectedIds = Array.from(baseSet);
        const nextPrimary = selectedIds[0] ?? null;

        const selectionUnchanged =
            state.selectedFrameId === frameId &&
            state.selectedElementId === nextPrimary &&
            arraysEqual(state.selectedElementIds, selectedIds);
        if (selectionUnchanged) return;

        set({
            selectedFrameId: frameId,
            selectedElementId: nextPrimary,
            selectedElementIds: selectedIds,
        });
        get().commitHistory('Selection change', 'system');
    },

    setPrototypeMode: (value) =>
        set((state) => {
            const frames = state.frames ?? [];
            const fallbackFrameId = state.selectedFrameId ?? frames[0]?.id ?? null;
            return {
                prototypeMode: value,
                activePrototypeFrameId: value ? state.activePrototypeFrameId ?? fallbackFrameId : null,
                selectedTool: value ? 'pointer' : state.selectedTool,
            };
        }),

    setActivePrototypeFrameId: (frameId) => set({ activePrototypeFrameId: frameId }),

    addFrameLink: (fromFrameId, toFrameId) =>
        set((state) => {
            if (!fromFrameId || !toFrameId) return {};
            const existing = state.frameLinks.find((link) => link.from === fromFrameId);
            if (existing?.to === toFrameId) return {};
            const filtered = state.frameLinks.filter((link) => link.from !== fromFrameId);
            return {
                frameLinks: [...filtered, { id: `link-${nanoid(6)}`, from: fromFrameId, to: toFrameId }],
            };
        }),

    removeFrameLink: (fromFrameId, toFrameId = null) =>
        set((state) => ({
            frameLinks: state.frameLinks.filter((link) => {
                if (link.from !== fromFrameId) return true;
                if (toFrameId == null) return false;
                return link.to !== toFrameId;
            }),
        })),

    resetCanvas: () =>
        set({
            scale: 1,
            position: { x: 0, y: 0 },
            frames: [initialFrame],
            selectedFrameId: initialFrame.id,
            selectedElementId: null,
            selectedElementIds: [],
            selectedTool: 'pointer',
            prototypeMode: false,
            activePrototypeFrameId: initialFrame.id,
            frameLinks: [],
            activeGuides: [],
            autoLayoutPreview: null,
            activeToolOverlay: null,
            comments: [],
            timelineAssets: [],
        }),

    getFrameById: (id) => get().frames.find((frame) => frame.id === id),
    reorderElement: (frameId, elementId, targetIndex) => {
        if (!frameId || !elementId || targetIndex === undefined || targetIndex === null) return;

        const state = get();
        const frame = state.getFrameById(frameId);
        if (!frame) return;

        const element = frame.elements.find((item) => item.id === elementId);
        if (!element) return;

        const parentId = element.parentId ?? null;
        const siblings = frame.elements.filter((item) => (item.parentId ?? null) === parentId);
        if (siblings.length <= 1) return;

        const existingIndex = siblings.findIndex((item) => item.id === elementId);
        const maxIndex = siblings.length - 1;
        const clampedIndex = Math.max(0, Math.min(targetIndex, maxIndex));
        if (existingIndex === clampedIndex) return;

        const siblingOrder = siblings
            .map((item) => item.id)
            .filter((id) => id !== elementId);
        siblingOrder.splice(clampedIndex, 0, elementId);

        const siblingLookup = new Map();
        frame.elements.forEach((item) => {
            if ((item.parentId ?? null) === parentId) {
                siblingLookup.set(item.id, item);
            }
        });

        const reorderedMap = new Map();
        siblingOrder.forEach((id, orderIndex) => {
            const original = siblingLookup.get(id);
            if (!original) return;
            reorderedMap.set(id, {
                ...original,
                layout: {
                    ...original.layout,
                    order: orderIndex,
                },
            });
        });

        set((currentState) => ({
            frames: currentState.frames.map((item) => {
                if (item.id !== frameId) return item;
                let siblingPointer = 0;
                const elements = item.elements.map((elementItem) => {
                    if ((elementItem.parentId ?? null) !== parentId) {
                        return elementItem;
                    }
                    const nextId = siblingOrder[siblingPointer++];
                    const updated = reorderedMap.get(nextId);
                    return updated ?? elementItem;
                });
                return {
                    ...item,
                    elements,
                };
            }),
        }));

        if (parentId) {
            get().reflowGroup(frameId, parentId);
            const parentElement = get().getElementById(frameId, parentId);
            if (parentElement?.parentId) {
                get().reflowGroup(frameId, parentElement.parentId);
            }
        } else {
            get().reflowFrame(frameId);
        }
    },
    exportFrameCode: (frameId, options = {}) => {
        const frame = get().getFrameById(frameId);
        if (!frame) return null;
        return generateFrameExport(frame, options);
    },
    exportAllFramesCode: (options = {}) => {
        const frames = get().frames ?? [];
        return frames.map((frame) => generateFrameExport(frame, options)).filter(Boolean);
    },
    getElementById: (frameId, elementId) => {
        const frame = get().getFrameById(frameId);
        if (!frame) return null;
        return frame.elements.find((element) => element.id === elementId) ?? null;
    },
    getLinkedFrames: (frameId) => get().frameLinks.filter((link) => link.from === frameId),
    addComment: ({ frameId, elementId = null, text }) => {
        if (!frameId || !text) return;
        set((state) => ({
            comments: [
                ...state.comments,
                {
                    id: `comment-${nanoid(6)}`,
                    frameId,
                    elementId,
                    text,
                    createdAt: new Date().toISOString(),
                },
            ],
        }));
    },
    removeComment: (commentId) =>
        set((state) => ({
            comments: state.comments.filter((comment) => comment.id !== commentId),
        })),
    pushTimelineAction: (action) =>
        set((state) => ({
            timelineActions: [...state.timelineActions.slice(-49), action],
        })),
    undoTimelineAction: () => {
        const state = get();
        const actions = [...state.timelineActions];
        const last = actions.pop();
        if (!last) return null;
        set((prevState) => {
            let timelineAssets = prevState.timelineAssets;
            switch (last.type) {
                case 'add':
                    timelineAssets = prevState.timelineAssets.filter((asset) => asset.id !== last.assetId);
                    break;
                case 'remove':
                    if (last.before) {
                        timelineAssets = [...prevState.timelineAssets, last.before];
                    }
                    break;
                case 'update':
                    if (last.before) {
                        timelineAssets = prevState.timelineAssets.map((asset) =>
                            asset.id === last.assetId ? last.before : asset,
                        );
                    }
                    break;
                default:
                    break;
            }
            return {
                timelineAssets,
                timelineActions: actions,
            };
        });
        return last;
    },
    clearTimelineHistory: () => set({ timelineActions: [] }),
    commitTimelineAssetChange: (assetId, previousState) => {
        const current = get().timelineAssets.find((asset) => asset.id === assetId);
        if (!current || !previousState) return;
        get().pushTimelineAction({
            id: `ta-${nanoid(6)}`,
            type: 'update',
            assetId,
            frameId: current.frameId,
            before: { ...previousState, waveform: previousState.waveform ? [...previousState.waveform] : null },
            after: { ...current, waveform: current.waveform ? [...current.waveform] : null },
            timestamp: new Date().toISOString(),
        });
    },
    addTimelineAsset: ({
        frameId,
        label,
        type,
        duration,
        offset = 0,
        thumbnailUrl = null,
        waveform = null,
        historyLabel,
        skipHistory = false,
        source = 'user',
    }) => {
        if (!frameId || !label) return;
        const normalizedWaveform = Array.isArray(waveform)
            ? waveform.filter((value) => Number.isFinite(value))
            : typeof waveform === 'string'
                ? waveform
                      .split(',')
                      .map((value) => Number(value.trim()))
                      .filter((value) => Number.isFinite(value))
                : null;
        const newAsset = {
            id: `asset-${nanoid(6)}`,
            frameId,
            label,
            type: type ?? 'clip',
            duration: duration ?? 5,
            offset: Math.max(0, offset ?? 0),
            thumbnailUrl: thumbnailUrl ?? null,
            waveform: normalizedWaveform,
            createdAt: new Date().toISOString(),
        };
        set((state) => ({
            timelineAssets: [...state.timelineAssets, newAsset],
        }));
        get().pushTimelineAction({
            id: `ta-${nanoid(6)}`,
            type: 'add',
            assetId: newAsset.id,
            frameId,
            before: null,
            after: { ...newAsset, waveform: newAsset.waveform ? [...newAsset.waveform] : null },
            timestamp: new Date().toISOString(),
        });
        if (!skipHistory) {
            const assetLabel = (label ?? '').trim() || type || 'asset';
            get().commitHistory(historyLabel ?? `Add timeline asset "${assetLabel}"`, source);
        }
    },
    removeTimelineAsset: (assetId, options = {}) => {
        const {
            historyLabel,
            skipHistory = false,
            source = 'user',
        } = options;
        const existing = get().timelineAssets.find((asset) => asset.id === assetId);
        if (!existing) return;
        set((state) => ({
            timelineAssets: state.timelineAssets.filter((asset) => asset.id !== assetId),
        }));
        get().pushTimelineAction({
            id: `ta-${nanoid(6)}`,
            type: 'remove',
            assetId,
            frameId: existing.frameId,
            before: { ...existing, waveform: existing.waveform ? [...existing.waveform] : null },
            after: null,
            timestamp: new Date().toISOString(),
        });
        if (!skipHistory) {
            const assetLabel = existing.label ?? existing.type ?? 'asset';
            get().commitHistory(historyLabel ?? `Remove timeline asset "${assetLabel}"`, source);
        }
    },
    updateTimelineAsset: (assetId, updates, options = {}) => {
        const {
            log = true,
            previousState = null,
            historyLabel,
            skipHistory = false,
            source = 'user',
        } = options;
        let before = null;
        let after = null;
        let didChange = false;
        set((state) => {
            let localChanged = false;
            const timelineAssets = state.timelineAssets.map((asset) => {
                if (asset.id !== assetId) return asset;
                before = { ...asset, waveform: asset.waveform ? [...asset.waveform] : null };
                let nextDuration = asset.duration;
                let nextOffset = asset.offset;
                let nextThumbnail = asset.thumbnailUrl;
                let nextWaveform = asset.waveform ? [...asset.waveform] : null;

                if (updates.duration !== undefined) {
                    nextDuration = Math.max(0.1, updates.duration);
                }
                if (updates.offset !== undefined) {
                    nextOffset = Math.max(0, updates.offset);
                }
                if (updates.thumbnailUrl !== undefined) {
                    nextThumbnail = updates.thumbnailUrl;
                }
                if (updates.waveform !== undefined) {
                    nextWaveform = Array.isArray(updates.waveform)
                        ? updates.waveform.filter((value) => Number.isFinite(value))
                        : typeof updates.waveform === 'string'
                            ? updates.waveform
                                  .split(',')
                                  .map((value) => Number(value.trim()))
                                  .filter((value) => Number.isFinite(value))
                            : null;
                }

                const waveformChanged =
                    JSON.stringify(nextWaveform ?? null) !== JSON.stringify((asset.waveform ?? null));

                if (
                    nextDuration !== asset.duration ||
                    nextOffset !== asset.offset ||
                    nextThumbnail !== asset.thumbnailUrl ||
                    waveformChanged
                ) {
                    localChanged = true;
                    after = {
                        ...asset,
                        duration: nextDuration,
                        offset: nextOffset,
                        thumbnailUrl: nextThumbnail,
                        waveform: nextWaveform,
                    };
                    return after;
                }

                after = asset;
                return asset;
            });
            if (!localChanged) {
                before = before ? before : null;
                after = after ? after : null;
                return {};
            }
            didChange = true;
            return { timelineAssets };
        });
        if (log && before && after && (previousState || didChange)) {
            get().pushTimelineAction({
                id: `ta-${nanoid(6)}`,
                type: 'update',
                assetId,
                frameId: before.frameId,
                before: previousState
                    ? { ...previousState, waveform: previousState.waveform ? [...previousState.waveform] : null }
                    : { ...before, waveform: before.waveform ? [...before.waveform] : null },
                after: { ...after, waveform: after.waveform ? [...after.waveform] : null },
                timestamp: new Date().toISOString(),
            });
        }
        if (didChange && !skipHistory && after) {
            const assetLabel = after.label ?? before?.label ?? after.type ?? 'asset';
            get().commitHistory(historyLabel ?? `Update timeline asset "${assetLabel}"`, source);
        }
    },
    playTimeline: (frameId = null) => {
        const state = get();
        const targetFrameId =
            frameId ?? state.selectedFrameId ?? state.timelinePlayback.frameId ?? state.frames[0]?.id ?? null;
        if (!targetFrameId) return;
        const frame = state.frames.find((item) => item.id === targetFrameId);
        if (!frame) return;
        const duration = Math.max(frame.timelineDuration ?? state.timelinePlayback.duration ?? 20, 0.1);
        const shouldReset = state.timelinePlayback.frameId !== frame.id;
        set((prev) => ({
            timelinePlayback: {
                ...prev.timelinePlayback,
                frameId: frame.id,
                isPlaying: true,
                duration,
                playhead: shouldReset
                    ? 0
                    : Math.min(prev.timelinePlayback.playhead ?? 0, duration),
                lastTick: getNow(),
            },
        }));
    },
    pauseTimeline: () =>
        set((state) => ({
            timelinePlayback: {
                ...state.timelinePlayback,
                isPlaying: false,
                lastTick: null,
            },
        })),
    stopTimeline: () =>
        set((state) => ({
            timelinePlayback: {
                ...state.timelinePlayback,
                isPlaying: false,
                playhead: 0,
                lastTick: null,
            },
        })),
    setTimelineLoop: (loop) =>
        set((state) => ({
            timelinePlayback: {
                ...state.timelinePlayback,
                loop: typeof loop === 'boolean' ? loop : !state.timelinePlayback.loop,
            },
        })),
    setTimelineSpeed: (speed) =>
        set((state) => ({
            timelinePlayback: {
                ...state.timelinePlayback,
                speed: Number.isFinite(speed) ? Math.max(0, speed) : state.timelinePlayback.speed,
            },
        })),
    setTimelinePlayhead: (frameId = null, playhead = 0, options = {}) => {
        const state = get();
        const targetFrameId =
            frameId ?? state.timelinePlayback.frameId ?? state.selectedFrameId ?? state.frames[0]?.id ?? null;
        if (!targetFrameId) return;
        const frame = state.frames.find((item) => item.id === targetFrameId);
        if (!frame) return;
        const duration = Math.max(frame.timelineDuration ?? state.timelinePlayback.duration ?? 20, 0.1);
        const clamped = Math.min(Math.max(Number(playhead) || 0, 0), duration);
        set((prev) => ({
            timelinePlayback: {
                ...prev.timelinePlayback,
                frameId: targetFrameId,
                playhead: clamped,
                duration,
                lastTick: options.resetTick ? getNow() : prev.timelinePlayback.lastTick,
            },
        }));
    },
    stepTimelinePlayback: () => {
        const state = get();
        const playback = state.timelinePlayback;
        if (!playback.isPlaying || !playback.frameId) return null;
        const frame = state.frames.find((item) => item.id === playback.frameId);
        if (!frame) return null;
        const duration = Math.max(frame.timelineDuration ?? playback.duration ?? 20, 0.1);
        const now = getNow();
        const lastTick = playback.lastTick ?? now;
        const speed = Math.max(playback.speed ?? 1, 0);
        const deltaSeconds = speed * Math.max((now - lastTick) / 1000, 0);
        if (deltaSeconds <= 0) {
            set({
                timelinePlayback: {
                    ...playback,
                    duration,
                    lastTick: now,
                },
            });
            return { playhead: playback.playhead, duration, playing: playback.isPlaying };
        }
        let next = playback.playhead + deltaSeconds;
        let isPlaying = playback.isPlaying;
        if (next >= duration) {
            if (playback.loop) {
                next = next % duration;
            } else {
                next = duration;
                isPlaying = false;
            }
        }
        set({
            timelinePlayback: {
                ...playback,
                playhead: next,
                duration,
                isPlaying,
                lastTick: now,
            },
        });
        return { playhead: next, duration, playing: isPlaying };
    },
    jumpTimelineToAsset: (assetId) => {
        const state = get();
        const asset = state.timelineAssets.find((item) => item.id === assetId);
        if (!asset) return;
        get().setTimelinePlayhead(asset.frameId, asset.offset ?? 0, { resetTick: true });
    },
    addAssetToLibrary: (asset, options = {}) => {
        if (!asset) return null;
        const prepared = {
            id: asset.id ?? `asset-${nanoid(6)}`,
            label: asset.label ?? 'Library asset',
            source: asset.source ?? 'user',
            category: asset.category ?? 'custom',
            status: asset.status ?? 'ready',
            type: asset.type ?? 'element',
            elementType: asset.elementType ?? (asset.type === 'timeline' ? null : 'rect'),
            timelineType: asset.timelineType ?? null,
            props: asset.props ? { ...asset.props } : undefined,
            children: Array.isArray(asset.children)
                ? asset.children.map((child) => ({
                      ...child,
                      props: child.props ? { ...child.props } : undefined,
                  }))
                : undefined,
            preview: asset.preview ? { ...asset.preview } : undefined,
            metadata: asset.metadata ? { ...asset.metadata } : {},
            duration: asset.duration ?? undefined,
            offset: asset.offset ?? 0,
            waveform: Array.isArray(asset.waveform) ? [...asset.waveform] : null,
            favorite: Boolean(asset.favorite),
            createdAt: asset.createdAt ?? new Date().toISOString(),
        };
        set((state) => {
            const filtered = state.assetLibrary.filter((existing) => existing.id !== prepared.id);
            return {
                assetLibrary: [prepared, ...filtered],
            };
        });
        if (!options.skipUsageMark) {
            get().markAssetUsed(prepared.id);
        }
        return prepared.id;
    },
    updateAssetMetadata: (assetId, updates = {}) => {
        if (!assetId || !updates) return;
        set((state) => ({
            assetLibrary: state.assetLibrary.map((asset) => {
                if (asset.id !== assetId) return asset;
                const next = { ...asset, ...updates };
                if (updates.props) {
                    next.props = { ...(asset.props ?? {}), ...updates.props };
                }
                if (updates.children) {
                    next.children = Array.isArray(updates.children)
                        ? updates.children.map((child) => ({
                              ...child,
                              props: child.props ? { ...child.props } : undefined,
                          }))
                        : undefined;
                }
                if (updates.preview) {
                    next.preview = { ...updates.preview };
                }
                if (updates.metadata) {
                    next.metadata = { ...(asset.metadata ?? {}), ...updates.metadata };
                }
                if (updates.waveform) {
                    next.waveform = Array.isArray(updates.waveform) ? [...updates.waveform] : null;
                }
                return next;
            }),
        }));
    },
    toggleAssetFavorite: (assetId) => {
        if (!assetId) return;
        set((state) => ({
            assetLibrary: state.assetLibrary.map((asset) =>
                asset.id === assetId ? { ...asset, favorite: !asset.favorite } : asset,
            ),
        }));
    },
    markAssetUsed: (assetId) => {
        if (!assetId) return;
        const timestamp = new Date().toISOString();
        set((state) => ({
            assetLibrary: state.assetLibrary.map((asset) =>
                asset.id === assetId
                    ? {
                          ...asset,
                          metadata: { ...(asset.metadata ?? {}), lastUsedAt: timestamp },
                      }
                    : asset,
            ),
        }));
    },
    addCollaborator: (input) => {
        const value = typeof input === 'string' ? input.trim() : '';
        if (!value) return null;
        const id = `collab-${nanoid(6)}`;
        const color = pickCollaboratorColor(value);
        let added = null;
        set((state) => {
            const exists = state.collaborators.some(
                (collaborator) =>
                    collaborator.name.toLowerCase() === value.toLowerCase() && !collaborator.isMe,
            );
            if (exists) return {};
            const entry = {
                id,
                name: value,
                color,
                presence: 'invited',
                lastActiveAt: Date.now(),
            };
            added = entry;
            return {
                collaborators: [...state.collaborators, entry],
            };
        });
        return added;
    },
    removeCollaborator: (id) => {
        if (!id) return;
        set((state) => ({
            collaborators: state.collaborators.filter(
                (collaborator) => collaborator.id === 'collab-local' || collaborator.id !== id,
            ),
        }));
    },
    updateCollaboratorPresence: (id, patch = {}) => {
        if (!id) return;
        set((state) => ({
            collaborators: state.collaborators.map((collaborator) =>
                collaborator.id === id
                    ? {
                          ...collaborator,
                          ...patch,
                          lastActiveAt: patch.lastActiveAt ?? Date.now(),
                      }
                    : collaborator,
            ),
        }));
    },
    uploadAssetToLibrary: ({ name, dataUrl, mime, duration }) => {
        if (!dataUrl) return null;
        const trimmedName = name?.trim();
        const isAudio = mime?.startsWith('audio');
        const isVideo = mime?.startsWith('video');
        const assetType = isAudio || isVideo ? 'timeline' : 'element';
        const timelineType = isAudio ? 'audio' : isVideo ? 'clip' : null;
        const elementType = assetType === 'element' ? 'image' : null;
        const assetId = get().addAssetToLibrary(
            {
                id: `asset-upload-${nanoid(6)}`,
                label: trimmedName || (isAudio ? 'Uploaded audio' : 'Uploaded visual'),
                source: 'upload',
                category: isAudio ? 'audio' : isVideo ? 'video' : 'uploads',
                status: 'ready',
                type: assetType,
                elementType,
                timelineType,
                props:
                    assetType === 'element'
                        ? {
                              width: 480,
                              height: 360,
                              imageUrl: dataUrl,
                              opacity: 1,
                          }
                        : undefined,
                preview:
                    assetType === 'element'
                        ? { kind: 'image', value: dataUrl }
                        : { kind: 'icon', value: timelineType ?? 'clip' },
                duration: assetType === 'timeline' ? Number(duration) || (isAudio ? 12 : 6) : undefined,
            },
            { skipUsageMark: true },
        );
        return assetId;
    },
    generateAiAsset: ({ prompt = '', kind = 'image' } = {}) => {
        const definition = buildAiAssetDefinition(kind, prompt);
        const tempId = `asset-ai-${nanoid(6)}`;
        const pending = {
            ...definition,
            id: tempId,
            source: 'ai',
            category: 'ai',
            status: 'generating',
            metadata: {
                ...(definition.metadata ?? {}),
                aiPrompt: prompt,
                requestedAt: new Date().toISOString(),
            },
        };
        set((state) => ({
            assetLibrary: [pending, ...state.assetLibrary],
        }));
        const delay = 900 + Math.round(Math.random() * 900);
        setTimeout(() => {
            const finalDefinition = buildAiAssetDefinition(kind, `${prompt}`.trim());
            set((state) => ({
                assetLibrary: state.assetLibrary.map((asset) =>
                    asset.id === tempId
                        ? {
                              ...asset,
                              ...finalDefinition,
                              status: 'ready',
                              metadata: {
                                  ...(asset.metadata ?? {}),
                                  ...(finalDefinition.metadata ?? {}),
                                  generatedAt: new Date().toISOString(),
                              },
                          }
                        : asset,
                ),
            }));
        }, delay);
        return tempId;
    },
    removeAssetFromLibrary: (assetId) => {
        if (!assetId) return;
        set((state) => ({
            assetLibrary: state.assetLibrary.filter((asset) => asset.id !== assetId),
        }));
    },
    addGradientPreset: (preset) => {
        if (!preset || !preset.id) return;
        const prepared = {
            ...preset,
            source: preset.source ?? 'ai',
            createdAt: preset.createdAt ?? new Date().toISOString(),
        };
        set((state) => {
            const filtered = state.gradientLibrary.filter((item) => item.id !== prepared.id);
            return {
                gradientLibrary: [prepared, ...filtered].slice(0, 32),
            };
        });
    },
    removeGradientPreset: (id) => {
        if (!id) return;
        set((state) => ({
            gradientLibrary: state.gradientLibrary.filter((item) => item.id !== id),
        }));
    },
    placeAssetOnFrame: (assetId, frameId = null, options = {}) => {
        const state = get();
        const asset = state.assetLibrary.find((item) => item.id === assetId);
        if (!asset) return null;
        const targetFrameId =
            frameId ?? state.selectedFrameId ?? state.frames[0]?.id ?? null;
        if (!targetFrameId) return null;
        const frame = state.frames.find((item) => item.id === targetFrameId);
        if (!frame) return null;

        if (asset.type === 'timeline') {
            return get().placeAssetOnTimeline(assetId, targetFrameId, options);
        }

        const baseWidth = asset.props?.width ?? (asset.children?.[0]?.props?.width ?? 320);
        const baseHeight = asset.props?.height ?? (asset.children?.[0]?.props?.height ?? 240);
        const centroid = computeCenteredPosition(frame, baseWidth, baseHeight);
        const originX = options.position?.x ?? centroid.x;
        const originY = options.position?.y ?? centroid.y;

        if (asset.type === 'element' && asset.elementType === 'group' && Array.isArray(asset.children)) {
            const groupId = `asset-group-${nanoid(6)}`;
            const groupProps = {
                ...(asset.props ?? {}),
                x: originX,
                y: originY,
            };
            get().addElementToFrame(
                frame.id,
                {
                    id: groupId,
                    type: 'group',
                    name: asset.label,
                    props: groupProps,
                },
                null,
                { skipHistory: true, source: 'asset-library' },
            );
            asset.children.forEach((child) => {
                const childId = `asset-child-${nanoid(6)}`;
                const childProps = {
                    ...(child.props ?? {}),
                    x: originX + (child.props?.x ?? 0),
                    y: originY + (child.props?.y ?? 0),
                };
                get().addElementToFrame(
                    frame.id,
                    {
                        id: childId,
                        type: child.type ?? 'rect',
                        name: child.name ?? asset.label,
                        props: childProps,
                    },
                    groupId,
                    { skipHistory: true, source: 'asset-library' },
                );
            });
            get().commitHistory(`Insert "${asset.label}"`, 'asset-library');
            get().markAssetUsed(assetId);
            return groupId;
        }

        if (asset.type === 'element') {
            const elementId = `asset-el-${nanoid(6)}`;
            const elementProps = {
                ...(asset.props ?? {}),
                x: originX,
                y: originY,
            };
            get().addElementToFrame(
                frame.id,
                {
                    id: elementId,
                    type: asset.elementType ?? 'rect',
                    name: asset.label,
                    props: elementProps,
                },
                null,
                { skipHistory: true, source: 'asset-library' },
            );
            get().commitHistory(`Insert "${asset.label}"`, 'asset-library');
            get().markAssetUsed(assetId);
            return elementId;
        }
        return null;
    },
    placeAssetOnTimeline: (assetId, frameId = null, options = {}) => {
        const state = get();
        const asset = state.assetLibrary.find((item) => item.id === assetId);
        if (!asset) return null;
        const targetFrameId =
            frameId ?? state.selectedFrameId ?? state.timelinePlayback.frameId ?? state.frames[0]?.id ?? null;
        if (!targetFrameId) return null;
        const frame = state.frames.find((item) => item.id === targetFrameId);
        if (!frame) return null;
        if (asset.type !== 'timeline') {
            return get().placeAssetOnFrame(assetId, targetFrameId, options);
        }
        const duration = Math.max(Number(options.duration ?? asset.duration ?? 4) || 4, 0.25);
        const offset = Math.max(Number(options.offset ?? asset.offset ?? 0) || 0, 0);
        get().addTimelineAsset({
            frameId: frame.id,
            label: asset.label ?? 'Timeline asset',
            type: asset.timelineType ?? 'clip',
            duration,
            offset,
            thumbnailUrl: asset.preview?.kind === 'image' ? asset.preview.value : asset.props?.imageUrl ?? null,
            waveform: asset.waveform ?? null,
            historyLabel: `Timeline: Insert "${asset.label ?? 'asset'}"`,
            source: 'asset-library',
        });
        get().markAssetUsed(assetId);
        const modeConfig = MODE_ASSETS[state.mode] ?? {};
        if (modeConfig.heavy) {
            set({ isSceneHydrating: true });
            setTimeout(() => {
                const storeAfter = get();
                if (storeAfter.isSceneHydrating) {
                    storeAfter.finishSceneHydration();
                }
            }, 240);
        }
        return `${asset.label ?? 'asset'}`;
    },
    chainFrames: (frameIds) => {
        const uniqueIds = Array.from(new Set(Array.isArray(frameIds) ? frameIds : [])).filter(Boolean);
        if (uniqueIds.length < 2) return;

        set((state) => {
            const filteredLinks = state.frameLinks.filter((link) => !uniqueIds.includes(link.from));
            const generatedLinks = uniqueIds.slice(0, -1).map((fromId, index) => ({
                id: `link-${nanoid(6)}`,
                from: fromId,
                to: uniqueIds[index + 1],
            }));
            return {
                frameLinks: [...filteredLinks, ...generatedLinks],
            };
        });
    },
    setContextMenu: (contextMenu) => set({ contextMenu }),
    closeContextMenu: () => set({ contextMenu: null }),
    copyElement: (frameId, elementId) => {
        const frame = get().getFrameById(frameId);
        if (!frame) return;
        const element = frame.elements.find((item) => item.id === elementId);
        if (!element) return;
        const elementCopy = {
            ...element,
            props: { ...element.props },
            id: undefined,
            parentId: null,
        };
        set({
            clipboard: {
                type: 'element',
                frameId,
                element: elementCopy,
            },
        });
    },
    duplicateElement: (frameId, elementId) => {
        const state = get();
        const frame = state.getFrameById(frameId);
        if (!frame) return;
        const element = frame.elements.find((item) => item.id === elementId);
        if (!element) return;
        const nextProps = {
            ...element.props,
            x: (element.props?.x ?? 0) + 32,
            y: (element.props?.y ?? 0) + 32,
        };
        const newElement = {
            ...element,
            id: `el-${nanoid(6)}`,
            name: `${element.name ?? getDefaultElementName(element.type)} Copy`,
            parentId: null,
            props: nextProps,
        };
        set({
            frames: state.frames.map((item) =>
                item.id === frameId ? { ...item, elements: [...item.elements, newElement] } : item,
            ),
            selectedElementId: newElement.id,
            selectedElementIds: [newElement.id],
        });
        const elementLabel = element.name ?? getDefaultElementName(element.type);
        get().commitHistory(`Duplicate element "${elementLabel}"`, 'user');
    },
    duplicateSelectedElements: () => {
        const state = get();
        const { selectedFrameId, selectedElementIds } = state;
        if (!selectedFrameId || selectedElementIds.length === 0) return;
        const frame = state.getFrameById(selectedFrameId);
        if (!frame) return;

        const selectedSet = new Set(selectedElementIds);
        const parentsToReflow = new Set();
        const newIds = [];

        const nextElements = frame.elements.reduce((acc, element) => {
            acc.push(element);
            if (!selectedSet.has(element.id)) {
                return acc;
            }
            const props = element.props ?? {};
            const parent = element.parentId
                ? frame.elements.find((item) => item.id === element.parentId)
                : null;
            const parentLayoutMode = parent?.layoutMode ?? frame.layoutMode ?? 'absolute';
            const isAutoLayoutParent =
                parentLayoutMode && parentLayoutMode !== 'absolute';

            if (isAutoLayoutParent) {
                parentsToReflow.add(parent ? parent.id : '__frame__');
            }

            const offsetAmount = isAutoLayoutParent ? 0 : element.parentId ? 12 : 32;
            const newElement = {
                ...element,
                id: `el-${nanoid(6)}`,
                name: `${element.name ?? getDefaultElementName(element.type)} Copy`,
                props: {
                    ...props,
                    x: (props.x ?? 0) + offsetAmount,
                    y: (props.y ?? 0) + offsetAmount,
                },
            };
            newIds.push(newElement.id);
            acc.push(newElement);
            return acc;
        }, []);

        if (newIds.length === 0) return;

        set({
            frames: state.frames.map((item) =>
                item.id === selectedFrameId ? { ...item, elements: nextElements } : item,
            ),
            selectedElementId: newIds[0],
            selectedElementIds: newIds,
        });

        parentsToReflow.forEach((parentKey) => {
            if (parentKey === '__frame__') {
                const latest = get().getFrameById(selectedFrameId);
                if (latest && latest.layoutMode && latest.layoutMode !== 'absolute') {
                    get().reflowFrame(selectedFrameId);
                }
            } else if (parentKey) {
                get().reflowGroup(selectedFrameId, parentKey);
            }
        });

        get().commitHistory(
            newIds.length > 1 ? 'Duplicate selection' : 'Duplicate element',
            'user',
        );
    },
    pasteElement: (targetFrameId = null, position = null) => {
        const state = get();
        const { clipboard } = state;
        if (!clipboard || clipboard.type !== 'element') return;

        const frameId = targetFrameId ?? clipboard.frameId ?? state.selectedFrameId ?? state.frames[0]?.id;
        if (!frameId) return;

        const frame = state.getFrameById(frameId);
        if (!frame) return;

        const baseElement = clipboard.element;
        const baseProps = baseElement.props ?? {};
        const newElement = {
            ...baseElement,
            id: `el-${nanoid(6)}`,
            name: `${baseElement.name ?? getDefaultElementName(baseElement.type)} Copy`,
            parentId: null,
            props: {
                ...baseElement.props,
                x:
                    position?.x !== null && position?.x !== undefined
                        ? position.x - frame.x
                        : (baseProps.x ?? 0) + 40,
                y:
                    position?.y !== null && position?.y !== undefined
                        ? position.y - frame.y
                        : (baseProps.y ?? 0) + 40,
            },
        };

        set({
            frames: state.frames.map((item) =>
                item.id === frameId ? { ...item, elements: [...item.elements, newElement] } : item,
            ),
            selectedFrameId: frameId,
            selectedElementId: newElement.id,
            selectedElementIds: [newElement.id],
        });
        const elementLabel = newElement.name ?? getDefaultElementName(newElement.type);
        get().commitHistory(`Paste element "${elementLabel}"`, 'user');
    },
    copyFrame: (frameId) => {
        const frame = get().getFrameById(frameId);
        if (!frame) return;
        const frameCopy = {
            ...frame,
            id: undefined,
            elements: frame.elements.map((element) => ({
                ...element,
                id: undefined,
                props: { ...element.props },
            })),
        };
        set({
            clipboard: {
                type: 'frame',
                frame: frameCopy,
            },
        });
    },
    duplicateFrame: (frameId) => {
        const state = get();
        const frame = state.getFrameById(frameId);
        if (!frame) return;
        const newFrame = {
            ...frame,
            id: `frame-${nanoid(6)}`,
            name: `${frame.name ?? 'Frame'} Copy`,
            x: frame.x + 80,
            y: frame.y + 80,
            elements: frame.elements.map((element) => ({
                ...element,
                id: `el-${nanoid(6)}`,
                props: {
                    ...element.props,
                },
            })),
        };
        set({
            frames: [...state.frames, newFrame],
            selectedFrameId: newFrame.id,
            selectedElementIds: [],
            selectedElementId: null,
        });
        const frameLabel = frame.name ?? 'Frame';
        get().commitHistory(`Duplicate frame "${frameLabel}"`, 'user');
    },
    pasteFrame: (position = null) => {
        const state = get();
        const { clipboard } = state;
        if (!clipboard || clipboard.type !== 'frame') return;
        const baseFrame = clipboard.frame;
        const newFrameId = `frame-${nanoid(6)}`;
        const newFrame = {
            ...baseFrame,
            id: newFrameId,
            name: `${baseFrame.name ?? 'Frame'} Copy`,
            x: position?.x ?? (baseFrame.x ?? 0) + 120,
            y: position?.y ?? (baseFrame.y ?? 0) + 120,
            elements: (baseFrame.elements ?? []).map((element) => ({
                ...element,
                id: `el-${nanoid(6)}`,
                props: {
                    ...element.props,
                },
            })),
        };
        set({
            frames: [...state.frames, newFrame],
            selectedFrameId: newFrameId,
            selectedElementIds: [],
            selectedElementId: null,
        });
        const frameLabel = newFrame.name ?? 'Frame';
        get().commitHistory(`Paste frame "${frameLabel}"`, 'user');
    },
        }),
        {
            name: 'dropple-canvas-state',
            version: 1,
            storage: createJSONStorage(() => safeStorage),
            partialize: (state) => ({
                mode: state.mode,
                scale: state.scale,
                position: state.position,
                frames: state.frames,
                selectedFrameId: state.selectedFrameId,
                selectedElementIds: state.selectedElementIds,
                selectedTool: state.selectedTool,
                prototypeMode: state.prototypeMode,
                activePrototypeFrameId: state.activePrototypeFrameId,
                gridVisible: state.gridVisible,
                gridSize: state.gridSize,
                collaborators: state.collaborators,
                lastAutosaveAt: state.lastAutosaveAt,
            }),
    },
),
);

configureHistory(() => {
    const state = useCanvasStore.getState();
    return {
        frames: JSON.parse(JSON.stringify(state.frames)),
        selection: {
            frameId: state.selectedFrameId,
            elementIds: [...state.selectedElementIds],
        },
        timelineAssets: JSON.parse(JSON.stringify(state.timelineAssets ?? [])),
        timelineActions: JSON.parse(JSON.stringify(state.timelineActions ?? [])),
    };
});

useCanvasStore.getState().commitHistory('Initial state', 'system');
