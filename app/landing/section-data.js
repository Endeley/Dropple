export const landingSections = [
    {
        id: 'hero',
        layout: 'hero',
        badge: 'Dropple Mode Switch',
        title: 'Switch creative modes without losing your flow.',
        description:
            'Dropple morphs the workspace while preserving your canvas, timeline, and assets — with color-coded transitions and smart loaders guiding every switch.',
        highlights: [
            {
                icon: '💾',
                title: 'Auto-save every workspace',
                description: 'Canvas, timeline, and layer states save the moment you switch modes.',
            },
            {
                icon: '🧰',
                title: 'Toolbars that adapt',
                description: 'Each mode loads its own tools, inspectors, and export logic instantly.',
            },
            {
                icon: '📚',
                title: 'Shared asset library',
                description: 'Fonts, uploads, and generated media stay available across every mode.',
            },
            {
                icon: '🤖',
                title: 'AI-guided intent',
                description: 'Dropple reads what you want to do and preps the best mode automatically.',
            },
            {
                icon: '🌈',
                title: 'Color-coded transitions',
                description: 'Smooth morph animations and mode accent colors announce where you are heading.',
            },
            {
                icon: '⏳',
                title: 'Progress-aware loading',
                description: 'Lightweight loaders appear when heavy video or AI assets prep in the background.',
            },
        ],
        highlightColumns: 3,
        actions: [
            { label: 'Try the mode switch', href: '/handler/sign-up', trailing: '→' },
            { label: 'Watch the workspace demo', href: '/handler/sign-in', variant: 'secondary' },
        ],
        media: {
            variant: 'mode-switch',
            badge: 'Adaptive Workspace',
            caption: 'Workspace morphing between design, animation, podcast, and video timelines.',
            component: 'mode-transition',
            cycleDuration: 3600,
            modes: [
                {
                    id: 'graphic',
                    configId: 'graphics',
                    title: 'Graphic Design Mode',
                    shortTitle: 'Graphic',
                    description: 'Infinite canvas with shapes, typography, and layered controls ready the moment you arrive.',
                    accent: '#8B5CF6',
                    background: 'rgba(139,92,246,0.32)',
                    shadow: 'rgba(139,92,246,0.45)',
                    statusText: 'Entering Graphic Mode',
                    icon: '🟣',
                },
                {
                    id: 'uiux',
                    configId: 'ux',
                    title: 'UI • UX Design Mode',
                    shortTitle: 'UI/UX',
                    description: 'Frame-based design, responsive constraints, and prototype links that travel into motion.',
                    accent: '#3B82F6',
                    background: 'rgba(59,130,246,0.32)',
                    shadow: 'rgba(59,130,246,0.45)',
                    statusText: 'Entering UI/UX Mode',
                    icon: '🔵',
                },
                {
                    id: 'animation',
                    configId: 'cartoon',
                    title: 'Animation & Cartoon Mode',
                    shortTitle: 'Animation',
                    description: 'Layered timelines with keyframes and rigging controls that auto-map from your designs.',
                    accent: '#F97316',
                    background: 'rgba(249,115,22,0.32)',
                    shadow: 'rgba(249,115,22,0.45)',
                    statusText: 'Entering Animation Mode',
                    icon: '🟠',
                },
                {
                    id: 'podcast',
                    configId: 'podcast',
                    title: 'Podcast Mode',
                    shortTitle: 'Podcast',
                    description: 'Waveform editing with AI voices, fade, and merge tools synced to your scripts and assets.',
                    accent: '#34D399',
                    background: 'rgba(52,211,153,0.28)',
                    shadow: 'rgba(52,211,153,0.38)',
                    statusText: 'Entering Podcast Mode',
                    icon: '🟢',
                },
                {
                    id: 'video',
                    configId: 'video',
                    title: 'Video Editing Mode',
                    shortTitle: 'Video',
                    description: 'Multi-track editing with transitions, overlays, captions, and synced audio beds.',
                    accent: '#EF4444',
                    background: 'rgba(239,68,68,0.32)',
                    shadow: 'rgba(239,68,68,0.45)',
                    statusText: 'Preparing Video Workspace',
                    icon: '🔴',
                    loader: true,
                },
                {
                    id: 'image',
                    configId: 'image',
                    title: 'Image Editing Mode',
                    shortTitle: 'Image',
                    description: 'Non-destructive edits, filters, retouching, and background removal with history tracking.',
                    accent: '#FACC15',
                    background: 'rgba(250,204,21,0.28)',
                    shadow: 'rgba(250,204,21,0.38)',
                    statusText: 'Entering Image Mode',
                    icon: '🟡',
                },
                {
                    id: 'ai',
                    configId: 'ai-studio',
                    title: 'AI Studio Mode',
                    shortTitle: 'AI Studio',
                    description: 'Prompt-driven image, video, and voice generation that can send outputs to any mode instantly.',
                    accent: '#E5E7EB',
                    background: 'rgba(209,213,219,0.42)',
                    shadow: 'rgba(148,163,184,0.35)',
                    statusText: 'Preparing AI Studio',
                    icon: '⚪',
                    loader: true,
                },
            ],
        },
        background: 'gradient',
    },
    {
        id: 'studio',
        layout: 'split',
        badge: 'Dropple Studio',
        title: 'Your creative playground.',
        description:
            'From social posts to complete interfaces, Dropple Studio adapts to the mode you need while keeping every asset in sync.',
        points: [
            {
                icon: '🎚️',
                title: 'Mode-aware toolbars',
                description: 'Swap between design, animation, or editing without losing context.',
            },
            {
                icon: '🔁',
                title: 'Return-ready canvases',
                description: 'Every mode auto-saves its canvas, timeline, and layers.',
            },
            {
                icon: '📦',
                title: 'Shared asset bins',
                description: 'Fonts, uploads, prompts, and clips stay available everywhere.',
            },
            {
                icon: '🤖',
                title: 'AI intent suggestions',
                description: 'Let Dropple pick the best mode based on what you’re doing next.',
            },
        ],
        details:
            'Built on the Dropple Mode Switch blueprint, Studio remembers exactly where you left off in each workspace so you can jump between them in seconds.',
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
        description:
            'Type your idea and Dropple routes outputs to the right mode for polish — from image editing to full motion.',
        points: [
            {
                icon: '🧠',
                title: 'Prompt-literate rendering',
                description: 'Generate photoreal, 3D, or illustrated art in seconds.',
            },
            {
                icon: '🖼️',
                title: 'Send to Image Mode',
                description: 'Retouch, resize, or remove backgrounds without re-exporting.',
            },
            {
                icon: '🎞️',
                title: 'Animate in one click',
                description: 'Hand off scenes directly to Animation or Video timelines.',
            },
            {
                icon: '🗣️',
                title: 'Script-to-audio bridge',
                description: 'Drop generated scripts into Podcast Mode for instant voice.',
            },
        ],
        media: {
            variant: 'prompt',
            badge: 'Prompt → Output',
            caption: 'Prompt box animates into generated visuals across multiple formats.',
        },
        details:
            'AI outputs share the same asset pool, so anything you prompt can travel across Image, Animation, Video, or Podcast modes instantly.',
    },
    {
        id: 'ui-builder',
        layout: 'split',
        badge: 'UI • UX Builder',
        title: 'Design interfaces without code.',
        description:
            'Design complete interfaces, link pages, and carry them straight into animation, video, or code with one switch.',
        points: [
            {
                icon: '🧩',
                title: 'Component memory',
                description: 'Components persist when you jump into Animation or Video modes.',
            },
            {
                icon: '🔗',
                title: 'Prototype-to-motion handoff',
                description: 'Prototype links become timeline transitions automatically.',
            },
            {
                icon: '⚡',
                title: 'Auto layout everywhere',
                description: 'Responsive frames stay intact across design and dev workspaces.',
            },
            {
                icon: '🧑‍💻',
                title: 'Dev-ready exports',
                description: 'Send frames to Developer Mode for production-ready code and SDK scaffolds.',
            },
        ],
        media: {
            variant: 'canvas',
            badge: 'Interface Builder',
            caption: 'Workspace animation showing Figma-style artboards connected with prototype lines.',
        },
        details:
            'Dropple converts your interface frames into animation layers or exportable code without losing layout fidelity.',
        background: 'surface',
    },
    {
        id: 'docs-ai',
        layout: 'split',
        badge: 'Docs & Productivity AI',
        title: 'Create smarter documents.',
        description:
            'Generate resumes, slides, books, and reports — then route the narrative directly into audio or video production.',
        points: [
            {
                icon: '📄',
                title: 'Mode-ready templates',
                description: 'Docs auto-structure for slides, books, or reports with one prompt.',
            },
            {
                icon: '🗣️',
                title: 'Send to Podcast Mode',
                description: 'Narrate scripts with AI voices and waveform editing instantly.',
            },
            {
                icon: '🎬',
                title: 'Turn docs into video',
                description: 'Drop outlines into Video Mode with synchronized captions.',
            },
            {
                icon: '🌍',
                title: 'Multilingual + localized',
                description: 'Translate text and keep variants aligned across every mode.',
            },
        ],
        media: {
            variant: 'canvas',
            badge: 'Document Builder',
            caption: 'Split-screen animation: prompt input on the left, document builds live on the right.',
        },
        details:
            'Documents keep their structure when you switch modes, powering voiceovers, visual storyboards, and publish-ready exports.',
        mediaPosition: 'left',
    },
    {
        id: 'education-orgs',
        layout: 'split',
        badge: 'Education & Organizations',
        title: 'Empower every classroom and campus.',
        description:
            'Give students, faculty, and administrators a mode-aware creative campus that links lesson design, docs, podcasts, and video.',
        points: [
            {
                icon: '🏫',
                title: 'Shared mode playbooks',
                description: 'Start in Docs, jump to Video, and return to Design with every state preserved.',
            },
            {
                icon: '👩‍🏫',
                title: 'Faculty collaboration',
                description: 'Comment and approve across modes while tracking version history.',
            },
            {
                icon: '📚',
                title: 'Localized asset pools',
                description: 'Reuse templates, audio, and visuals across cohorts without re-uploading.',
            },
            {
                icon: '🔒',
                title: 'Governed switching',
                description: 'Role-based access follows every mode and workspace state.',
            },
        ],
        media: {
            variant: 'canvas',
            badge: 'Campus Studio',
            caption: 'Interactive storyboard showing lesson slides, student portals, and campus announcements.',
        },
        details:
            'Dropple Mode Switch keeps lessons synchronized — edit slides, record lectures, and publish recaps without duplicating work.',
        actions: [{ label: 'Explore education plans', href: '/handler/sign-up' }],
        background: 'surface',
    },
    {
        id: 'brand-suite',
        layout: 'split',
        badge: 'Brand & Business Suite',
        title: 'Build your brand with AI.',
        description:
            'Generate logos, color palettes, and brand kits — then move them through design, animation, and video without losing fidelity.',
        points: [
            {
                icon: '💼',
                title: 'Brand kits that travel',
                description: 'Asset libraries stay synced across every mode and deliverable.',
            },
            {
                icon: '🎬',
                title: 'Campaign mode switching',
                description: 'Turn hero graphics into motion intros or video ads with preserved layers.',
            },
            {
                icon: '🤝',
                title: 'Collaborative approvals',
                description: 'Stakeholders review in whichever mode they need without duplicating work.',
            },
            {
                icon: '⚙️',
                title: 'Automations + APIs',
                description: 'Trigger exports or AI batches the moment a mode changes.',
            },
        ],
        details:
            'Mode memory keeps logos, color tokens, and campaign assets consistent whether you are designing, animating, or editing video.',
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
            'Generate shoppable creatives, dynamic product showcases, and automated flows — with visuals, motion, and audio staying synced across modes.',
        points: [
            {
                icon: '🛍️',
                title: 'Adaptive product stories',
                description: 'Design once, reuse across Image, Video, and Animation modes.',
            },
            {
                icon: '📦',
                title: 'Inventory-aware timelines',
                description: 'Product data flows into motion layers and captions automatically.',
            },
            {
                icon: '📣',
                title: 'Omnichannel exports',
                description: 'Export video, social, and audio versions from the same assets.',
            },
            {
                icon: '🤖',
                title: 'AI launch co-pilot',
                description: 'Intent-based suggestions pick the right mode for each campaign asset.',
            },
        ],
        details:
            'Switch from lookbooks to animation timelines to video cuts while Dropple keeps product layers, pricing, and copy aligned.',
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
            'Translate text, documents, voice, and designs across 100+ languages — and keep localized assets connected as you switch modes.',
        points: [
            {
                icon: '🌐',
                title: 'Text + voice translation',
                description: 'Convert scripts and captions, then send to Podcast or Video modes.',
            },
            {
                icon: '🗣️',
                title: 'Real-time dubbing',
                description: 'Swap languages mid-edit while timelines stay perfectly synced.',
            },
            {
                icon: '🌏',
                title: 'Multilingual UI handoff',
                description: 'Localized strings follow you from UI Design to Developer Mode.',
            },
            {
                icon: '🔁',
                title: 'Mode-aware localization',
                description: 'Maintain variant parity across design, audio, and video outputs.',
            },
        ],
        media: {
            variant: 'globe',
            badge: 'Worldwide',
            caption: 'Rotating globe animation with typography morphing between languages.',
        },
        details:
            'The Mode Switch blueprint keeps translations attached to the original asset, so every mode stays in sync.',
        background: 'night',
        actions: [{ label: 'See localization tools', href: '/handler/sign-up', variant: 'secondary' }],
    },
    {
        id: 'dev-mode',
        layout: 'split',
        badge: 'Developer Mode',
        title: 'Extend, automate, and integrate Dropple.',
        description:
            'Extend the Dropple Mode Switch blueprint with custom tools, automations, and AI workflows.',
        points: [
            {
                icon: '🧰',
                title: 'Mode-aware SDK',
                description: 'Hook into toolbar, inspector, and canvas APIs for each mode.',
            },
            {
                icon: '⚙️',
                title: 'REST + GraphQL endpoints',
                description: 'Automate exports, asset routing, and mode transitions.',
            },
            {
                icon: '🪄',
                title: 'AI extension builder',
                description: 'Inject generative models that can move assets across modes.',
            },
            {
                icon: '🧑‍💻',
                title: 'Plugin marketplace',
                description: 'Publish extensions that ride on Dropple’s shared workspace skeleton.',
            },
        ],
        media: {
            variant: 'code',
            badge: 'Dev Console',
            caption: 'Code editor request with results rendered inside Dropple canvas.',
        },
        details:
            'Developer Mode exposes the primitives behind Dropple’s native switching so teams can craft bespoke creative pipelines.',
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
            'Explore documentation, tutorials, and code samples that map directly to Dropple’s Mode Switch blueprint.',
        points: [
            {
                icon: '📘',
                title: 'Mode switch overview',
                description: 'Understand the canvas, timeline, and data model that power each mode.',
            },
            {
                icon: '🔑',
                title: 'Authentication walk-throughs',
                description: 'Securely connect automations, plugins, and third-party services.',
            },
            {
                icon: '🧠',
                title: 'AI endpoint recipes',
                description: 'Wire prompts that route outputs to the right mode automatically.',
            },
            {
                icon: '💡',
                title: 'SDK examples and tutorials',
                description: 'Build plugins that customize toolbars, inspectors, and exports.',
            },
        ],
        media: {
            variant: 'dashboard',
            badge: 'Docs Workspace',
            caption: 'Split docs layout with navigation sidebar and copy-to-clipboard interactions.',
        },
        mediaPosition: 'left',
        details:
            'Documentation mirrors the Dropple workspace structure so teams can bring the same seamless handoffs into their own products.',
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
