export const ECOMMERCE_EDUCATION_TEMPLATES = [
    {
        version: 1,
        title: 'E-commerce Product Card – Modern Clean',
        slug: 'ecommerce-product-card-1',
        category: 'ecommerce',
        tags: ['product', 'card', 'clean'],
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                size: { width: 1080, height: 1350 },
                background: { kind: 'color', value: '#ffffff' },
                layers: [
                    {
                        id: 'photo',
                        type: 'image',
                        src: 'https://images.unsplash.com/photo-1585386959984-a41552231693?w=1200',
                        transform: { x: 0, y: 0, width: 1080, height: 800, rotation: 0 },
                        fit: 'cover',
                        flip: { horizontal: false, vertical: false },
                        filters: { contrast: 0, brightness: 0, saturation: 0, blur: 0 },
                        opacity: 1,
                    },
                    {
                        id: 'title',
                        type: 'text',
                        content: 'Wireless Headphones',
                        transform: { x: 100, y: 860, width: 880, height: 80, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 48,
                        fontWeight: 700,
                        fill: '#1e293b',
                        align: 'center',
                    },
                    {
                        id: 'price',
                        type: 'text',
                        content: '$129.99',
                        transform: { x: 100, y: 960, width: 880, height: 60, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 36,
                        fontWeight: 600,
                        fill: '#16a34a',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            title: 'Wireless Headphones',
            price: '$129.99',
            accentColor: '#16a34a',
        },
    },
    {
        version: 1,
        title: 'E-commerce Sale Banner – Fashion',
        slug: 'ecommerce-sale-banner-1',
        category: 'ecommerce',
        tags: ['sale', 'banner', 'fashion'],
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                size: { width: 1200, height: 600 },
                background: {
                    kind: 'gradient',
                    gradient: {
                        type: 'linear',
                        angle: 120,
                        stops: [
                            { at: 0, color: '#f43f5e' },
                            { at: 1, color: '#fb923c' },
                        ],
                    },
                },
                layers: [
                    {
                        id: 'headline',
                        type: 'text',
                        content: '50% OFF New Arrivals',
                        transform: { x: 80, y: 240, width: 1040, height: 100, rotation: 0 },
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
            title: '50% OFF New Arrivals',
            accentColor: '#f43f5e',
        },
    },
    {
        version: 1,
        title: 'E-commerce Email Receipt – Minimal',
        slug: 'ecommerce-email-receipt-1',
        category: 'ecommerce',
        tags: ['email', 'receipt', 'minimal'],
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                size: { width: 800, height: 1000 },
                background: { kind: 'color', value: '#f9fafb' },
                layers: [
                    {
                        id: 'logo',
                        type: 'image',
                        src: 'https://images.unsplash.com/photo-1629904853698-eef7db4b8a6a?w=600',
                        transform: { x: 60, y: 60, width: 100, height: 100, rotation: 0 },
                        fit: 'cover',
                        flip: { horizontal: false, vertical: false },
                        filters: { contrast: 0, brightness: 0, saturation: 0, blur: 0 },
                    },
                    {
                        id: 'title',
                        type: 'text',
                        content: 'Order Confirmation',
                        transform: { x: 200, y: 80, width: 540, height: 80, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 36,
                        fontWeight: 700,
                        fill: '#1e293b',
                    },
                ],
            },
        ],
        editableData: {
            title: 'Order Confirmation',
        },
    },
    {
        version: 1,
        title: 'E-commerce Product Showcase – Lifestyle',
        slug: 'ecommerce-product-showcase-1',
        category: 'ecommerce',
        tags: ['product', 'showcase', 'lifestyle'],
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                size: { width: 1080, height: 1080 },
                background: { kind: 'color', value: '#ffffff' },
                layers: [
                    {
                        id: 'photo',
                        type: 'image',
                        src: 'https://images.unsplash.com/photo-1606813902912-5e6e4e9e3a43?w=1200',
                        transform: { x: 0, y: 0, width: 1080, height: 1080, rotation: 0 },
                        fit: 'cover',
                        opacity: 0.7,
                        flip: { horizontal: false, vertical: false },
                        filters: { contrast: 0, brightness: 0, saturation: 0, blur: 0 },
                    },
                    {
                        id: 'title',
                        type: 'text',
                        content: 'Minimalist Backpack',
                        transform: { x: 80, y: 860, width: 920, height: 80, rotation: 0 },
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
            title: 'Minimalist Backpack',
        },
    },
    {
        version: 1,
        title: 'E-commerce Pricing Table – Gradient',
        slug: 'ecommerce-pricing-table-1',
        category: 'ecommerce',
        tags: ['pricing', 'table', 'gradient'],
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                size: { width: 1080, height: 1080 },
                background: {
                    kind: 'gradient',
                    gradient: {
                        type: 'linear',
                        angle: 135,
                        stops: [
                            { at: 0, color: '#3b82f6' },
                            { at: 1, color: '#22d3ee' },
                        ],
                    },
                },
                layers: [
                    {
                        id: 'plan',
                        type: 'text',
                        content: 'Pro Plan – $29 / mo',
                        transform: { x: 80, y: 480, width: 920, height: 120, rotation: 0 },
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
            title: 'Pro Plan – $29 / mo',
            accentColor: '#3b82f6',
        },
    },
    {
        version: 1,
        title: 'Education Certificate – Classic Gold',
        slug: 'education-certificate-gold-1',
        category: 'education',
        tags: ['certificate', 'award', 'classic'],
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                size: { width: 1080, height: 1528 },
                background: { kind: 'color', value: '#fffbea' },
                layers: [
                    {
                        id: 'border',
                        type: 'shape',
                        shape: 'rect',
                        transform: { x: 40, y: 40, width: 1000, height: 1448, rotation: 0 },
                        fill: { kind: 'solid', color: '#facc15' },
                    },
                    {
                        id: 'title',
                        type: 'text',
                        content: 'Certificate of Achievement',
                        transform: { x: 100, y: 260, width: 880, height: 100, rotation: 0 },
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
            title: 'Certificate of Achievement',
            accentColor: '#facc15',
        },
    },
    {
        version: 1,
        title: 'Education Report Card – Simple',
        slug: 'education-report-card-1',
        category: 'education',
        tags: ['report', 'card', 'school'],
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                size: { width: 1080, height: 1528 },
                background: { kind: 'color', value: '#ffffff' },
                layers: [
                    {
                        id: 'title',
                        type: 'text',
                        content: 'Student Progress Report',
                        transform: { x: 100, y: 100, width: 880, height: 80, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 42,
                        fontWeight: 700,
                        fill: '#0f172a',
                    },
                ],
            },
        ],
        editableData: {
            title: 'Student Progress Report',
        },
    },
    {
        version: 1,
        title: 'Education Lesson Plan – Minimal Teal',
        slug: 'education-lesson-plan-1',
        category: 'education',
        tags: ['lesson', 'plan', 'teacher'],
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                size: { width: 1080, height: 1528 },
                background: { kind: 'color', value: '#f0fdfa' },
                layers: [
                    {
                        id: 'header',
                        type: 'shape',
                        shape: 'rect',
                        transform: { x: 0, y: 0, width: 1080, height: 160, rotation: 0 },
                        fill: { kind: 'solid', color: '#14b8a6' },
                    },
                    {
                        id: 'title',
                        type: 'text',
                        content: 'Lesson Plan',
                        transform: { x: 100, y: 60, width: 880, height: 60, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 40,
                        fontWeight: 700,
                        fill: '#ffffff',
                    },
                ],
            },
        ],
        editableData: {
            title: 'Lesson Plan',
            accentColor: '#14b8a6',
        },
    },
    {
        version: 1,
        title: 'Education Class Schedule – Gradient',
        slug: 'education-class-schedule-1',
        category: 'education',
        tags: ['schedule', 'class', 'gradient'],
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                size: { width: 1080, height: 1528 },
                background: {
                    kind: 'gradient',
                    gradient: {
                        type: 'linear',
                        angle: 135,
                        stops: [
                            { at: 0, color: '#6366f1' },
                            { at: 1, color: '#a855f7' },
                        ],
                    },
                },
                layers: [
                    {
                        id: 'title',
                        type: 'text',
                        content: 'Weekly Class Schedule',
                        transform: { x: 100, y: 100, width: 880, height: 80, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 46,
                        fontWeight: 700,
                        fill: '#ffffff',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            title: 'Weekly Class Schedule',
            accentColor: '#6366f1',
        },
    },
    {
        version: 1,
        title: 'Education Study Guide – Blue Accent',
        slug: 'education-study-guide-1',
        category: 'education',
        tags: ['study', 'guide', 'notes'],
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                size: { width: 1080, height: 1528 },
                background: { kind: 'color', value: '#ffffff' },
                layers: [
                    {
                        id: 'header',
                        type: 'shape',
                        shape: 'rect',
                        transform: { x: 0, y: 0, width: 1080, height: 160, rotation: 0 },
                        fill: { kind: 'solid', color: '#3b82f6' },
                    },
                    {
                        id: 'title',
                        type: 'text',
                        content: 'Study Guide',
                        transform: { x: 100, y: 60, width: 880, height: 60, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 42,
                        fontWeight: 700,
                        fill: '#ffffff',
                    },
                ],
            },
        ],
        editableData: {
            title: 'Study Guide',
            accentColor: '#3b82f6',
        },
    },
];

export const ECOMMERCE_EDUCATION_RECORD: Record<string, Record<string, unknown>> = ECOMMERCE_EDUCATION_TEMPLATES.reduce(
    (acc, template) => {
        acc[template.slug] = template;
        return acc;
    },
    {} as Record<string, Record<string, unknown>>
);
