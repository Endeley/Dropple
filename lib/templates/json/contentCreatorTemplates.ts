export const CONTENT_CREATOR_TEMPLATES = [
    {
        version: 1,
        title: 'YouTube Thumbnail – Bold Title',
        slug: 'creator-youtube-1',
        category: 'popular',
        tags: ['youtube', 'thumbnail', 'video'],
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
                name: 'YouTube Thumbnail',
                size: { width: 1280, height: 720 },
                background: { kind: 'color', value: '#0f172a' },
                layers: [
                    {
                        id: 'bg-image',
                        type: 'image',
                        src: 'https://images.unsplash.com/photo-1602526218693-b241a7a9f56e?w=1600',
                        transform: { x: 0, y: 0, width: 1280, height: 720, rotation: 0 },
                        fit: 'cover',
                        opacity: 1,
                        flip: { horizontal: false, vertical: false },
                        filters: { brightness: -10, contrast: 10, saturation: 5, blur: 0 },
                    },
                    {
                        id: 'overlay',
                        type: 'shape',
                        shape: 'rect',
                        transform: { x: 0, y: 0, width: 1280, height: 720, rotation: 0 },
                        fill: { kind: 'solid', color: '#000000' },
                        opacity: 0.4,
                    },
                    {
                        id: 'title',
                        type: 'text',
                        content: 'TOP 10 DESIGN HACKS',
                        transform: { x: 100, y: 260, width: 1080, height: 200, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 96,
                        fontWeight: 900,
                        fill: '#ffffff',
                        align: 'center',
                        letterSpacing: -2,
                    },
                ],
            },
        ],
        editableData: {
            title: 'TOP 10 DESIGN HACKS',
            image: 'https://images.unsplash.com/photo-1602526218693-b241a7a9f56e?w=1600',
        },
    },
    {
        version: 1,
        title: 'Podcast Cover – Minimal Gradient',
        slug: 'creator-podcast-1',
        category: 'popular',
        tags: ['podcast', 'cover', 'audio'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(236,72,153,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Podcast Cover',
                size: { width: 1080, height: 1080 },
                background: {
                    kind: 'gradient',
                    gradient: {
                        type: 'linear',
                        angle: 135,
                        stops: [
                            { at: 0, color: '#a855f7' },
                            { at: 1, color: '#ec4899' },
                        ],
                    },
                },
                layers: [
                    {
                        id: 'title',
                        type: 'text',
                        content: 'The Creative Show',
                        transform: { x: 100, y: 440, width: 880, height: 200, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 72,
                        fontWeight: 900,
                        fill: '#ffffff',
                        align: 'center',
                    },
                    {
                        id: 'subtitle',
                        type: 'text',
                        content: 'Hosted by Jane Doe',
                        transform: { x: 100, y: 650, width: 880, height: 80, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 32,
                        fontWeight: 500,
                        fill: '#fdf2f8',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            title: 'The Creative Show',
            subtitle: 'Hosted by Jane Doe',
            gradient: ['#a855f7', '#ec4899'],
        },
    },
    {
        version: 1,
        title: 'Instagram Reel Cover – Gradient Overlay',
        slug: 'creator-reel-1',
        category: 'popular',
        tags: ['instagram', 'reel', 'social'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #1f2937, #000000)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(17,24,39,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Reel Cover',
                size: { width: 1080, height: 1920 },
                background: { kind: 'color', value: '#000000' },
                layers: [
                    {
                        id: 'image',
                        type: 'image',
                        src: 'https://images.unsplash.com/photo-1586281380393-3f8267e7a5aa?w=1600',
                        transform: { x: 0, y: 0, width: 1080, height: 1920, rotation: 0 },
                        fit: 'cover',
                        opacity: 1,
                        flip: { horizontal: false, vertical: false },
                        filters: { contrast: 5, brightness: 0, saturation: 0, blur: 0 },
                    },
                    {
                        id: 'gradient',
                        type: 'shape',
                        shape: 'rect',
                        transform: { x: 0, y: 0, width: 1080, height: 1920, rotation: 0 },
                        fill: {
                            kind: 'gradient',
                            gradient: {
                                type: 'linear',
                                angle: 180,
                                stops: [
                                    { at: 0, color: '#000000' },
                                    { at: 1, color: '#000000' },
                                ],
                            },
                        },
                        opacity: 0.7,
                    },
                    {
                        id: 'title',
                        type: 'text',
                        content: 'NEW EPISODE OUT NOW',
                        transform: { x: 100, y: 1520, width: 880, height: 160, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 64,
                        fontWeight: 800,
                        fill: '#ffffff',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            title: 'NEW EPISODE OUT NOW',
            image: 'https://images.unsplash.com/photo-1586281380393-3f8267e7a5aa?w=1600',
        },
    },
    {
        version: 1,
        title: 'Creator Ad – Product Teaser',
        slug: 'creator-ad-1',
        category: 'marketing',
        tags: ['ad', 'creator', 'product'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #1e293b, #111827)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(17,24,39,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Creator Ad',
                size: { width: 1080, height: 1080 },
                background: { kind: 'color', value: '#ffffff' },
                layers: [
                    {
                        id: 'photo',
                        type: 'image',
                        src: 'https://images.unsplash.com/photo-1593642532871-8b12e02d091c?w=1600',
                        transform: { x: 140, y: 140, width: 800, height: 800, rotation: 0 },
                        fit: 'cover',
                        opacity: 1,
                        flip: { horizontal: false, vertical: false },
                        filters: { contrast: 0, brightness: 0, saturation: 0, blur: 0 },
                    },
                    {
                        id: 'text',
                        type: 'text',
                        content: 'COMING SOON 🔥',
                        transform: { x: 100, y: 460, width: 880, height: 160, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 80,
                        fontWeight: 800,
                        fill: '#0f172a',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            text: 'COMING SOON 🔥',
            image: 'https://images.unsplash.com/photo-1593642532871-8b12e02d091c?w=1600',
        },
    },
    {
        version: 1,
        title: 'Creator Profile Intro – Abstract Gradient',
        slug: 'creator-profile-1',
        category: 'popular',
        tags: ['profile', 'creator', 'intro'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #38bdf8, #1e3a8a)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(30,64,175,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Creator Profile',
                size: { width: 1080, height: 1920 },
                background: {
                    kind: 'gradient',
                    gradient: {
                        type: 'radial',
                        stops: [
                            { at: 0, color: '#38bdf8' },
                            { at: 1, color: '#1e3a8a' },
                        ],
                    },
                },
                layers: [
                    {
                        id: 'avatar',
                        type: 'image',
                        src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200',
                        transform: { x: 340, y: 400, width: 400, height: 400, rotation: 0 },
                        fit: 'cover',
                        opacity: 1,
                        flip: { horizontal: false, vertical: false },
                        filters: { contrast: 0, brightness: 0, saturation: 0, blur: 0 },
                        cornerRadius: { tl: 200, tr: 200, br: 200, bl: 200 },
                    },
                    {
                        id: 'name',
                        type: 'text',
                        content: 'Alex Green',
                        transform: { x: 100, y: 880, width: 880, height: 80, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 56,
                        fontWeight: 700,
                        fill: '#ffffff',
                        align: 'center',
                    },
                    {
                        id: 'role',
                        type: 'text',
                        content: 'Digital Creator',
                        transform: { x: 100, y: 960, width: 880, height: 60, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 32,
                        fontWeight: 500,
                        fill: '#bfdbfe',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            name: 'Alex Green',
            role: 'Digital Creator',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200',
        },
    },
];

export const CONTENT_CREATOR_RECORD: Record<string, Record<string, unknown>> =
    CONTENT_CREATOR_TEMPLATES.reduce(
        (acc, template) => {
            acc[template.slug] = template;
            return acc;
        },
        {} as Record<string, Record<string, unknown>>
    );

