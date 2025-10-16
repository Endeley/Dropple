export const INFOGRAPHICS_DATA_TEMPLATES = [
    {
        version: 1,
        title: 'Process Flow – 3 Steps',
        slug: 'infographic-process-1',
        category: 'enterprise',
        tags: ['infographic', 'process', 'workflow'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #1d4ed8, #60a5fa)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(37,99,235,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Process Flow',
                size: { width: 1920, height: 1080 },
                background: { kind: 'color', value: '#ffffff' },
                layers: [
                    {
                        id: 'connector-1',
                        type: 'shape',
                        shape: 'rect',
                        transform: { x: 480, y: 485, width: 340, height: 10, rotation: 0 },
                        fill: { kind: 'solid', color: '#cbd5f5' },
                    },
                    {
                        id: 'connector-2',
                        type: 'shape',
                        shape: 'rect',
                        transform: { x: 1050, y: 485, width: 340, height: 10, rotation: 0 },
                        fill: { kind: 'solid', color: '#cbd5f5' },
                    },
                    {
                        id: 'step1',
                        type: 'shape',
                        shape: 'ellipse',
                        transform: { x: 260, y: 360, width: 240, height: 240, rotation: 0 },
                        fill: { kind: 'solid', color: '#2563eb' },
                    },
                    {
                        id: 'step1-text',
                        type: 'text',
                        content: 'Research',
                        transform: { x: 250, y: 620, width: 260, height: 60, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 32,
                        fontWeight: 600,
                        fill: '#1e293b',
                        align: 'center',
                    },
                    {
                        id: 'step2',
                        type: 'shape',
                        shape: 'ellipse',
                        transform: { x: 830, y: 360, width: 240, height: 240, rotation: 0 },
                        fill: { kind: 'solid', color: '#3b82f6' },
                    },
                    {
                        id: 'step2-text',
                        type: 'text',
                        content: 'Design',
                        transform: { x: 820, y: 620, width: 260, height: 60, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 32,
                        fontWeight: 600,
                        fill: '#1e293b',
                        align: 'center',
                    },
                    {
                        id: 'step3',
                        type: 'shape',
                        shape: 'ellipse',
                        transform: { x: 1400, y: 360, width: 240, height: 240, rotation: 0 },
                        fill: { kind: 'solid', color: '#60a5fa' },
                    },
                    {
                        id: 'step3-text',
                        type: 'text',
                        content: 'Launch',
                        transform: { x: 1390, y: 620, width: 260, height: 60, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 32,
                        fontWeight: 600,
                        fill: '#1e293b',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            steps: ['Research', 'Design', 'Launch'],
            colors: ['#2563eb', '#3b82f6', '#60a5fa'],
        },
    },
    {
        version: 1,
        title: 'Pie Chart – Business Metrics',
        slug: 'infographic-pie-1',
        category: 'enterprise',
        tags: ['infographic', 'chart', 'data'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(34,197,94,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Pie Chart',
                size: { width: 1920, height: 1080 },
                background: { kind: 'color', value: '#f8fafc' },
                layers: [
                    {
                        id: 'circle-bg',
                        type: 'shape',
                        shape: 'ellipse',
                        transform: { x: 720, y: 200, width: 480, height: 480, rotation: 0 },
                        fill: { kind: 'solid', color: '#e2e8f0' },
                    },
                    {
                        id: 'segment1',
                        type: 'shape',
                        shape: 'rect',
                        transform: { x: 960, y: 200, width: 240, height: 240, rotation: 45 },
                        fill: { kind: 'solid', color: '#22c55e' },
                    },
                    {
                        id: 'segment2',
                        type: 'shape',
                        shape: 'rect',
                        transform: { x: 760, y: 360, width: 220, height: 220, rotation: 120 },
                        fill: { kind: 'solid', color: '#f59e0b' },
                    },
                    {
                        id: 'segment3',
                        type: 'shape',
                        shape: 'rect',
                        transform: { x: 820, y: 220, width: 260, height: 260, rotation: -15 },
                        fill: { kind: 'solid', color: '#ef4444' },
                    },
                    {
                        id: 'inner-circle',
                        type: 'shape',
                        shape: 'ellipse',
                        transform: { x: 780, y: 260, width: 360, height: 360, rotation: 0 },
                        fill: { kind: 'solid', color: '#f8fafc' },
                    },
                    {
                        id: 'legend',
                        type: 'text',
                        content: 'Marketing 40%  •  Sales 30%  •  Product 30%',
                        transform: { x: 500, y: 800, width: 920, height: 100, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 32,
                        fontWeight: 500,
                        fill: '#1e293b',
                        align: 'center',
                    },
                ],
            },
        ],
        editableData: {
            data: [
                { label: 'Marketing', value: 40, color: '#22c55e' },
                { label: 'Sales', value: 30, color: '#f59e0b' },
                { label: 'Product', value: 30, color: '#ef4444' },
            ],
        },
    },
    {
        version: 1,
        title: 'Comparison Chart – Before & After',
        slug: 'infographic-compare-1',
        category: 'enterprise',
        tags: ['infographic', 'comparison', 'data'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(59,130,246,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Comparison Chart',
                size: { width: 1920, height: 1080 },
                background: { kind: 'color', value: '#ffffff' },
                layers: [
                    {
                        id: 'title',
                        type: 'text',
                        content: 'Performance Comparison',
                        transform: { x: 200, y: 100, width: 1520, height: 80, rotation: 0 },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 56,
                        fontWeight: 800,
                        fill: '#1e293b',
                        align: 'center',
                    },
                    {
                        id: 'bar-left',
                        type: 'shape',
                        shape: 'rect',
                        transform: { x: 480, y: 400, width: 300, height: 200, rotation: 0 },
                        fill: { kind: 'solid', color: '#22c55e' },
                    },
                    {
                        id: 'bar-right',
                        type: 'shape',
                        shape: 'rect',
                        transform: { x: 1140, y: 280, width: 300, height: 320, rotation: 0 },
                        fill: { kind: 'solid', color: '#3b82f6' },
                    },
                ],
            },
        ],
        editableData: {
            title: 'Performance Comparison',
            values: [
                { label: '2024', value: 60, color: '#22c55e' },
                { label: '2025', value: 90, color: '#3b82f6' },
            ],
        },
    },
    {
        version: 1,
        title: 'KPI Dashboard – Summary Cards',
        slug: 'infographic-kpi-1',
        category: 'enterprise',
        tags: ['dashboard', 'kpi', 'summary'],
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
                name: 'KPI Dashboard',
                size: { width: 1920, height: 1080 },
                background: { kind: 'color', value: '#f9fafb' },
                layers: [
                    {
                        id: 'card1',
                        type: 'shape',
                        shape: 'rect',
                        transform: { x: 200, y: 300, width: 400, height: 300, rotation: 0 },
                        fill: { kind: 'solid', color: '#e0f2fe' },
                    },
                    {
                        id: 'card2',
                        type: 'shape',
                        shape: 'rect',
                        transform: { x: 760, y: 300, width: 400, height: 300, rotation: 0 },
                        fill: { kind: 'solid', color: '#dcfce7' },
                    },
                    {
                        id: 'card3',
                        type: 'shape',
                        shape: 'rect',
                        transform: { x: 1320, y: 300, width: 400, height: 300, rotation: 0 },
                        fill: { kind: 'solid', color: '#fee2e2' },
                    },
                ],
            },
        ],
        editableData: {
            metrics: [
                { label: 'Revenue', value: '$25K', color: '#38bdf8' },
                { label: 'Active Users', value: '4.2K', color: '#22c55e' },
                { label: 'Expenses', value: '$8.4K', color: '#ef4444' },
            ],
        },
    },
    {
        version: 1,
        title: 'Timeline – Project Progress',
        slug: 'infographic-timeline-1',
        category: 'enterprise',
        tags: ['timeline', 'progress', 'milestones'],
        thumbnail: {
            type: 'css',
            style: {
                background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(15,23,42,0.25)',
            },
        },
        defaultArtboardId: 'canvas-1',
        artboards: [
            {
                id: 'canvas-1',
                name: 'Timeline',
                size: { width: 1920, height: 1080 },
                background: { kind: 'color', value: '#ffffff' },
                layers: [
                    {
                        id: 'line',
                        type: 'shape',
                        shape: 'rect',
                        transform: { x: 200, y: 540, width: 1520, height: 12, rotation: 0 },
                        fill: { kind: 'solid', color: '#94a3b8' },
                    },
                    {
                        id: 'milestone1',
                        type: 'shape',
                        shape: 'ellipse',
                        transform: { x: 260, y: 500, width: 96, height: 96, rotation: 0 },
                        fill: { kind: 'solid', color: '#22c55e' },
                    },
                    {
                        id: 'milestone2',
                        type: 'shape',
                        shape: 'ellipse',
                        transform: { x: 900, y: 500, width: 96, height: 96, rotation: 0 },
                        fill: { kind: 'solid', color: '#3b82f6' },
                    },
                    {
                        id: 'milestone3',
                        type: 'shape',
                        shape: 'ellipse',
                        transform: { x: 1520, y: 500, width: 96, height: 96, rotation: 0 },
                        fill: { kind: 'solid', color: '#f59e0b' },
                    },
                ],
            },
        ],
        editableData: {
            milestones: [
                { name: 'Planning', color: '#22c55e' },
                { name: 'Execution', color: '#3b82f6' },
                { name: 'Delivery', color: '#f59e0b' },
            ],
        },
    },
];

export const INFOGRAPHICS_DATA_RECORD: Record<string, Record<string, unknown>> = INFOGRAPHICS_DATA_TEMPLATES.reduce(
    (acc, template) => {
        acc[template.slug] = template;
        return acc;
    },
    {} as Record<string, Record<string, unknown>>
);

