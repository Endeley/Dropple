export const FOOD_CAMPAIGNS_TEMPLATES = [
    {
        version: 1,
        title: 'Food Poster – Restaurant Promo',
        slug: 'food-restaurant-1',
        category: 'food',
        tags: ['restaurant', 'promo', 'poster'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #fb923c, #f97316)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(249,115,22,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Restaurant Promo',
                size: { width: 1080, height: 1350 },
                background: { kind: 'color', value: '#fff7ed' },
                layers: [
                    {
                        id: 'photo',
                        type: 'image',
                        src: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=1600',
                        transform: { x: 0, y: 0, width: 1080, height: 800, rotation: 0 },
                        fit: 'cover',
                        opacity: 1,
                        flip: { horizontal: false, vertical: false },
                        filters: { contrast: 10, brightness: 0, saturation: 10, blur: 0 },
                    },
                    {
                        id: 'title',
                        type: 'text',
                        content: 'Taste the Best Burgers in Town',
                        transform: { x: 100, y: 860, width: 880, height: 120, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 64,
                        fontWeight: 900,
                        fill: '#1e293b',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            title: 'Taste the Best Burgers in Town',
            image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=1600',
        },
    },
    {
        version: 1,
        title: 'Restaurant Menu – Minimal',
        slug: 'food-menu-1',
        category: 'food',
        tags: ['menu', 'restaurant', 'layout'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #f8fafc, #cbd5f5)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(148,163,184,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Minimal Menu',
                size: { width: 1080, height: 1920 },
                background: { kind: 'color', value: '#ffffff' },
                layers: [
                    {
                        id: 'header',
                        type: 'text',
                        content: 'Le Gourmet Menu',
                        transform: { x: 100, y: 100, width: 880, height: 100, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 56,
                        fontWeight: 800,
                        fill: '#0f172a',
                        align: 'center',
                    },
                    {
                        id: 'items',
                        type: 'text',
                        content: 'Pasta Alfredo ........... €14\nGrilled Salmon ........... €18\nTiramisu ........... €7',
                        transform: { x: 200, y: 320, width: 680, height: 600, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 32,
                        fontWeight: 400,
                        fill: '#475569',
                        align: 'left',
                        lineHeight: 1.8,
                    },
                ],
            },
        ],
        editableData: {
            header: 'Le Gourmet Menu',
            items: 'Pasta Alfredo ........... €14\nGrilled Salmon ........... €18\nTiramisu ........... €7',
        },
    },
    {
        version: 1,
        title: 'Food Story – Daily Specials',
        slug: 'food-story-1',
        category: 'food',
        tags: ['instagram', 'story', 'food'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #f97316, #facc15)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(250,204,21,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Story Promo',
                size: { width: 1080, height: 1920 },
                background: {
                    kind: 'gradient',
                    gradient: {
                        type: 'linear',
                        angle: 135,
                        stops: [
                            { at: 0, color: '#f97316' },
                            { at: 1, color: '#facc15' },
                        ],
                    },
                },
                layers: [
                    {
                        id: 'photo',
                        type: 'image',
                        src: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1600',
                        transform: { x: 100, y: 260, width: 880, height: 880, rotation: 0 },
                        fit: 'cover',
                        opacity: 0.9,
                        flip: { horizontal: false, vertical: false },
                        filters: { contrast: 0, brightness: 0, saturation: 0, blur: 0 },
                    },
                    {
                        id: 'title',
                        type: 'text',
                        content: 'Today’s Specials 🍝',
                        transform: { x: 100, y: 1240, width: 880, height: 120, rotation: 0 },
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
            title: 'Today’s Specials 🍝',
            image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1600',
            gradient: ['#f97316', '#facc15'],
        },
    },
    {
        version: 1,
        title: 'Campaign Poster – Awareness',
        slug: 'campaign-awareness-1',
        category: 'campaigns',
        tags: ['poster', 'awareness', 'social cause'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(225,29,72,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Awareness Poster',
                size: { width: 1080, height: 1350 },
                background: {
                    kind: 'gradient',
                    gradient: {
                        type: 'linear',
                        angle: 135,
                        stops: [
                            { at: 0, color: '#f43f5e' },
                            { at: 1, color: '#e11d48' },
                        ],
                    },
                },
                layers: [
                    {
                        id: 'title',
                        type: 'text',
                        content: 'Stop Plastic Pollution',
                        transform: { x: 100, y: 560, width: 880, height: 160, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 72,
                        fontWeight: 900,
                        fill: '#ffffff',
                        align: 'center',
                    },
                    {
                        id: 'subtitle',
                        type: 'text',
                        content: '#SaveOurOceans',
                        transform: { x: 100, y: 740, width: 880, height: 100, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 48,
                        fontWeight: 600,
                        fill: '#fcd34d',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            title: 'Stop Plastic Pollution',
            subtitle: '#SaveOurOceans',
            gradient: ['#f43f5e', '#e11d48'],
        },
    },
    {
        version: 1,
        title: 'Charity Event – Join the Cause',
        slug: 'campaign-charity-1',
        category: 'campaigns',
        tags: ['charity', 'event', 'donation'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #fef9c3, #fde68a)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(254,249,195,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Charity Poster',
                size: { width: 1080, height: 1350 },
                background: { kind: 'color', value: '#fef9c3' },
                layers: [
                    {
                        id: 'photo',
                        type: 'image',
                        src: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=1600',
                        transform: { x: 100, y: 140, width: 880, height: 600, rotation: 0 },
                        fit: 'cover',
                        opacity: 0.9,
                        flip: { horizontal: false, vertical: false },
                        filters: { contrast: 0, brightness: 0, saturation: 0, blur: 0 },
                    },
                    {
                        id: 'title',
                        type: 'text',
                        content: 'Join Hands, Change Lives',
                        transform: { x: 100, y: 820, width: 880, height: 100, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 60,
                        fontWeight: 800,
                        fill: '#1e293b',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            title: 'Join Hands, Change Lives',
            image: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=1600',
        },
    },
];

export const FOOD_CAMPAIGNS_RECORD: Record<string, Record<string, unknown>> = FOOD_CAMPAIGNS_TEMPLATES.reduce(
    (acc, template) => {
        acc[template.slug] = template;
        return acc;
    },
    {} as Record<string, Record<string, unknown>>
);

