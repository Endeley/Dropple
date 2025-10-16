export const EDUCATION_RESUME_MARKETING_INVOICES_TEMPLATES = [
    {
        version: 1,
        title: 'Education Certificate – Classic',
        slug: 'education-certificate-1',
        category: 'education',
        tags: ['certificate', 'award', 'achievement'],
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
                name: 'Certificate',
                size: { width: 1600, height: 1130 },
                background: { kind: 'color', value: '#ffffff' },
                layers: [
                    {
                        id: 'border',
                        type: 'shape',
                        shape: 'rect',
                        transform: { x: 40, y: 40, width: 1520, height: 1050, rotation: 0 },
                        fill: { kind: 'solid', color: '#f1f5f9' },
                        stroke: { color: '#1e293b', width: 8 },
                    },
                    {
                        id: 'title',
                        type: 'text',
                        content: 'Certificate of Completion',
                        transform: { x: 200, y: 200, width: 1200, height: 100, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 64,
                        fontWeight: 800,
                        fill: '#1e293b',
                        align: 'center',
                    },
                    {
                        id: 'name',
                        type: 'text',
                        content: 'Awarded to: John Doe',
                        transform: { x: 200, y: 420, width: 1200, height: 80, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 48,
                        fontWeight: 600,
                        fill: '#0f172a',
                        align: 'center',
                    },
                    {
                        id: 'subtitle',
                        type: 'text',
                        content: 'For successfully completing the course “Modern UI Design”',
                        transform: { x: 200, y: 540, width: 1200, height: 60, rotation: 0 },
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
            title: 'Certificate of Completion',
            name: 'John Doe',
            subtitle: 'For successfully completing the course “Modern UI Design”',
        },
    },
    {
        version: 1,
        title: 'Education – Class Schedule',
        slug: 'education-schedule-1',
        category: 'education',
        tags: ['schedule', 'timetable', 'student'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #1e40af, #38bdf8)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(56,189,248,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Class Schedule',
                size: { width: 1200, height: 800 },
                background: { kind: 'color', value: '#f8fafc' },
                layers: [
                    {
                        id: 'title',
                        type: 'text',
                        content: 'Weekly Class Schedule',
                        transform: { x: 100, y: 60, width: 1000, height: 80, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 52,
                        fontWeight: 800,
                        fill: '#1e40af',
                        align: 'center',
                    },
                    {
                        id: 'table',
                        type: 'shape',
                        shape: 'rect',
                        transform: { x: 100, y: 180, width: 1000, height: 560, rotation: 0 },
                        fill: { kind: 'solid', color: '#ffffff' },
                        stroke: { color: '#e2e8f0', width: 2 },
                    },
                ],
            },
        ],
        editableData: {
            title: 'Weekly Class Schedule',
        },
    },
    {
        version: 1,
        title: 'Resume – Professional',
        slug: 'resume-pro-1',
        category: 'resume',
        tags: ['resume', 'cv', 'professional'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #1e3a8a, #475569)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(71,85,105,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Professional Resume',
                size: { width: 1200, height: 1600 },
                background: { kind: 'color', value: '#ffffff' },
                layers: [
                    {
                        id: 'sidebar',
                        type: 'shape',
                        shape: 'rect',
                        transform: { x: 0, y: 0, width: 350, height: 1600, rotation: 0 },
                        fill: { kind: 'solid', color: '#1e3a8a' },
                    },
                    {
                        id: 'name',
                        type: 'text',
                        content: 'Sarah Johnson',
                        transform: { x: 400, y: 160, width: 700, height: 80, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 56,
                        fontWeight: 800,
                        fill: '#1e293b',
                    },
                    {
                        id: 'role',
                        type: 'text',
                        content: 'Product Designer',
                        transform: { x: 400, y: 240, width: 700, height: 60, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 28,
                        fontWeight: 600,
                        fill: '#475569',
                    },
                ],
            },
        ],
        editableData: {
            name: 'Sarah Johnson',
            role: 'Product Designer',
            accentColor: '#1e3a8a',
        },
    },
    {
        version: 1,
        title: 'Resume – Creative Gradient',
        slug: 'resume-creative-1',
        category: 'resume',
        tags: ['resume', 'creative', 'gradient'],
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
                name: 'Creative Resume',
                size: { width: 1200, height: 1600 },
                background: {
                    kind: 'gradient',
                    gradient: {
                        type: 'linear',
                        angle: 135,
                        stops: [
                            { at: 0, color: '#0ea5e9' },
                            { at: 1, color: '#22c55e' },
                        ],
                    },
                },
                layers: [
                    {
                        id: 'name',
                        type: 'text',
                        content: 'Marcus Lee',
                        transform: { x: 400, y: 160, width: 700, height: 80, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 56,
                        fontWeight: 800,
                        fill: '#ffffff',
                    },
                    {
                        id: 'role',
                        type: 'text',
                        content: 'Frontend Developer',
                        transform: { x: 400, y: 240, width: 700, height: 60, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 28,
                        fontWeight: 500,
                        fill: '#f1f5f9',
                    },
                ],
            },
        ],
        editableData: {
            name: 'Marcus Lee',
            role: 'Frontend Developer',
            gradient: ['#0ea5e9', '#22c55e'],
        },
    },
    {
        version: 1,
        title: 'Marketing Poster – Bold Launch',
        slug: 'marketing-poster-1',
        category: 'marketing',
        tags: ['poster', 'ad', 'launch'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(124,58,237,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Marketing Poster',
                size: { width: 1080, height: 1350 },
                background: {
                    kind: 'gradient',
                    gradient: {
                        type: 'linear',
                        angle: 135,
                        stops: [
                            { at: 0, color: '#7c3aed' },
                            { at: 1, color: '#2563eb' },
                        ],
                    },
                },
                layers: [
                    {
                        id: 'title',
                        type: 'text',
                        content: 'New Campaign 2025',
                        transform: { x: 100, y: 820, width: 880, height: 100, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 68,
                        fontWeight: 900,
                        fill: '#ffffff',
                        align: 'center',
                    },
                    {
                        id: 'subtitle',
                        type: 'text',
                        content: 'Bold Ideas Drive Big Results',
                        transform: { x: 100, y: 920, width: 880, height: 60, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 36,
                        fontWeight: 500,
                        fill: '#e0e7ff',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            title: 'New Campaign 2025',
            subtitle: 'Bold Ideas Drive Big Results',
            gradient: ['#7c3aed', '#2563eb'],
        },
    },
    {
        version: 1,
        title: 'Marketing Email – Modern Layout',
        slug: 'marketing-email-1',
        category: 'marketing',
        tags: ['email', 'newsletter', 'business'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(56,189,248,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Marketing Email',
                size: { width: 800, height: 1200 },
                background: { kind: 'color', value: '#ffffff' },
                layers: [
                    {
                        id: 'header',
                        type: 'shape',
                        shape: 'rect',
                        transform: { x: 0, y: 0, width: 800, height: 200, rotation: 0 },
                        fill: { kind: 'solid', color: '#2563eb' },
                    },
                    {
                        id: 'headline',
                        type: 'text',
                        content: 'Monthly Insights from Dropple',
                        transform: { x: 100, y: 240, width: 600, height: 80, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 36,
                        fontWeight: 700,
                        fill: '#0f172a',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            title: 'Monthly Insights from Dropple',
            accentColor: '#2563eb',
        },
    },
    {
        version: 1,
        title: 'Invoice – Simple Clean',
        slug: 'invoice-simple-1',
        category: 'invoice',
        tags: ['invoice', 'finance', 'billing'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(37,99,235,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Invoice',
                size: { width: 1200, height: 1600 },
                background: { kind: 'color', value: '#ffffff' },
                layers: [
                    {
                        id: 'header',
                        type: 'shape',
                        shape: 'rect',
                        transform: { x: 0, y: 0, width: 1200, height: 180, rotation: 0 },
                        fill: { kind: 'solid', color: '#2563eb' },
                    },
                    {
                        id: 'title',
                        type: 'text',
                        content: 'INVOICE',
                        transform: { x: 100, y: 60, width: 1000, height: 80, rotation: 0 },
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
            title: 'INVOICE',
            accentColor: '#2563eb',
        },
    },
];

export const EDUCATION_RESUME_MARKETING_INVOICES_RECORD: Record<string, Record<string, unknown>> =
    EDUCATION_RESUME_MARKETING_INVOICES_TEMPLATES.reduce(
        (acc, template) => {
            acc[template.slug] = template;
            return acc;
        },
        {} as Record<string, Record<string, unknown>>
    );

