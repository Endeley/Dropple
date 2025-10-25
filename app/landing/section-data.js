export const landingSections = [
    {
        id: 'hero',
        layout: 'hero',
        badge: 'Imagine • Create • Publish',
        title: 'Design, write, and build anything with AI.',
        description:
            'One creative ecosystem for designers, developers, students, and brands — all powered by Dropple AI.',
        actions: [
            { label: 'Start creating free', href: '/handler/sign-up', trailing: '→' },
            { label: 'Explore AI tools', href: '/handler/sign-in', variant: 'secondary' },
        ],
        media: {
            variant: 'collage',
            badge: 'Dropple Studio',
            caption: 'Motion collage of social posts, UI screens, mockups, and slides blending together.',
        },
        background: 'gradient',
    },
    {
        id: 'studio',
        layout: 'split',
        badge: 'Dropple Studio',
        title: 'Your creative playground.',
        description:
            'From social posts to complete interfaces, Dropple Studio lets you design, edit, and export anything effortlessly.',
        points: [
            { icon: '✅', title: 'Drag & drop layers' },
            { icon: '🎯', title: '1000+ adaptive templates' },
            { icon: '⬇️', title: 'Export PNG, JPG, and PDF instantly' },
            { icon: '✨', title: 'AI auto layouts that stay on-brand' },
        ],
        media: {
            variant: 'canvas',
            badge: 'Creative Canvas',
            caption: 'Animated canvas with elements moving, resizing, and aligning in real-time.',
        },
    },
    {
        id: 'visual-generator',
        layout: 'split',
        badge: 'AI Visual Generator',
        title: 'From words to visuals.',
        description: 'Type your idea — get images, mockups, and product renders instantly.',
        points: [
            { icon: '🧠', title: 'Text-to-image prompts' },
            { icon: '🖼️', title: 'AI product mockups and marketing visuals' },
            { icon: '🎨', title: 'Style customization from photoreal to 3D' },
        ],
        media: {
            variant: 'prompt',
            badge: 'Prompt → Output',
            caption: 'Prompt box animates into generated visuals across multiple formats.',
        },
        details: 'Morph between photorealistic renders, bold vector art, and stylized worlds with a single prompt.',
    },
    {
        id: 'ui-builder',
        layout: 'split',
        badge: 'UI • UX Builder',
        title: 'Design interfaces without code.',
        description: 'Design complete interfaces, link pages, and export HTML/CSS in one click.',
        points: [
            { icon: '🧩', title: 'Reusable component library' },
            { icon: '🔗', title: 'Interactive prototyping flows' },
            { icon: '⚡', title: 'Auto layout & grid systems' },
            { icon: '🪄', title: 'Production-ready code export' },
        ],
        media: {
            variant: 'canvas',
            badge: 'Interface Builder',
            caption: 'Workspace animation showing Figma-style artboards connected with prototype lines.',
        },
        background: 'surface',
    },
    {
        id: 'docs-ai',
        layout: 'split',
        badge: 'Docs & Productivity AI',
        title: 'Create smarter documents.',
        description:
            'Generate resumes, slides, books, and reports with natural language — export them in seconds.',
        points: [
            { icon: '📄', title: 'Resume & cover letter AI' },
            { icon: '📘', title: 'Book and long-form writing assistant' },
            { icon: '📊', title: 'Presentation builder with auto layouts' },
            { icon: '🌍', title: 'Multilingual writing & translation' },
        ],
        media: {
            variant: 'canvas',
            badge: 'Document Builder',
            caption: 'Split-screen animation: prompt input on the left, document builds live on the right.',
        },
        mediaPosition: 'left',
    },
    {
        id: 'education-orgs',
        layout: 'split',
        badge: 'Education & Organizations',
        title: 'Empower every classroom and campus.',
        description:
            'Give students, faculty, and administrators a shared creative workspace with AI-assisted lesson plans, presentations, and campus branding.',
        points: [
            { icon: '🏫', title: 'Curriculum-ready templates & lesson decks' },
            { icon: '👩‍🏫', title: 'Faculty collaboration and approval flows' },
            { icon: '📚', title: 'Learning content localized for every cohort' },
            { icon: '🔒', title: 'FERPA-aware permissions & audit logs' },
        ],
        media: {
            variant: 'canvas',
            badge: 'Campus Studio',
            caption: 'Interactive storyboard showing lesson slides, student portals, and campus announcements.',
        },
        actions: [{ label: 'Explore education plans', href: '/handler/sign-up' }],
        background: 'surface',
    },
    {
        id: 'brand-suite',
        layout: 'split',
        badge: 'Brand & Business Suite',
        title: 'Build your brand with AI.',
        description:
            'Generate logos, color palettes, and brand kits — then collaborate with your entire team.',
        points: [
            { icon: '💼', title: 'Logo and identity generator' },
            { icon: '🧑‍🤝‍🧑', title: 'Real-time team collaboration' },
            { icon: '⚙️', title: 'API and workflow automations' },
            { icon: '📈', title: 'Reporting & brand consistency analytics' },
        ],
        media: {
            variant: 'collage',
            badge: 'Brand System',
            caption: 'Brand colors forming dynamically with team avatar overlays.',
        },
    },
    {
        id: 'ecommerce',
        layout: 'split',
        badge: 'E-commerce Growth',
        title: 'Launch campaigns at retail speed.',
        description:
            'Generate shoppable creatives, dynamic product showcases, and automated promotional flows that scale with your catalog.',
        points: [
            { icon: '🛍️', title: 'Auto-generated product drops & lookbooks' },
            { icon: '📦', title: 'Integrated SKU data & inventory badges' },
            { icon: '📣', title: 'Omnichannel ad sets for social, email, and web' },
            { icon: '📈', title: 'Performance dashboards with AI-optimised copy' },
        ],
        media: {
            variant: 'collage',
            badge: 'Shopfront',
            caption: 'Animated product gallery transitioning from PDP mockups to social carousel placements.',
        },
        actions: [
            { label: 'See commerce workflows', href: '/handler/sign-up' },
            { label: 'Connect your store', href: '/handler/sign-in', variant: 'secondary' },
        ],
        background: 'gradient',
    },
    {
        id: 'translator',
        layout: 'split',
        badge: 'Global Tools',
        title: 'Create in every language.',
        description:
            'Translate text, documents, and designs across 100+ languages with AI precision.',
        points: [
            { icon: '🌐', title: 'Text + voice translation' },
            { icon: '🗣️', title: 'Real-time subtitles & dubbing' },
            { icon: '🌏', title: 'Multilingual UI localization' },
        ],
        media: {
            variant: 'globe',
            badge: 'Worldwide',
            caption: 'Rotating globe animation with typography morphing between languages.',
        },
        background: 'night',
        actions: [{ label: 'See localization tools', href: '/handler/sign-up', variant: 'secondary' }],
    },
    {
        id: 'dev-mode',
        layout: 'split',
        badge: 'Developer Mode',
        title: 'Extend, automate, and integrate Dropple.',
        description:
            'Use Dropple Dev Mode to create plugins, custom AI tools, and API integrations for your apps.',
        points: [
            { icon: '🧰', title: 'Developer SDK across platforms' },
            { icon: '⚙️', title: 'REST and GraphQL endpoints' },
            { icon: '🪄', title: 'AI extension builder' },
            { icon: '🧑‍💻', title: 'Plugin marketplace & monetization' },
        ],
        media: {
            variant: 'code',
            badge: 'Dev Console',
            caption: 'Code editor request with results rendered inside Dropple canvas.',
        },
        actions: [
            { label: 'View developer hub', href: '/handler/sign-in' },
            { label: 'Read API docs', href: '/handler/sign-in', variant: 'secondary' },
        ],
    },
    {
        id: 'docs',
        layout: 'split',
        badge: 'Docs & API Reference',
        title: 'Learn, build, and integrate faster.',
        description:
            'Explore detailed documentation, tutorials, and code samples to connect Dropple with your workflow.',
        points: [
            { icon: '📘', title: 'Getting started onboarding' },
            { icon: '🔑', title: 'Authentication walk-throughs' },
            { icon: '🧠', title: 'AI endpoint recipes' },
            { icon: '💡', title: 'SDK examples and tutorials' },
        ],
        media: {
            variant: 'dashboard',
            badge: 'Docs Workspace',
            caption: 'Split docs layout with navigation sidebar and copy-to-clipboard interactions.',
        },
        mediaPosition: 'left',
        actions: [{ label: 'Open documentation', href: '/handler/sign-in' }],
    },
    {
        id: 'community',
        layout: 'cta',
        badge: 'Join the future of creation',
        title: 'Designers, developers, and dreamers — Dropple is your creative universe.',
        description:
            'Create on-brand experiences with ease. Join a community building the future of visual storytelling.',
        actions: [
            { label: 'Get started free', href: '/handler/sign-up', trailing: '→' },
            { label: 'Join Dropple Pro', href: '/handler/sign-in', variant: 'secondary' },
            { label: 'View docs', href: '/handler/sign-in', variant: 'secondary' },
        ],
        supporting:
            'Trusted by teams at Orbital, Nova Labs, Prism Studio, and thousands of independent creators worldwide.',
        media: {
            variant: 'community',
            badge: 'Community',
            caption: 'Parallax montage of user projects with floating avatars for social proof.',
        },
        overlay: 'glow',
    },
];
