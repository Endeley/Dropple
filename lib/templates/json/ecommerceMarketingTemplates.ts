export const ECOMMERCE_MARKETING_TEMPLATES = [
    {
        version: 1,
        title: 'E-commerce Product Card – Modern',
        slug: 'ecommerce-product-1',
        category: 'ecommerce',
        tags: ['product', 'card', 'shop'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #0f172a, #2563eb)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(37,99,235,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Product Card',
                size: { width: 1080, height: 1350 },
                background: { kind: 'color', value: '#ffffff' },
                layers: [
                    {
                        id: 'photo',
                        type: 'image',
                        src: 'https://images.unsplash.com/photo-1606813902917-9a77fdb56cba?w=1600',
                        transform: { x: 100, y: 100, width: 880, height: 880, rotation: 0 },
                        fit: 'cover',
                        opacity: 1,
                        flip: { horizontal: false, vertical: false },
                        filters: { contrast: 5, brightness: 0, saturation: 0, blur: 0 },
                    },
                    {
                        id: 'title',
                        type: 'text',
                        content: 'Smartwatch X',
                        transform: { x: 100, y: 1040, width: 880, height: 80, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 48,
                        fontWeight: 700,
                        fill: '#0f172a',
                        align: 'center',
                    },
                    {
                        id: 'price',
                        type: 'text',
                        content: '$199',
                        transform: { x: 100, y: 1120, width: 880, height: 60, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 40,
                        fontWeight: 600,
                        fill: '#2563eb',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            title: 'Smartwatch X',
            price: '$199',
            image: 'https://images.unsplash.com/photo-1606813902917-9a77fdb56cba?w=1600',
        },
    },
    {
        version: 1,
        title: 'E-commerce Sale Banner – Gradient',
        slug: 'ecommerce-sale-1',
        category: 'ecommerce',
        tags: ['sale', 'banner', 'discount'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(120deg, #f43f5e, #f97316)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(244,63,94,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Sale Banner',
                size: { width: 1920, height: 600 },
                background: {
                    kind: 'gradient',
                    gradient: {
                        type: 'linear',
                        angle: 120,
                        stops: [
                            { at: 0, color: '#f43f5e' },
                            { at: 1, color: '#f97316' },
                        ],
                    },
                },
                layers: [
                    {
                        id: 'title',
                        type: 'text',
                        content: 'FLASH SALE • 50% OFF',
                        transform: { x: 100, y: 220, width: 1720, height: 120, rotation: 0 },
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
            title: 'FLASH SALE • 50% OFF',
            gradient: ['#f43f5e', '#f97316'],
        },
    },
    {
        version: 1,
        title: 'Email Receipt – Product Purchase',
        slug: 'ecommerce-receipt-1',
        category: 'ecommerce',
        tags: ['email', 'receipt', 'purchase'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #2563eb, #1e3a8a)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(37,99,235,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Receipt Email',
                size: { width: 800, height: 1200 },
                background: { kind: 'color', value: '#ffffff' },
                layers: [
                    {
                        id: 'header',
                        type: 'shape',
                        shape: 'rect',
                        transform: { x: 0, y: 0, width: 800, height: 180, rotation: 0 },
                        fill: { kind: 'solid', color: '#2563eb' },
                    },
                    {
                        id: 'title',
                        type: 'text',
                        content: 'Your Order Confirmation',
                        transform: { x: 100, y: 80, width: 600, height: 60, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 36,
                        fontWeight: 700,
                        fill: '#ffffff',
                        align: 'center',
                    },
                    {
                        id: 'body',
                        type: 'text',
                        content: 'Thank you for purchasing Smartwatch X.\nYour order #2025-1445 has been confirmed.',
                        transform: { x: 100, y: 320, width: 600, height: 200, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 24,
                        fontWeight: 400,
                        fill: '#1e293b',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            title: 'Your Order Confirmation',
            body: 'Thank you for purchasing Smartwatch X.\nYour order #2025-1445 has been confirmed.',
            accentColor: '#2563eb',
        },
    },
    {
        version: 1,
        title: 'E-commerce Product Showcase',
        slug: 'ecommerce-showcase-1',
        category: 'ecommerce',
        tags: ['product', 'grid', 'showcase'],
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
                name: 'Product Showcase',
                size: { width: 1920, height: 1080 },
                background: { kind: 'color', value: '#f8fafc' },
                layers: [
                    {
                        id: 'photo1',
                        type: 'image',
                        src: 'https://images.unsplash.com/photo-1590080875830-91bb9a02c368?w=1200',
                        transform: { x: 200, y: 120, width: 500, height: 500, rotation: 0 },
                        fit: 'cover',
                        opacity: 1,
                        flip: { horizontal: false, vertical: false },
                        filters: { contrast: 0, brightness: 0, saturation: 0, blur: 0 },
                    },
                    {
                        id: 'photo2',
                        type: 'image',
                        src: 'https://images.unsplash.com/photo-1589187155470-2957b34b3d88?w=1200',
                        transform: { x: 1220, y: 120, width: 500, height: 500, rotation: 0 },
                        fit: 'cover',
                        opacity: 1,
                        flip: { horizontal: false, vertical: false },
                        filters: { contrast: 0, brightness: 0, saturation: 0, blur: 0 },
                    },
                    {
                        id: 'title',
                        type: 'text',
                        content: 'Explore Our Summer Collection',
                        transform: { x: 100, y: 720, width: 1720, height: 100, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 56,
                        fontWeight: 800,
                        fill: '#1e293b',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            title: 'Explore Our Summer Collection',
            images: [
                'https://images.unsplash.com/photo-1590080875830-91bb9a02c368?w=1200',
                'https://images.unsplash.com/photo-1589187155470-2957b34b3d88?w=1200',
            ],
        },
    },
    {
        version: 1,
        title: 'Pricing Table – Clean Minimal',
        slug: 'ecommerce-pricing-1',
        category: 'ecommerce',
        tags: ['pricing', 'table', 'plans'],
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
                name: 'Pricing Table',
                size: { width: 1920, height: 1080 },
                background: { kind: 'color', value: '#ffffff' },
                layers: [
                    {
                        id: 'title',
                        type: 'text',
                        content: 'Choose Your Plan',
                        transform: { x: 200, y: 160, width: 1520, height: 100, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 64,
                        fontWeight: 800,
                        fill: '#0f172a',
                        align: 'center',
                    },
                    {
                        id: 'plan-basic',
                        type: 'text',
                        content: 'Basic — $9/mo',
                        transform: { x: 300, y: 420, width: 400, height: 80, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 32,
                        fontWeight: 500,
                        fill: '#475569',
                    },
                    {
                        id: 'plan-pro',
                        type: 'text',
                        content: 'Pro — $29/mo',
                        transform: { x: 1200, y: 420, width: 400, height: 80, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 32,
                        fontWeight: 600,
                        fill: '#2563eb',
                    },
                ],
            },
        ],
        editableData: {
            title: 'Choose Your Plan',
            planBasic: 'Basic — $9/mo',
            planPro: 'Pro — $29/mo',
        },
    },
];

export const ECOMMERCE_MARKETING_RECORD: Record<string, Record<string, unknown>> =
    ECOMMERCE_MARKETING_TEMPLATES.reduce(
        (acc, template) => {
            acc[template.slug] = template;
            return acc;
        },
        {} as Record<string, Record<string, unknown>>
    );

