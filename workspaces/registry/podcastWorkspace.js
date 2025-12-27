// /workspace/registry/podcast.workspace.js

export const PodcastWorkspace = {
    id: 'podcast',
    label: 'Podcast',
    description: 'Audio timeline and episode artwork',

    engines: ['timeline', 'audio'],

    tools: ['select', 'timeline', 'audio'],

    nodeTypes: ['audio', 'image', 'text'],

    panels: ['timeline', 'assets', 'properties'],

    defaultTool: 'timeline',

    timeline: {
        enabled: true,
        mode: 'audio',
    },

    export: {
        formats: ['mp3', 'wav'],
    },
};
