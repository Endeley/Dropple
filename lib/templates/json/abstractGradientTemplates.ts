export const ABSTRACT_GRADIENT_TEMPLATES = [
    {
        version: 1,
        title: 'Fluid Gradient – Abstract Art',
        slug: 'abstract-fluid-1',
        category: 'popular',
        tags: ['abstract', 'gradient', 'art'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(236,72,153,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Fluid Gradient',
                size: { width: 1080, height: 1080 },
                background: {
                    kind: 'gradient',
                    gradient: {
                        type: 'radial',
                        stops: [
                            { at: 0, color: '#6366f1' },
                            { at: 1, color: '#ec4899' },
                        ],
                    },
                },
                layers: [
                    {
                        id: 'blob1',
                        type: 'shape',
                        shape: 'ellipse',
                        transform: { x: 150, y: 150, width: 600, height: 400, rotation: 25 },
                        fill: { kind: 'solid', color: '#8b5cf6' },
                        opacity: 0.3,
                    },
                    {
                        id: 'blob2',
                        type: 'shape',
                        shape: 'ellipse',
                        transform: { x: 400, y: 400, width: 600, height: 400, rotation: -15 },
                        fill: { kind: 'solid', color: '#f472b6' },
                        opacity: 0.25,
                    },
                    {
                        id: 'title',
                        type: 'text',
                        content: 'ABSTRACT FLOW',
                        transform: { x: 100, y: 460, width: 880, height: 160, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 80,
                        fontWeight: 900,
                        fill: '#ffffff',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            title: 'ABSTRACT FLOW',
            gradient: ['#6366f1', '#ec4899'],
        },
    },
    {
        version: 1,
        title: 'Geometric Gradient – Modern Pattern',
        slug: 'abstract-geometry-1',
        category: 'popular',
        tags: ['geometric', 'gradient', 'pattern'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #3b82f6, #9333ea)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(147,51,234,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Geometric Gradient',
                size: { width: 1920, height: 1080 },
                background: { kind: 'color', value: '#f1f5f9' },
                layers: [
                    {
                        id: 'square1',
                        type: 'shape',
                        shape: 'rect',
                        transform: { x: 300, y: 200, width: 400, height: 400, rotation: 15 },
                        fill: { kind: 'solid', color: '#3b82f6' },
                        opacity: 0.6,
                    },
                    {
                        id: 'circle1',
                        type: 'shape',
                        shape: 'ellipse',
                        transform: { x: 900, y: 150, width: 600, height: 600, rotation: 0 },
                        fill: { kind: 'solid', color: '#9333ea' },
                        opacity: 0.4,
                    },
                    {
                        id: 'title',
                        type: 'text',
                        content: 'MODERN GEOMETRY',
                        transform: { x: 200, y: 460, width: 1520, height: 120, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 72,
                        fontWeight: 800,
                        fill: '#1e293b',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            title: 'MODERN GEOMETRY',
            colors: ['#3b82f6', '#9333ea'],
        },
    },
    {
        version: 1,
        title: 'Abstract Burst – Vibrant Energy',
        slug: 'abstract-burst-1',
        category: 'popular',
        tags: ['burst', 'vibrant', 'color'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(239,68,68,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Burst Gradient',
                size: { width: 1080, height: 1080 },
                background: {
                    kind: 'gradient',
                    gradient: {
                        type: 'linear',
                        angle: 120,
                        stops: [
                            { at: 0, color: '#f59e0b' },
                            { at: 1, color: '#ef4444' },
                        ],
                    },
                },
                layers: [
                    {
                        id: 'title',
                        type: 'text',
                        content: 'VIBRANT ENERGY',
                        transform: { x: 100, y: 440, width: 880, height: 200, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 84,
                        fontWeight: 900,
                        fill: '#ffffff',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            title: 'VIBRANT ENERGY',
            gradient: ['#f59e0b', '#ef4444'],
        },
    },
    {
        version: 1,
        title: 'Gradient Rings – Abstract Minimal',
        slug: 'abstract-rings-1',
        category: 'popular',
        tags: ['rings', 'gradient', 'minimal'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #0f172a, #111827)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(15,23,42,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Gradient Rings',
                size: { width: 1080, height: 1080 },
                background: { kind: 'color', value: '#0f172a' },
                layers: [
                    {
                        id: 'ring1',
                        type: 'shape',
                        shape: 'ellipse',
                        transform: { x: 190, y: 190, width: 700, height: 700, rotation: 0 },
                        stroke: { color: '#38bdf8', width: 20 },
                        fill: { kind: 'solid', color: 'transparent' },
                        opacity: 0.7,
                    },
                    {
                        id: 'ring2',
                        type: 'shape',
                        shape: 'ellipse',
                        transform: { x: 300, y: 300, width: 480, height: 480, rotation: 0 },
                        stroke: { color: '#818cf8', width: 20 },
                        fill: { kind: 'solid', color: 'transparent' },
                        opacity: 0.5,
                    },
                ],
            },
        ],
        editableData: {
            rings: ['#38bdf8', '#818cf8'],
        },
    },
    {
        version: 1,
        title: 'Gradient Blur – Soft Minimal',
        slug: 'abstract-blur-1',
        category: 'popular',
        tags: ['minimal', 'gradient', 'blur'],
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
                name: 'Soft Blur',
                size: { width: 1080, height: 1080 },
                background: { kind: 'color', value: '#ffffff' },
                layers: [
                    {
                        id: 'blur-bg',
                        type: 'image',
                        src: 'https://images.unsplash.com/photo-1614624532983-e6d564a6d86a?w=1600',
                        transform: { x: 0, y: 0, width: 1080, height: 1080, rotation: 0 },
                        fit: 'cover',
                        opacity: 1,
                        flip: { horizontal: false, vertical: false },
                        filters: { blur: 30, brightness: -10, contrast: 10, saturation: 0 },
                    },
                    {
                        id: 'title',
                        type: 'text',
                        content: 'SOFT BLUR',
                        transform: { x: 100, y: 460, width: 880, height: 120, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 72,
                        fontWeight: 800,
                        fill: '#1e293b',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            title: 'SOFT BLUR',
            image: 'https://images.unsplash.com/photo-1614624532983-e6d564a6d86a?w=1600',
        },
    },
];

export const ABSTRACT_GRADIENT_RECORD: Record<string, Record<string, unknown>> = ABSTRACT_GRADIENT_TEMPLATES.reduce(
    (acc, template) => {
        acc[template.slug] = template;
        return acc;
    },
    {} as Record<string, Record<string, unknown>>
);

