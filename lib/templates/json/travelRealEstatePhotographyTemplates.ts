export const TRAVEL_REALESTATE_PHOTOGRAPHY_TEMPLATES = [
    {
        version: 1,
        title: 'Travel Poster – Tropical Escape',
        slug: 'travel-poster-1',
        category: 'travel',
        tags: ['travel', 'poster', 'vacation'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #22d3ee, #0ea5e9)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(14,165,233,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Tropical Poster',
                size: { width: 1080, height: 1350 },
                background: { kind: 'color', value: '#ffffff' },
                layers: [
                    {
                        id: 'photo',
                        type: 'image',
                        src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600',
                        transform: { x: 0, y: 0, width: 1080, height: 800, rotation: 0 },
                        fit: 'cover',
                        opacity: 1,
                        flip: { horizontal: false, vertical: false },
                        filters: { contrast: 10, brightness: 0, saturation: 10, blur: 0 },
                    },
                    {
                        id: 'title',
                        type: 'text',
                        content: 'Escape to Paradise',
                        transform: { x: 100, y: 860, width: 880, height: 100, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 64,
                        fontWeight: 800,
                        fill: '#0f172a',
                        align: 'center',
                    },
                    {
                        id: 'subtitle',
                        type: 'text',
                        content: 'Maldives • Summer 2025',
                        transform: { x: 100, y: 970, width: 880, height: 60, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 32,
                        fontWeight: 400,
                        fill: '#475569',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            title: 'Escape to Paradise',
            subtitle: 'Maldives • Summer 2025',
            image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600',
        },
    },
    {
        version: 1,
        title: 'Adventure Promo – Mountain Trek',
        slug: 'travel-adventure-1',
        category: 'travel',
        tags: ['adventure', 'mountain', 'trek'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #0ea5e9, #22c55e)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(34,197,94,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Adventure Promo',
                size: { width: 1080, height: 1350 },
                background: {
                    kind: 'gradient',
                    gradient: {
                        type: 'linear',
                        angle: 120,
                        stops: [
                            { at: 0, color: '#0ea5e9' },
                            { at: 1, color: '#22c55e' },
                        ],
                    },
                },
                layers: [
                    {
                        id: 'photo',
                        type: 'image',
                        src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1600',
                        transform: { x: 100, y: 200, width: 880, height: 600, rotation: 0 },
                        fit: 'cover',
                        opacity: 0.8,
                        flip: { horizontal: false, vertical: false },
                        filters: { contrast: 0, brightness: 0, saturation: 0, blur: 0 },
                    },
                    {
                        id: 'title',
                        type: 'text',
                        content: 'Adventure Awaits',
                        transform: { x: 100, y: 880, width: 880, height: 100, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 72,
                        fontWeight: 900,
                        fill: '#ffffff',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            title: 'Adventure Awaits',
            image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1600',
            gradient: ['#0ea5e9', '#22c55e'],
        },
    },
    {
        version: 1,
        title: 'Real Estate – Property Flyer',
        slug: 'realestate-flyer-1',
        category: 'realestate',
        tags: ['property', 'flyer', 'agent'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(37,99,235,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Property Flyer',
                size: { width: 1080, height: 1350 },
                background: { kind: 'color', value: '#ffffff' },
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
                        content: 'Luxury Villa for Sale',
                        transform: { x: 100, y: 760, width: 880, height: 100, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 56,
                        fontWeight: 800,
                        fill: '#0f172a',
                        align: 'center',
                    },
                    {
                        id: 'price',
                        type: 'text',
                        content: '$2,300,000',
                        transform: { x: 100, y: 870, width: 880, height: 80, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 48,
                        fontWeight: 600,
                        fill: '#2563eb',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            title: 'Luxury Villa for Sale',
            price: '$2,300,000',
            image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600',
        },
    },
    {
        version: 1,
        title: 'Real Estate – Open House',
        slug: 'realestate-open-1',
        category: 'realestate',
        tags: ['real estate', 'poster', 'event'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #f43f5e, #fb923c)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(251,146,60,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Open House Poster',
                size: { width: 1080, height: 1350 },
                background: {
                    kind: 'gradient',
                    gradient: {
                        type: 'linear',
                        angle: 135,
                        stops: [
                            { at: 0, color: '#f43f5e' },
                            { at: 1, color: '#fb923c' },
                        ],
                    },
                },
                layers: [
                    {
                        id: 'photo',
                        type: 'image',
                        src: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=1600',
                        transform: { x: 100, y: 160, width: 880, height: 600, rotation: 0 },
                        fit: 'cover',
                        opacity: 0.9,
                        flip: { horizontal: false, vertical: false },
                        filters: { contrast: 0, brightness: 0, saturation: 0, blur: 0 },
                    },
                    {
                        id: 'title',
                        type: 'text',
                        content: 'Open House Weekend',
                        transform: { x: 100, y: 820, width: 880, height: 100, rotation: 0 },
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
            title: 'Open House Weekend',
            image: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=1600',
            gradient: ['#f43f5e', '#fb923c'],
        },
    },
    {
        version: 1,
        title: 'Photography Portfolio – Clean Banner',
        slug: 'photo-banner-1',
        category: 'photography',
        tags: ['portfolio', 'banner', 'photography'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #111827, #0f172a)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(17,24,39,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Photography Banner',
                size: { width: 1920, height: 1080 },
                background: { kind: 'color', value: '#000000' },
                layers: [
                    {
                        id: 'main-img',
                        type: 'image',
                        src: 'https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?w=1600',
                        transform: { x: 0, y: 0, width: 1920, height: 1080, rotation: 0 },
                        fit: 'cover',
                        opacity: 0.75,
                        flip: { horizontal: false, vertical: false },
                        filters: { contrast: 0, brightness: 0, saturation: 0, blur: 0 },
                    },
                    {
                        id: 'text',
                        type: 'text',
                        content: 'Alex Carter Photography',
                        transform: { x: 200, y: 480, width: 1520, height: 120, rotation: 0 },
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
            text: 'Alex Carter Photography',
            image: 'https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?w=1600',
        },
    },
];

export const TRAVEL_REALESTATE_PHOTOGRAPHY_RECORD: Record<string, Record<string, unknown>> =
    TRAVEL_REALESTATE_PHOTOGRAPHY_TEMPLATES.reduce(
        (acc, template) => {
            acc[template.slug] = template;
            return acc;
        },
        {} as Record<string, Record<string, unknown>>
    );

