'use client';

import { performElementTool, performFrameTool } from '../fabric/canvasApi';

const BASE_TOOL_BEHAVIORS = {
    pointer: { type: 'pointer' },
    frame: { type: 'frame', width: 960, height: 640, perform: performFrameTool },
    canvas: { type: 'frame', width: 1280, height: 720, perform: performFrameTool },
    scene: { type: 'frame', width: 1280, height: 720, perform: performFrameTool },
    segment: { type: 'frame', width: 960, height: 320, perform: performFrameTool },
    shape: { type: 'element', elementType: 'rect', perform: performElementTool },
    rect: { type: 'element', elementType: 'rect', perform: performElementTool },
    overlay: { type: 'element', elementType: 'rect', perform: performElementTool },
    clip: { type: 'element', elementType: 'rect', perform: performElementTool },
    text: { type: 'element', elementType: 'text', perform: performElementTool },
    script: { type: 'element', elementType: 'text', perform: performElementTool },
    image: { type: 'element', elementType: 'image', perform: performElementTool },
    component: { type: 'element', elementType: 'rect', perform: performElementTool },
    character: { type: 'element', elementType: 'rect', perform: performElementTool },
    'ai-generator': { type: 'element', elementType: 'text', perform: performElementTool },
};

const POINTER_TOOL_IDS = [
    'pointer',
    'select',
    'move',
    'trim',
    'crop',
    'resize',
    'erase',
    'healing',
    'filters',
    'background',
    'timeline',
    'prompt',
    'sound',
    'voices',
    'record',
    'comment',
    'brush',
    'components',
    'link',
    'responsive',
    'dev-export',
    'layers',
    'ai-fill',
    'ai-scene',
    'ai-layout',
    'ai-enhance',
    'ai-suggest',
    'ai-story',
    'ai-tutor',
    'ai-writer',
    'analytics',
    'api',
    'asset-library',
    'assignment',
    'code-view',
    'discussion',
    'export',
    'fonts',
    'fx',
    'grading',
    'image-studio',
    'logo',
    'mockup-generator',
    'page',
    'palette',
    'pose',
    'presentation-studio',
    'snippet',
    'speech',
    'students',
    'table',
    'template',
    'templates',
    'text-studio',
    'voice-studio',
    'character-studio',
];

POINTER_TOOL_IDS.forEach((id) => {
    if (!BASE_TOOL_BEHAVIORS[id]) {
        BASE_TOOL_BEHAVIORS[id] = { type: 'pointer' };
    }
});

const createTimelineTool = (assetType, overrides = {}) => ({
    type: 'timeline',
    assetType,
    duration: overrides.duration ?? 6,
    label: overrides.label ?? `Add ${assetType}`,
    historyLabel: overrides.historyLabel,
    metadata: overrides.metadata,
});

const MODE_TOOL_BEHAVIORS = {
    ux: {
        frame: { type: 'frame', width: 1280, height: 720, perform: performFrameTool },
        text: {
            type: 'element',
            elementType: 'text',
            preset: { width: 360, height: 96, fontSize: 20 },
            perform: performElementTool,
        },
        component: {
            type: 'element',
            elementType: 'component',
            preset: { width: 320, height: 240 },
            perform: performElementTool,
        },
    },
    animation: {
        clip: createTimelineTool('clip', { label: 'Animation clip', duration: 4 }),
        overlay: createTimelineTool('overlay', { label: 'Overlay', duration: 3 }),
        timeline: { type: 'pointer' },
    },
    video: {
        clip: createTimelineTool('clip', { label: 'Video clip', duration: 6 }),
        overlay: createTimelineTool('overlay', { label: 'Overlay', duration: 4 }),
        timeline: { type: 'pointer' },
        select: { type: 'pointer' },
        'ai-scene': createTimelineTool('clip', {
            label: 'AI Scene',
            duration: 8,
            metadata: { aiGenerated: true, targetMode: 'video' },
        }),
    },
    podcast: {
        segment: createTimelineTool('segment', { label: 'Episode segment', duration: 45 }),
        sound: createTimelineTool('audio', { label: 'FX & Music', duration: 20 }),
        record: createTimelineTool('audio', { label: 'Voice recording', duration: 30, metadata: { source: 'recording' } }),
        script: {
            type: 'element',
            elementType: 'script',
            preset: { width: 480, height: 320 },
            perform: performElementTool,
        },
        voices: {
            type: 'element',
            elementType: 'component',
            preset: { width: 320, height: 160 },
            perform: performElementTool,
        },
    },
    graphics: {
        shape: {
            type: 'element',
            elementType: 'rect',
            preset: { width: 320, height: 220 },
            perform: performElementTool,
        },
    },
    image: {
        shape: {
            type: 'element',
            elementType: 'rect',
            preset: { width: 260, height: 180 },
            perform: performElementTool,
        },
        brush: { type: 'pointer' },
    },
};

export const TOOL_BEHAVIORS = BASE_TOOL_BEHAVIORS;

export function resolveTool(toolId, mode) {
    if (!toolId || toolId === 'pointer') return { ...TOOL_BEHAVIORS.pointer, toolId: 'pointer' };
    const modeBehaviors = mode ? MODE_TOOL_BEHAVIORS[mode] : null;
    if (modeBehaviors && modeBehaviors[toolId]) {
        return { ...modeBehaviors[toolId], toolId };
    }
    if (TOOL_BEHAVIORS[toolId]) return { ...TOOL_BEHAVIORS[toolId], toolId };
    if (toolId.includes('frame')) return { ...TOOL_BEHAVIORS.frame, toolId };
    if (toolId.includes('text')) return { ...TOOL_BEHAVIORS.text, toolId };
    if (toolId.includes('image') || toolId.includes('photo')) return { ...TOOL_BEHAVIORS.image, toolId };
    if (toolId.includes('shape') || toolId.includes('rect') || toolId.includes('overlay'))
        return { ...TOOL_BEHAVIORS.shape, toolId };
    return { ...TOOL_BEHAVIORS.pointer, toolId };
}
