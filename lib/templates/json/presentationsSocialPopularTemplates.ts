export const PRESENTATIONS_SOCIAL_POPULAR_TEMPLATES = [
    {
        version: 1,
        title: 'Presentation – Corporate Pitch',
        slug: 'presentation-pitch-1',
        category: 'presentation',
        tags: ['presentation', 'pitch', 'corporate'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #0f172a, #334155)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(15,23,42,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Corporate Pitch',
                size: { width: 1920, height: 1080 },
                background: { kind: 'color', value: '#ffffff' },
                layers: [
                    {
                        id: 'header',
                        type: 'shape',
                        shape: 'rect',
                        transform: { x: 0, y: 0, width: 1920, height: 200, rotation: 0 },
                        fill: { kind: 'solid', color: '#0f172a' },
                    },
                    {
                        id: 'title',
                        type: 'text',
                        content: 'Corporate Pitch Deck 2025',
                        transform: { x: 160, y: 80, width: 1600, height: 80, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 56,
                        fontWeight: 800,
                        fill: '#ffffff',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            title: 'Corporate Pitch Deck 2025',
            accentColor: '#0f172a',
        },
    },
    {
        version: 1,
        title: 'Presentation – Minimal Dark',
        slug: 'presentation-dark-1',
        category: 'presentation',
        tags: ['presentation', 'modern', 'dark'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #111827, #1e40af)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(17,24,39,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Minimal Dark Slide',
                size: { width: 1920, height: 1080 },
                background: { kind: 'color', value: '#111827' },
                layers: [
                    {
                        id: 'title',
                        type: 'text',
                        content: 'Next Big Idea',
                        transform: { x: 160, y: 440, width: 1600, height: 200, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 96,
                        fontWeight: 900,
                        fill: '#38bdf8',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            title: 'Next Big Idea',
            accentColor: '#38bdf8',
        },
    },
    {
        version: 1,
        title: 'Instagram Quote – Minimal',
        slug: 'social-quote-1',
        category: 'social',
        tags: ['instagram', 'quote', 'minimal'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #fafafa, #e2e8f0)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(148,163,184,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Quote Post',
                size: { width: 1080, height: 1080 },
                background: { kind: 'color', value: '#fafafa' },
                layers: [
                    {
                        id: 'text',
                        type: 'text',
                        content: '“Creativity takes courage.” – Henri Matisse',
                        transform: { x: 100, y: 460, width: 880, height: 160, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 48,
                        fontWeight: 600,
                        fill: '#1e293b',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            quote: '“Creativity takes courage.” – Henri Matisse',
            bgColor: '#fafafa',
        },
    },
    {
        version: 1,
        title: 'Social Promo – Product Highlight',
        slug: 'social-product-1',
        category: 'social',
        tags: ['instagram', 'product', 'promo'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #f43f5e, #f59e0b)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(244,63,94,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Product Promo',
                size: { width: 1080, height: 1350 },
                background: {
                    kind: 'gradient',
                    gradient: {
                        type: 'linear',
                        angle: 135,
                        stops: [
                            { at: 0, color: '#f43f5e' },
                            { at: 1, color: '#f59e0b' },
                        ],
                    },
                },
                layers: [
                    {
                        id: 'photo',
                        type: 'image',
                        src: 'https://images.unsplash.com/photo-1606813902917-9a77fdb56cba?w=1600',
                        transform: { x: 100, y: 100, width: 880, height: 880, rotation: 0 },
                        fit: 'cover',
                        opacity: 0.85,
                        flip: { horizontal: false, vertical: false },
                        filters: { contrast: 0, brightness: 0, saturation: 0, blur: 0 },
                    },
                    {
                        id: 'title',
                        type: 'text',
                        content: 'New Arrival: SmartWatch X',
                        transform: { x: 100, y: 1040, width: 880, height: 100, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 56,
                        fontWeight: 800,
                        fill: '#ffffff',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            title: 'New Arrival: SmartWatch X',
            gradient: ['#f43f5e', '#f59e0b'],
            image: 'https://images.unsplash.com/photo-1606813902917-9a77fdb56cba?w=1600',
        },
    },
    {
        version: 1,
        title: 'Social Story – Sale Alert',
        slug: 'social-sale-1',
        category: 'social',
        tags: ['story', 'sale', 'alert'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #f43f5e, #fb7185)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(251,113,133,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Sale Story',
                size: { width: 1080, height: 1920 },
                background: { kind: 'color', value: '#f43f5e' },
                layers: [
                    {
                        id: 'title',
                        type: 'text',
                        content: 'BIG SALE 50% OFF!',
                        transform: { x: 100, y: 880, width: 880, height: 160, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 92,
                        fontWeight: 900,
                        fill: '#ffffff',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            title: 'BIG SALE 50% OFF!',
            accentColor: '#f43f5e',
        },
    },
    {
        version: 1,
        title: 'Social Media – Collage Layout',
        slug: 'social-collage-1',
        category: 'social',
        tags: ['collage', 'trend', 'modern'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #ffffff, #cbd5f5)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(148,163,184,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Collage Post',
                size: { width: 1080, height: 1080 },
                background: { kind: 'color', value: '#ffffff' },
                layers: [
                    {
                        id: 'photo1',
                        type: 'image',
                        src: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800',
                        transform: { x: 60, y: 60, width: 440, height: 440, rotation: -3 },
                        fit: 'cover',
                        opacity: 1,
                        flip: { horizontal: false, vertical: false },
                        filters: { contrast: 0, brightness: 0, saturation: 0, blur: 0 },
                    },
                    {
                        id: 'photo2',
                        type: 'image',
                        src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
                        transform: { x: 580, y: 580, width: 440, height: 440, rotation: 2 },
                        fit: 'cover',
                        opacity: 1,
                        flip: { horizontal: false, vertical: false },
                        filters: { contrast: 0, brightness: 0, saturation: 0, blur: 0 },
                    },
                    {
                        id: 'caption',
                        type: 'text',
                        content: 'Style • Energy • You',
                        transform: { x: 100, y: 480, width: 880, height: 100, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 52,
                        fontWeight: 700,
                        fill: '#111827',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            caption: 'Style • Energy • You',
        },
    },
    {
        version: 1,
        title: 'Quote Poster – Motivational',
        slug: 'popular-quote-1',
        category: 'popular',
        tags: ['poster', 'motivational', 'quote'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #7dd3fc, #0ea5e9)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(14,165,233,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Motivational Poster',
                size: { width: 1080, height: 1350 },
                background: {
                    kind: 'gradient',
                    gradient: {
                        type: 'linear',
                        angle: 120,
                        stops: [
                            { at: 0, color: '#7dd3fc' },
                            { at: 1, color: '#0ea5e9' },
                        ],
                    },
                },
                layers: [
                    {
                        id: 'text',
                        type: 'text',
                        content: 'Dream Big, Start Small, Act Now.',
                        transform: { x: 100, y: 560, width: 880, height: 160, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 60,
                        fontWeight: 800,
                        fill: '#ffffff',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            text: 'Dream Big, Start Small, Act Now.',
            gradient: ['#7dd3fc', '#0ea5e9'],
        },
    },
];

export const PRESENTATIONS_SOCIAL_POPULAR_RECORD: Record<string, Record<string, unknown>> =
    PRESENTATIONS_SOCIAL_POPULAR_TEMPLATES.reduce(
        (acc, template) => {
            acc[template.slug] = template;
            return acc;
        },
        {} as Record<string, Record<string, unknown>>
    );

