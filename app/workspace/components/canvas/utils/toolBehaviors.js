'use client';

export const TOOL_BEHAVIORS = {
    pointer: { type: 'pointer' },
    frame: { type: 'frame', width: 960, height: 640 },
    canvas: { type: 'frame', width: 1280, height: 720 },
    scene: { type: 'frame', width: 1280, height: 720 },
    segment: { type: 'frame', width: 960, height: 320 },
    shape: { type: 'element', elementType: 'rect' },
    rect: { type: 'element', elementType: 'rect' },
    overlay: { type: 'element', elementType: 'rect' },
    clip: { type: 'element', elementType: 'rect' },
    text: { type: 'element', elementType: 'text' },
    script: { type: 'element', elementType: 'text' },
    image: { type: 'element', elementType: 'image' },
    'ai-generator': { type: 'element', elementType: 'text' },
    component: { type: 'element', elementType: 'rect' },
    character: { type: 'element', elementType: 'rect' },
};

export function resolveTool(toolId) {
    if (!toolId || toolId === 'pointer') return TOOL_BEHAVIORS.pointer;
    if (TOOL_BEHAVIORS[toolId]) return TOOL_BEHAVIORS[toolId];
    if (toolId.includes('frame')) return TOOL_BEHAVIORS.frame;
    if (toolId.includes('text')) return TOOL_BEHAVIORS.text;
    if (toolId.includes('image') || toolId.includes('photo')) return TOOL_BEHAVIORS.image;
    if (toolId.includes('shape') || toolId.includes('rect') || toolId.includes('overlay')) return TOOL_BEHAVIORS.shape;
    return TOOL_BEHAVIORS.pointer;
}
