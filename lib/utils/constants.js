export const DEVICE_PRESETS = [
    { id: 'desktop', label: 'Desktop', width: 1440, height: 900 },
    { id: 'tablet', label: 'Tablet', width: 768, height: 1024 },
    { id: 'mobile', label: 'Mobile', width: 390, height: 844 },
];

export const DEFAULT_DEVICE = DEVICE_PRESETS[0];

export const TEMPLATE_PRESETS = [
    {
        id: 'blank',
        kind: 'blank',
        label: 'Blank Canvas',
        description: 'Start from scratch with an empty artboard.',
        addVisible: true,
        libraryVisible: false,
        device: { ...DEFAULT_DEVICE },
    },
    {
        id: 'saas',
        kind: 'saas',
        label: 'SaaS Landing',
        description: 'Hero, benefits checklist, pricing, and CTA.',
        addVisible: true,
        libraryVisible: true,
        device: { ...DEFAULT_DEVICE },
    },
    {
        id: 'analytics',
        kind: 'analytics',
        label: 'Analytics Dashboard',
        description: 'Filters, KPI cards, charts, and table.',
        addVisible: true,
        libraryVisible: true,
        device: { ...DEFAULT_DEVICE },
    },
    {
        id: 'portfolio',
        kind: 'portfolio',
        label: 'Portfolio Showcase',
        description: 'Intro hero, project grid, testimonials.',
        addVisible: true,
        libraryVisible: true,
        device: { ...DEFAULT_DEVICE },
    },
    {
        id: 'ecommerce',
        kind: 'ecommerce',
        label: 'Ecommerce Home',
        description: 'Category strip, product grid, promo banner.',
        addVisible: true,
        libraryVisible: true,
        device: { ...DEFAULT_DEVICE },
    },
    {
        id: 'blog',
        kind: 'blog',
        label: 'Editorial Blog',
        description: 'Featured article, article list, newsletter.',
        addVisible: true,
        libraryVisible: true,
        device: { ...DEFAULT_DEVICE },
    },
    {
        id: 'auth',
        kind: 'auth',
        label: 'Auth Split',
        description: 'Split hero with login form and highlights.',
        addVisible: true,
        libraryVisible: true,
        device: { ...DEFAULT_DEVICE },
    },
];
