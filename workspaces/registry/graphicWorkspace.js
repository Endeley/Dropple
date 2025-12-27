// /workspace/registry/graphic.workspace.js

export const GraphicWorkspace = {
    id: 'graphic',
    label: 'Graphic Design',
    description: 'Freeform visual design workspace',

    engines: ['nodeTree', 'layout'],

    tools: ['select', 'move', 'resize', 'text', 'shape', 'image'],

    nodeTypes: ['frame', 'group', 'shape', 'text', 'image'],

    panels: ['layers', 'properties', 'assets'],

    defaultTool: 'select',

    timeline: {
        enabled: false,
        mode: 'none',
    },

    export: {
        formats: ['png', 'jpg', 'svg'],
    },
};
