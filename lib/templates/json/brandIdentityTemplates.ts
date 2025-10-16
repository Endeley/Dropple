export const BRAND_IDENTITY_TEMPLATES = [
    {
        version: 1,
        title: 'Letterhead – Corporate Modern',
        slug: 'brand-letterhead-1',
        category: 'business',
        tags: ['brand', 'letterhead', 'identity'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #1e3a8a, #0f172a)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(30,58,138,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Corporate Letterhead',
                size: { width: 1240, height: 1754 },
                background: { kind: 'color', value: '#ffffff' },
                layers: [
                    {
                        id: 'header',
                        type: 'shape',
                        shape: 'rect',
                        transform: { x: 0, y: 0, width: 1240, height: 180, rotation: 0 },
                        fill: { kind: 'solid', color: '#1e3a8a' },
                    },
                    {
                        id: 'logo',
                        type: 'text',
                        content: 'Dropple Studio',
                        transform: { x: 100, y: 60, width: 1040, height: 60, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 40,
                        fontWeight: 700,
                        fill: '#ffffff',
                        align: 'left',
                    },
                    {
                        id: 'footer',
                        type: 'shape',
                        shape: 'rect',
                        transform: { x: 0, y: 1640, width: 1240, height: 120, rotation: 0 },
                        fill: { kind: 'solid', color: '#f1f5f9' },
                    },
                ],
            },
        ],
        editableData: {
            logo: 'Dropple Studio',
            accentColor: '#1e3a8a',
        },
    },
    {
        version: 1,
        title: 'Logo Mockup Grid – Simple Showcase',
        slug: 'brand-logo-1',
        category: 'popular',
        tags: ['logo', 'mockup', 'brand'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(148,163,184,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Logo Grid',
                size: { width: 1920, height: 1080 },
                background: { kind: 'color', value: '#ffffff' },
                layers: [
                    {
                        id: 'grid-bg',
                        type: 'shape',
                        shape: 'rect',
                        transform: { x: 0, y: 0, width: 1920, height: 1080, rotation: 0 },
                        fill: { kind: 'solid', color: '#f8fafc' },
                    },
                    {
                        id: 'logo1',
                        type: 'image',
                        src: 'https://images.unsplash.com/photo-1612831455543-bb9c8f46de63?w=1200',
                        transform: { x: 200, y: 200, width: 300, height: 300, rotation: 0 },
                        fit: 'contain',
                        opacity: 1,
                        flip: { horizontal: false, vertical: false },
                        filters: { contrast: 0, brightness: 0, saturation: 0, blur: 0 },
                    },
                    {
                        id: 'logo2',
                        type: 'image',
                        src: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200',
                        transform: { x: 760, y: 200, width: 300, height: 300, rotation: 0 },
                        fit: 'contain',
                        opacity: 1,
                        flip: { horizontal: false, vertical: false },
                        filters: { contrast: 0, brightness: 0, saturation: 0, blur: 0 },
                    },
                    {
                        id: 'logo3',
                        type: 'image',
                        src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
                        transform: { x: 1320, y: 200, width: 300, height: 300, rotation: 0 },
                        fit: 'contain',
                        opacity: 1,
                        flip: { horizontal: false, vertical: false },
                        filters: { contrast: 0, brightness: 0, saturation: 0, blur: 0 },
                    },
                ],
            },
        ],
        editableData: {
            logos: [
                'https://images.unsplash.com/photo-1612831455543-bb9c8f46de63?w=1200',
                'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200',
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
            ],
        },
    },
    {
        version: 1,
        title: 'Brand Guidelines – Cover Page',
        slug: 'brand-guidelines-1',
        category: 'business',
        tags: ['brand', 'manual', 'cover'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(37,99,235,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Guidelines Cover',
                size: { width: 1920, height: 1080 },
                background: {
                    kind: 'gradient',
                    gradient: {
                        type: 'linear',
                        angle: 135,
                        stops: [
                            { at: 0, color: '#3b82f6' },
                            { at: 1, color: '#2563eb' },
                        ],
                    },
                },
                layers: [
                    {
                        id: 'title',
                        type: 'text',
                        content: 'Brand Guidelines',
                        transform: { x: 200, y: 440, width: 1520, height: 120, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 96,
                        fontWeight: 900,
                        fill: '#ffffff',
                        align: 'center',
                    },
                    {
                        id: 'subtitle',
                        type: 'text',
                        content: 'Dropple Creative Suite',
                        transform: { x: 200, y: 580, width: 1520, height: 80, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 36,
                        fontWeight: 500,
                        fill: '#bfdbfe',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            title: 'Brand Guidelines',
            subtitle: 'Dropple Creative Suite',
            gradient: ['#3b82f6', '#2563eb'],
        },
    },
    {
        version: 1,
        title: 'Social Media Kit – Profile & Banner',
        slug: 'brand-socialkit-1',
        category: 'popular',
        tags: ['social', 'kit', 'brand'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #0ea5e9, #22d3ee)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(14,165,233,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Social Kit',
                size: { width: 1920, height: 1080 },
                background: { kind: 'color', value: '#f8fafc' },
                layers: [
                    {
                        id: 'banner',
                        type: 'shape',
                        shape: 'rect',
                        transform: { x: 0, y: 0, width: 1920, height: 400, rotation: 0 },
                        fill: { kind: 'solid', color: '#0ea5e9' },
                    },
                    {
                        id: 'profile-photo',
                        type: 'image',
                        src: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1200',
                        transform: { x: 860, y: 280, width: 200, height: 200, rotation: 0 },
                        fit: 'cover',
                        opacity: 1,
                        flip: { horizontal: false, vertical: false },
                        filters: { contrast: 0, brightness: 0, saturation: 0, blur: 0 },
                        cornerRadius: { tl: 100, tr: 100, br: 100, bl: 100 },
                    },
                    {
                        id: 'username',
                        type: 'text',
                        content: '@dropplecreative',
                        transform: { x: 200, y: 520, width: 1520, height: 80, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 48,
                        fontWeight: 700,
                        fill: '#1e293b',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            username: '@dropplecreative',
            profile: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1200',
            accentColor: '#0ea5e9',
        },
    },
    {
        version: 1,
        title: 'Business Card – Clean Stack',
        slug: 'brand-businesscard-1',
        category: 'business',
        tags: ['card', 'identity', 'brand'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #1d4ed8, #0f172a)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(29,78,216,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Business Card',
                size: { width: 1050, height: 600 },
                background: { kind: 'color', value: '#ffffff' },
                layers: [
                    {
                        id: 'left-panel',
                        type: 'shape',
                        shape: 'rect',
                        transform: { x: 0, y: 0, width: 350, height: 600, rotation: 0 },
                        fill: { kind: 'solid', color: '#1d4ed8' },
                    },
                    {
                        id: 'name',
                        type: 'text',
                        content: 'Maria Sanchez',
                        transform: { x: 400, y: 150, width: 600, height: 80, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 48,
                        fontWeight: 700,
                        fill: '#1e293b',
                    },
                    {
                        id: 'title',
                        type: 'text',
                        content: 'Brand Designer',
                        transform: { x: 400, y: 240, width: 600, height: 50, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 28,
                        fontWeight: 500,
                        fill: '#475569',
                    },
                ],
            },
        ],
        editableData: {
            name: 'Maria Sanchez',
            title: 'Brand Designer',
            accentColor: '#1d4ed8',
        },
    },
];

export const BRAND_IDENTITY_RECORD: Record<string, Record<string, unknown>> = BRAND_IDENTITY_TEMPLATES.reduce(
    (acc, template) => {
        acc[template.slug] = template;
        return acc;
    },
    {} as Record<string, Record<string, unknown>>
);

