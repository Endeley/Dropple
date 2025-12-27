// /workspace/registry/uiux.workspace.js

export const UIUXWorkspace = {
    id: 'uiux',
    label: 'UI / UX Design',
    description: 'Responsive UI and component design',

    extends: 'graphic',

    engines: ['nodeTree', 'layout', 'constraints', 'autoLayout', 'stateMachine'],

    tools: ['select', 'move', 'resize', 'text', 'shape', 'image', 'inspect'],

    nodeTypes: ['frame', 'group', 'shape', 'text', 'image', 'component'],

    panels: ['layers', 'properties', 'assets', 'tokens'],

    defaultTool: 'select',

    timeline: {
        enabled: true,
        mode: 'ui',
    },

    export: {
        formats: ['react', 'html', 'css'],
    },
};
