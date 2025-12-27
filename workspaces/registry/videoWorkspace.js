// /workspace/registry/video.workspace.js

export const VideoWorkspace = {
    id: 'video',
    label: 'Video',
    description: 'Motion graphics and video editing',

    extends: 'graphic',

    engines: ['nodeTree', 'timeline', 'audio', 'physics'],

    tools: ['select', 'move', 'resize', 'timeline'],

    nodeTypes: ['frame', 'group', 'text', 'image', 'video', 'audio'],

    panels: ['layers', 'timeline', 'assets', 'properties'],

    defaultTool: 'select',

    timeline: {
        enabled: true,
        mode: 'full',
    },

    export: {
        formats: ['mp4', 'webm'],
    },
};
