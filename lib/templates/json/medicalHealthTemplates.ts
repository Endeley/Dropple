export const MEDICAL_HEALTH_TEMPLATES = [
    {
        version: 1,
        title: 'Clinic Flyer – Health Care',
        slug: 'medical-flyer-1',
        category: 'medical',
        tags: ['clinic', 'flyer', 'health'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(14,165,233,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Clinic Flyer',
                size: { width: 1080, height: 1350 },
                background: { kind: 'color', value: '#ffffff' },
                layers: [
                    {
                        id: 'photo',
                        type: 'image',
                        src: 'https://images.unsplash.com/photo-1588776814546-ec76bdf5f1a4?w=1600',
                        transform: { x: 0, y: 0, width: 1080, height: 600, rotation: 0 },
                        fit: 'cover',
                        opacity: 1,
                        flip: { horizontal: false, vertical: false },
                        filters: { contrast: 0, brightness: 0, saturation: 0, blur: 0 },
                    },
                    {
                        id: 'title',
                        type: 'text',
                        content: 'Your Health, Our Priority',
                        transform: { x: 100, y: 680, width: 880, height: 100, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 64,
                        fontWeight: 800,
                        fill: '#0f172a',
                        align: 'center',
                    },
                    {
                        id: 'subtitle',
                        type: 'text',
                        content: '24/7 Medical Care • Professional Doctors • Emergency Support',
                        transform: { x: 100, y: 800, width: 880, height: 60, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 28,
                        fontWeight: 400,
                        fill: '#475569',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            title: 'Your Health, Our Priority',
            subtitle: '24/7 Medical Care • Professional Doctors • Emergency Support',
            image: 'https://images.unsplash.com/photo-1588776814546-ec76bdf5f1a4?w=1600',
        },
    },
    {
        version: 1,
        title: 'Medical Email – Appointment Reminder',
        slug: 'medical-email-1',
        category: 'medical',
        tags: ['email', 'reminder', 'appointment'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #06b6d4, #0ea5e9)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(6,182,212,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Appointment Email',
                size: { width: 800, height: 1200 },
                background: { kind: 'color', value: '#f9fafb' },
                layers: [
                    {
                        id: 'header',
                        type: 'shape',
                        shape: 'rect',
                        transform: { x: 0, y: 0, width: 800, height: 200, rotation: 0 },
                        fill: { kind: 'solid', color: '#06b6d4' },
                    },
                    {
                        id: 'title',
                        type: 'text',
                        content: 'Appointment Reminder',
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
                        content:
                            'Dear John, this is a reminder for your appointment on Monday, 10 AM at City Clinic.',
                        transform: { x: 100, y: 280, width: 600, height: 200, rotation: 0 },
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
            title: 'Appointment Reminder',
            body: 'Dear John, this is a reminder for your appointment on Monday, 10 AM at City Clinic.',
            accentColor: '#06b6d4',
        },
    },
    {
        version: 1,
        title: 'Wellness Poster – Healthy Living',
        slug: 'health-wellness-1',
        category: 'medical',
        tags: ['wellness', 'poster', 'health'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #22c55e, #84cc16)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(34,197,94,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Wellness Poster',
                size: { width: 1080, height: 1350 },
                background: {
                    kind: 'gradient',
                    gradient: {
                        type: 'linear',
                        angle: 135,
                        stops: [
                            { at: 0, color: '#22c55e' },
                            { at: 1, color: '#84cc16' },
                        ],
                    },
                },
                layers: [
                    {
                        id: 'title',
                        type: 'text',
                        content: 'Eat Green, Live Clean',
                        transform: { x: 100, y: 580, width: 880, height: 120, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 72,
                        fontWeight: 900,
                        fill: '#ffffff',
                        align: 'center',
                    },
                    {
                        id: 'subtitle',
                        type: 'text',
                        content: '#HealthyLife',
                        transform: { x: 100, y: 720, width: 880, height: 80, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 40,
                        fontWeight: 600,
                        fill: '#dcfce7',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            title: 'Eat Green, Live Clean',
            subtitle: '#HealthyLife',
            gradient: ['#22c55e', '#84cc16'],
        },
    },
    {
        version: 1,
        title: 'Pharmacy Ad – Discount Poster',
        slug: 'medical-pharmacy-1',
        category: 'medical',
        tags: ['pharmacy', 'discount', 'poster'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #0ea5e9, #155e75)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(21,94,117,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Pharmacy Poster',
                size: { width: 1080, height: 1350 },
                background: { kind: 'color', value: '#ecfeff' },
                layers: [
                    {
                        id: 'photo',
                        type: 'image',
                        src: 'https://images.unsplash.com/photo-1580281657527-47d8b1d3e1e8?w=1600',
                        transform: { x: 100, y: 160, width: 880, height: 600, rotation: 0 },
                        fit: 'cover',
                        opacity: 1,
                        flip: { horizontal: false, vertical: false },
                        filters: { contrast: 0, brightness: 0, saturation: 0, blur: 0 },
                    },
                    {
                        id: 'title',
                        type: 'text',
                        content: 'Get Up to 30% Off Medicines',
                        transform: { x: 100, y: 820, width: 880, height: 100, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 60,
                        fontWeight: 800,
                        fill: '#0e7490',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            title: 'Get Up to 30% Off Medicines',
            image: 'https://images.unsplash.com/photo-1580281657527-47d8b1d3e1e8?w=1600',
        },
    },
    {
        version: 1,
        title: 'Yoga Class – Mind & Body Balance',
        slug: 'health-yoga-1',
        category: 'medical',
        tags: ['yoga', 'wellness', 'class'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #7dd3fc, #38bdf8)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(56,189,248,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Yoga Poster',
                size: { width: 1080, height: 1350 },
                background: {
                    kind: 'gradient',
                    gradient: {
                        type: 'linear',
                        angle: 120,
                        stops: [
                            { at: 0, color: '#7dd3fc' },
                            { at: 1, color: '#38bdf8' },
                        ],
                    },
                },
                layers: [
                    {
                        id: 'photo',
                        type: 'image',
                        src: 'https://images.unsplash.com/photo-1554306274-f23873d9a26d?w=1600',
                        transform: { x: 200, y: 200, width: 680, height: 600, rotation: 0 },
                        fit: 'cover',
                        opacity: 0.8,
                        flip: { horizontal: false, vertical: false },
                        filters: { contrast: 0, brightness: 0, saturation: 0, blur: 0 },
                    },
                    {
                        id: 'title',
                        type: 'text',
                        content: 'Mind & Body Balance',
                        transform: { x: 100, y: 860, width: 880, height: 100, rotation: 0 },
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
            title: 'Mind & Body Balance',
            image: 'https://images.unsplash.com/photo-1554306274-f23873d9a26d?w=1600',
            gradient: ['#7dd3fc', '#38bdf8'],
        },
    },
];

export const MEDICAL_HEALTH_RECORD: Record<string, Record<string, unknown>> = MEDICAL_HEALTH_TEMPLATES.reduce(
    (acc, template) => {
        acc[template.slug] = template;
        return acc;
    },
    {} as Record<string, Record<string, unknown>>
);

