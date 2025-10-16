export const AI_MOCKUP_TEMPLATES = [
    {
        version: 1,
        title: 'AI Image Showcase Card',
        slug: 'ai-mockup-image-card-1',
        category: 'enterprise',
        tags: ['ai', 'mockup', 'image showcase'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(15,23,42,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'AI Image Card',
                size: { width: 1080, height: 1080 },
                background: { kind: 'color', value: '#0f172a' },
                layers: [
                    {
                        id: 'image',
                        type: 'image',
                        src: 'https://images.unsplash.com/photo-1682687220063-4742bd7efba0?w=1600',
                        transform: { x: 90, y: 120, width: 900, height: 600, rotation: 0 },
                        fit: 'cover',
                        opacity: 1,
                        flip: { horizontal: false, vertical: false },
                        filters: { brightness: 0, contrast: 0, saturation: 0, blur: 0 },
                    },
                    {
                        id: 'title',
                        type: 'text',
                        content: 'Generated with Dropple AI',
                        transform: { x: 100, y: 760, width: 880, height: 80, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 36,
                        fontWeight: 700,
                        fill: '#f8fafc',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            title: 'Generated with Dropple AI',
            image: 'https://images.unsplash.com/photo-1682687220063-4742bd7efba0?w=1600',
        },
    },
    {
        version: 1,
        title: 'AI Prompt Result Grid',
        slug: 'ai-mockup-prompt-grid-1',
        category: 'enterprise',
        tags: ['ai', 'prompt', 'grid'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(15,23,42,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Prompt Grid',
                size: { width: 1920, height: 1080 },
                background: { kind: 'color', value: '#1e293b' },
                layers: [
                    {
                        id: 'grid',
                        type: 'shape',
                        shape: 'rect',
                        transform: { x: 160, y: 120, width: 1600, height: 800, rotation: 0 },
                        fill: { kind: 'solid', color: '#334155' },
                        stroke: { color: '#475569', width: 2 },
                        cornerRadius: 24,
                    },
                    {
                        id: 'title',
                        type: 'text',
                        content: 'AI Generated Results',
                        transform: { x: 200, y: 940, width: 1520, height: 80, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 48,
                        fontWeight: 800,
                        fill: '#f1f5f9',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            title: 'AI Generated Results',
            bgColor: '#1e293b',
        },
    },
    {
        version: 1,
        title: 'AI Text Output Mockup',
        slug: 'ai-mockup-text-1',
        category: 'enterprise',
        tags: ['ai', 'text', 'output'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(14,165,233,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'AI Text Mockup',
                size: { width: 1080, height: 1080 },
                background: {
                    kind: 'gradient',
                    gradient: {
                        type: 'linear',
                        angle: 145,
                        stops: [
                            { at: 0, color: '#3b82f6' },
                            { at: 1, color: '#0ea5e9' },
                        ],
                    },
                },
                layers: [
                    {
                        id: 'textbox',
                        type: 'shape',
                        shape: 'rect',
                        transform: { x: 140, y: 300, width: 800, height: 400, rotation: 0 },
                        fill: { kind: 'solid', color: '#ffffff' },
                        opacity: 0.2,
                        cornerRadius: 12,
                    },
                    {
                        id: 'text',
                        type: 'text',
                        content: '"AI-generated text example goes here..."',
                        transform: { x: 180, y: 380, width: 720, height: 200, rotation: 0 },
                        fontFamily: 'Inter, monospace',
                        fontSize: 28,
                        fontWeight: 500,
                        fill: '#ffffff',
                        align: 'left',
                    },
                ],
            },
        ],
        editableData: {
            text: '"AI-generated text example goes here..."',
            gradient: ['#3b82f6', '#0ea5e9'],
        },
    },
    {
        version: 1,
        title: 'AI Device Mockup',
        slug: 'ai-mockup-device-1',
        category: 'enterprise',
        tags: ['mockup', 'device', 'tech'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #f1f5f9, #cbd5f5)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(148,163,184,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Device Mockup',
                size: { width: 1920, height: 1080 },
                background: { kind: 'color', value: '#ffffff' },
                layers: [
                    {
                        id: 'device',
                        type: 'image',
                        src: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1600',
                        transform: { x: 500, y: 200, width: 900, height: 600, rotation: 0 },
                        fit: 'contain',
                        opacity: 1,
                        flip: { horizontal: false, vertical: false },
                        filters: { brightness: 0, contrast: 0, saturation: 0, blur: 0 },
                    },
                    {
                        id: 'title',
                        type: 'text',
                        content: 'AI Product Mockup',
                        transform: { x: 200, y: 860, width: 1520, height: 80, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 48,
                        fontWeight: 800,
                        fill: '#1e293b',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            title: 'AI Product Mockup',
            image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1600',
        },
    },
    {
        version: 1,
        title: 'AI Quote Design',
        slug: 'ai-mockup-quote-1',
        category: 'popular',
        tags: ['ai', 'quote', 'poster'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(99,102,241,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'AI Quote',
                size: { width: 1080, height: 1080 },
                background: {
                    kind: 'gradient',
                    gradient: {
                        type: 'linear',
                        angle: 130,
                        stops: [
                            { at: 0, color: '#6366f1' },
                            { at: 1, color: '#a855f7' },
                        ],
                    },
                },
                layers: [
                    {
                        id: 'quote',
                        type: 'text',
                        content: '"Creativity is intelligence having fun."',
                        transform: { x: 100, y: 420, width: 880, height: 200, rotation: 0 },
                        fontFamily: 'Inter, serif',
                        fontSize: 40,
                        fontWeight: 600,
                        fill: '#ffffff',
                        align: 'center',
                        lineHeight: 1.4,
                    },
                    {
                        id: 'author',
                        type: 'text',
                        content: '— Albert Einstein',
                        transform: { x: 100, y: 640, width: 880, height: 60, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 28,
                        fontWeight: 400,
                        fill: '#f1f5f9',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            quote: '"Creativity is intelligence having fun."',
            author: '— Albert Einstein',
            gradient: ['#6366f1', '#a855f7'],
        },
    },
];

export const AI_MOCKUP_RECORD: Record<string, Record<string, unknown>> = AI_MOCKUP_TEMPLATES.reduce(
    (acc, template) => {
        acc[template.slug] = template;
        return acc;
    },
    {} as Record<string, Record<string, unknown>>
);

