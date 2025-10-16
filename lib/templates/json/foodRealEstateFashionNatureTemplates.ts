export const FOOD_REALESTATE_FASHION_NATURE_TEMPLATES = [
    {
        version: 1,
        title: 'Food Poster – Restaurant Promo',
        slug: 'food-poster-1',
        category: 'food',
        tags: ['poster', 'restaurant', 'promo'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #fb923c, #b91c1c)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(249,146,60,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Restaurant Poster',
                size: { width: 1080, height: 1350 },
                background: { kind: 'color', value: '#fff7ed' },
                layers: [
                    {
                        id: 'photo',
                        type: 'image',
                        src: 'https://images.unsplash.com/photo-1606755962773-d324e0c7cba1?w=1600',
                        transform: { x: 0, y: 0, width: 1080, height: 700, rotation: 0 },
                        fit: 'cover',
                        opacity: 0.9,
                        flip: { horizontal: false, vertical: false },
                        filters: { contrast: 0, brightness: 0, saturation: 0, blur: 0 },
                    },
                    {
                        id: 'title',
                        type: 'text',
                        content: 'Taste the Difference',
                        transform: { x: 100, y: 800, width: 880, height: 100, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 64,
                        fontWeight: 800,
                        fill: '#b91c1c',
                        align: 'center',
                    },
                    {
                        id: 'subtitle',
                        type: 'text',
                        content: 'Fresh • Organic • Local',
                        transform: { x: 100, y: 900, width: 880, height: 60, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 36,
                        fontWeight: 500,
                        fill: '#1e293b',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            title: 'Taste the Difference',
            subtitle: 'Fresh • Organic • Local',
            image: 'https://images.unsplash.com/photo-1606755962773-d324e0c7cba1?w=1600',
        },
    },
    {
        version: 1,
        title: 'Food Story – Modern Gradient',
        slug: 'food-story-1',
        category: 'food',
        tags: ['story', 'gradient', 'promo'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #fb923c, #facc15)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(250,204,21,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Food Story',
                size: { width: 1080, height: 1920 },
                background: {
                    kind: 'gradient',
                    gradient: {
                        type: 'linear',
                        angle: 135,
                        stops: [
                            { at: 0, color: '#fb923c' },
                            { at: 1, color: '#facc15' },
                        ],
                    },
                },
                layers: [
                    {
                        id: 'title',
                        type: 'text',
                        content: 'Crave the Flavor',
                        transform: { x: 100, y: 900, width: 880, height: 120, rotation: 0 },
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
            title: 'Crave the Flavor',
            gradient: ['#fb923c', '#facc15'],
        },
    },
    {
        version: 1,
        title: 'Real Estate Flyer – Modern Apartment',
        slug: 'realestate-flyer-1',
        category: 'realestate',
        tags: ['flyer', 'property', 'modern'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #1e3a8a, #93c5fd)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(147,197,253,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Real Estate Flyer',
                size: { width: 1080, height: 1528 },
                background: { kind: 'color', value: '#f9fafb' },
                layers: [
                    {
                        id: 'photo',
                        type: 'image',
                        src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600',
                        transform: { x: 0, y: 0, width: 1080, height: 700, rotation: 0 },
                        fit: 'cover',
                        opacity: 1,
                        flip: { horizontal: false, vertical: false },
                        filters: { contrast: 0, brightness: 0, saturation: 0, blur: 0 },
                    },
                    {
                        id: 'title',
                        type: 'text',
                        content: 'Luxury Apartment for Sale',
                        transform: { x: 100, y: 800, width: 880, height: 80, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 52,
                        fontWeight: 800,
                        fill: '#1e3a8a',
                        align: 'center',
                    },
                    {
                        id: 'price',
                        type: 'text',
                        content: '$350,000',
                        transform: { x: 100, y: 900, width: 880, height: 60, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 40,
                        fontWeight: 700,
                        fill: '#475569',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            title: 'Luxury Apartment for Sale',
            price: '$350,000',
            image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600',
        },
    },
    {
        version: 1,
        title: 'Real Estate Banner – Open House',
        slug: 'realestate-banner-1',
        category: 'realestate',
        tags: ['banner', 'event', 'open-house'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #0f172a, #38bdf8)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(56,189,248,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Open House Banner',
                size: { width: 1200, height: 628 },
                background: { kind: 'color', value: '#ffffff' },
                layers: [
                    {
                        id: 'photo',
                        type: 'image',
                        src: 'https://images.unsplash.com/photo-1599423300746-b62533397364?w=1600',
                        transform: { x: 0, y: 0, width: 1200, height: 628, rotation: 0 },
                        fit: 'cover',
                        opacity: 0.75,
                        flip: { horizontal: false, vertical: false },
                        filters: { contrast: 0, brightness: 0, saturation: 0, blur: 0 },
                    },
                    {
                        id: 'title',
                        type: 'text',
                        content: 'Join Our Open House',
                        transform: { x: 100, y: 240, width: 1000, height: 80, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 52,
                        fontWeight: 800,
                        fill: '#ffffff',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            title: 'Join Our Open House',
            image: 'https://images.unsplash.com/photo-1599423300746-b62533397364?w=1600',
        },
    },
    {
        version: 1,
        title: 'Fashion Ad – Bold Aesthetic',
        slug: 'fashion-ad-1',
        category: 'fashion',
        tags: ['ad', 'style', 'bold'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #e11d48, #f59e0b)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(225,29,72,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Fashion Poster',
                size: { width: 1080, height: 1350 },
                background: {
                    kind: 'gradient',
                    gradient: {
                        type: 'linear',
                        angle: 120,
                        stops: [
                            { at: 0, color: '#e11d48' },
                            { at: 1, color: '#f59e0b' },
                        ],
                    },
                },
                layers: [
                    {
                        id: 'photo',
                        type: 'image',
                        src: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1600',
                        transform: { x: 140, y: 160, width: 800, height: 900, rotation: 0 },
                        fit: 'cover',
                        opacity: 0.9,
                        flip: { horizontal: false, vertical: false },
                        filters: { contrast: 0, brightness: 0, saturation: 0, blur: 0 },
                    },
                    {
                        id: 'title',
                        type: 'text',
                        content: 'Summer Collection 2025',
                        transform: { x: 100, y: 1100, width: 880, height: 100, rotation: 0 },
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
            title: 'Summer Collection 2025',
            gradient: ['#e11d48', '#f59e0b'],
            image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1600',
        },
    },
    {
        version: 1,
        title: 'Fashion Card – Minimal Luxury',
        slug: 'fashion-card-1',
        category: 'fashion',
        tags: ['card', 'luxury', 'minimal'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #64748b, #0f172a)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(15,23,42,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Fashion Card',
                size: { width: 1050, height: 600 },
                background: { kind: 'color', value: '#fafaf9' },
                layers: [
                    {
                        id: 'title',
                        type: 'text',
                        content: 'Maison Vogue',
                        transform: { x: 100, y: 220, width: 850, height: 100, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 72,
                        fontWeight: 800,
                        fill: '#0f172a',
                        align: 'center',
                    },
                    {
                        id: 'subtitle',
                        type: 'text',
                        content: 'Luxury Meets Simplicity',
                        transform: { x: 100, y: 320, width: 850, height: 60, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 28,
                        fontWeight: 500,
                        fill: '#475569',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            title: 'Maison Vogue',
            subtitle: 'Luxury Meets Simplicity',
        },
    },
    {
        version: 1,
        title: 'Nature Poster – Landscape Art',
        slug: 'nature-poster-1',
        category: 'nature',
        tags: ['poster', 'landscape', 'green'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #0f766e, #22c55e)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(34,197,94,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Nature Poster',
                size: { width: 1080, height: 1350 },
                background: { kind: 'color', value: '#e0f2fe' },
                layers: [
                    {
                        id: 'photo',
                        type: 'image',
                        src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600',
                        transform: { x: 0, y: 0, width: 1080, height: 900, rotation: 0 },
                        fit: 'cover',
                        opacity: 0.9,
                        flip: { horizontal: false, vertical: false },
                        filters: { contrast: 0, brightness: 0, saturation: 0, blur: 0 },
                    },
                    {
                        id: 'title',
                        type: 'text',
                        content: 'Wonders of the Wild',
                        transform: { x: 100, y: 960, width: 880, height: 100, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 64,
                        fontWeight: 800,
                        fill: '#0f766e',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            title: 'Wonders of the Wild',
            image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600',
        },
    },
];

export const FOOD_REALESTATE_FASHION_NATURE_RECORD: Record<string, Record<string, unknown>> =
    FOOD_REALESTATE_FASHION_NATURE_TEMPLATES.reduce(
        (acc, template) => {
            acc[template.slug] = template;
            return acc;
        },
        {} as Record<string, Record<string, unknown>>
    );

