let _id = 0;

export const uid = (prefix = 'node') => `${prefix}-${++_id}`;

export function createNode(type, opts = {}) {
    const defaultProps = {
        rotation: 0,
        flipX: false,
        flipY: false,
    };

    const node = {
        id: uid(type),
        type,
        mode: opts.mode ?? 'wireframe',
        style: { p: 24, gap: 16, radius: 14 },
        props: { ...defaultProps, ...(opts.props ?? {}) },
        layout: opts.layout ?? null,
        constraints: opts.constraints ?? null,
        visible: opts.visible ?? true,
        locked: opts.locked ?? false,
        frame: {
            x: opts.frame?.x ?? 40,
            y: opts.frame?.y ?? 40,
            width: opts.frame?.width ?? 960,
            height: opts.frame?.height ?? 320,
        },
        children: [],
    };
    if (Array.isArray(opts.children)) {
        node.children = opts.children;
    }
    return node;
}

export function addChild(parent, child) {
    if (!parent.children) parent.children = [];
    parent.children.push(child);
    return child;
}

export function removeNode(root, targetId) {
    if (!root || !Array.isArray(root.children)) {
        return { removed: null, ancestors: [] };
    }

    for (let index = 0; index < root.children.length; index += 1) {
        const child = root.children[index];
        if (child.id === targetId) {
            const [removed] = root.children.splice(index, 1);
            return { removed: removed ?? null, ancestors: [root] };
        }

        const result = removeNode(child, targetId);
        if (result.removed) {
            if (!result.ancestors.includes(root)) {
                result.ancestors.push(root);
            }
            return result;
        }
    }

    return { removed: null, ancestors: [] };
}

export function findNode(root, targetId) {
    if (!root) return null;
    const stack = [root];
    while (stack.length) {
        const node = stack.pop();
        if (node.id === targetId) {
            return node;
        }
        node?.children?.forEach((child) => stack.push(child));
    }
    return null;
}

export function recalcRootBounds(root) {
    if (!root || !Array.isArray(root.children)) return;
    const bottoms = root.children.map((child) => {
        const frame = child.frame ?? {};
        return (frame.y ?? 0) + (frame.height ?? 0);
    });
    const tallest = bottoms.length ? Math.max(...bottoms) : 0;
    root.height = Math.max(root.height ?? 0, tallest + 120);
}

export function demoScreenNodes(width = 1440, kind = 'landing', height = 900) {
    const defaultHeight = Number.isFinite(height) ? height : 900;
    const root = { id: uid('root'), type: 'root', width, height: defaultHeight, layout: null, children: [] };
    root.template = kind;
    root.layout = {
        auto: false,
        direction: 'vertical',
        spacing: 40,
        padding: 48,
        alignment: 'start',
        distribute: 'start',
    };
    let currentY = 20;
    const gap = 40;
    const marginOverrides = {
        ecommerce: 0,
        store: 0,
    };
    const marginRatio = Object.prototype.hasOwnProperty.call(marginOverrides, kind)
        ? marginOverrides[kind]
        : 0.025;
    const horizontalMargin =
        marginRatio <= 0 ? 0 : Math.max(24, Math.round(width * marginRatio));
    const layoutWidth = Math.max(320, width - horizontalMargin * 2);

    const push = (node) => {
        node.frame = {
            x: node.frame?.x ?? horizontalMargin,
            y: currentY,
            width: node.frame?.width ?? layoutWidth,
            height: node.frame?.height ?? 320,
        };
        currentY = node.frame.y + node.frame.height + gap;
        addChild(root, node);
    };

    const create = (type, overrides = {}) => createNode(type, { ...overrides, frame: { ...overrides.frame } });

    const buildNavbar = (frame = {}) => {
        const bar = create('navbar', { frame });
        bar.frame.width = frame.width ?? width - 80;
        bar.frame.height = frame.height ?? 96;
        bar.props = { padding: 24, background: '#ffffff', name: 'Navbar' };

        const logo = createNode('text', {
            frame: { x: 24, y: 20, width: 80, height: 32 },
            props: { text: 'Dropple', variant: 'subtitle', name: 'Brand' },
        });

        const navLinks = createNode('container', {
            frame: { x: bar.frame.width / 2 - 120, y: 26, width: 240, height: 28 },
            props: { padding: 0, name: 'Nav links' },
        });
        const linkTitles = ['Features', 'Pricing', 'Docs'];
        linkTitles.forEach((title, index) => {
            addChild(
                navLinks,
                createNode('text', {
                    frame: { x: index * 80, y: 0, width: 70, height: 24 },
                    props: { text: title, variant: 'body', name: `${title} link` },
                })
            );
        });

        const cta = createNode('button', {
            frame: { x: bar.frame.width - 24 - 140, y: 20, width: 140, height: 40 },
            props: { label: 'Sign in', variant: 'secondary', name: 'Navbar CTA' },
        });

        addChild(bar, logo);
        addChild(bar, navLinks);
        addChild(bar, cta);
        return bar;
    };

    const buildHero = (frame = {}) => {
        const hero = create('hero', { frame });
        hero.frame.width = frame.width ?? width - 80;
        hero.frame.height = frame.height ?? 420;
        hero.props = { padding: 32, background: '#eef2ff', name: 'Hero section' };

        const heroWidth = hero.frame.width;
        const contentWidth = Math.min(520, heroWidth * 0.5);

        const content = createNode('container', {
            frame: { x: 32, y: 48, width: contentWidth, height: 220 },
            props: { padding: 0, background: 'transparent', name: 'Hero content' },
        });
        addChild(
            content,
            createNode('text', {
                frame: { x: 0, y: 0, width: contentWidth, height: 72 },
                props: {
                    text: 'Build UI faster with Dropple',
                    variant: 'heading',
                    name: 'Headline',
                },
            })
        );
        addChild(
            content,
            createNode('text', {
                frame: { x: 0, y: 88, width: contentWidth - 30, height: 56 },
                props: {
                    text: 'From wireframe to code, in minutes.',
                    variant: 'body',
                    name: 'Subheading',
                },
            })
        );
        addChild(
            content,
            createNode('button', {
                frame: { x: 0, y: 160, width: 140, height: 44 },
                props: { label: 'Get started', variant: 'primary', name: 'Primary CTA' },
            })
        );
        addChild(
            content,
            createNode('button', {
                frame: { x: 160, y: 160, width: 140, height: 44 },
                props: { label: 'Learn more', variant: 'secondary', name: 'Secondary CTA' },
            })
        );
        addChild(hero, content);

        const mediaWidth = Math.max(220, Math.min(360, heroWidth - contentWidth - 96));
        addChild(
            hero,
            createNode('image', {
                frame: { x: heroWidth - mediaWidth - 32, y: 48, width: mediaWidth, height: 240 },
                props: { fill: '#e2e8f0', name: 'Hero visual' },
            })
        );

        return hero;
    };

    const buildCardsRow = (frame = {}) => {
        const cards = create('cards3', { frame });
        cards.frame.width = frame.width ?? width - 80;
        cards.frame.height = frame.height ?? 280;
        const padding = 28;
        const gapSize = 24;
        cards.props = { padding, gap: gapSize, name: 'Feature cards' };
        const usableWidth = cards.frame.width - padding * 2;
        const cardWidth = Math.max(220, (usableWidth - gapSize * 2) / 3);
        const cardHeight = 200;

        for (let index = 0; index < 3; index += 1) {
            const card = createNode('card', {
                frame: {
                    x: padding + index * (cardWidth + gapSize),
                    y: padding,
                    width: cardWidth,
                    height: cardHeight,
                },
                props: { tone: index === 0 ? 'accent' : 'neutral', name: `Card ${index + 1}` },
            });
            addChild(
                card,
                createNode('text', {
                    frame: { x: 16, y: 16, width: cardWidth - 32, height: 32 },
                    props: { text: `Card title ${index + 1}`, variant: 'subtitle', name: 'Card title' },
                })
            );
            addChild(
                card,
                createNode('text', {
                    frame: { x: 16, y: 60, width: cardWidth - 32, height: 70 },
                    props: {
                        text: 'Use this space to describe a feature or benefit.',
                        variant: 'body',
                        name: 'Card body',
                    },
                })
            );
            addChild(cards, card);
        }

        return cards;
    };

    const buildStatsRow = (frame = {}) => {
        const stats = createNode('section', {
            frame,
            props: { padding: 32, gap: 24, name: 'Stats' },
        });
        const statWidth = Math.max(180, ((stats.frame?.width ?? width - 80) - 48) / 3);
        const labels = ['Active users', 'Daily uptime', 'Support rating'];
        const values = ['24K+', '99.9%', '4.9/5'];
        labels.forEach((label, index) => {
            const stat = createNode('container', {
                frame: {
                    x: 32 + index * (statWidth + 24),
                    y: 24,
                    width: statWidth,
                    height: 120,
                },
                props: { padding: 0, name: `Stat ${index + 1}` },
            });
            addChild(
                stat,
                createNode('text', {
                    frame: { x: 0, y: 0, width: statWidth, height: 36 },
                    props: { text: values[index], variant: 'heading', name: 'Stat value' },
                })
            );
            addChild(
                stat,
                createNode('text', {
                    frame: { x: 0, y: 48, width: statWidth, height: 40 },
                    props: { text: label, variant: 'body', name: 'Stat label' },
                })
            );
            addChild(stats, stat);
        });
        stats.frame.height = 160;
        return stats;
    };

    const buildCTA = (frame = {}) => {
        const cta = createNode('section', {
            frame,
            props: { padding: 32, background: '#1e293b', name: 'Call to action' },
        });
        const widthAvailable = cta.frame.width ?? width - 80;
        addChild(
            cta,
            createNode('text', {
                frame: { x: 32, y: 24, width: widthAvailable - 64, height: 48 },
                props: {
                    text: 'Ready to ship faster?',
                    variant: 'subtitle',
                    name: 'CTA headline',
                    color: '#fff',
                },
            })
        );
        addChild(
            cta,
            createNode('text', {
                frame: { x: 32, y: 80, width: widthAvailable - 220, height: 44 },
                props: {
                    text: 'Upgrade your workflow with collaborative design tools.',
                    variant: 'body',
                    name: 'CTA body',
                    color: '#cbd5f5',
                },
            })
        );
        addChild(
            cta,
            createNode('button', {
                frame: { x: widthAvailable - 32 - 160, y: 70, width: 160, height: 44 },
                props: { label: 'Start free trial', variant: 'primary', name: 'CTA button' },
            })
        );
        cta.frame.height = 160;
        return cta;
    };

    const buildBlogList = (frame = {}) => {
        const list = createNode('section', {
            frame,
            props: { padding: 32, gap: 24, name: 'Blog posts' },
        });
        const usableWidth = (list.frame?.width ?? width - 80) - 64;
        const postHeight = 160;
        for (let index = 0; index < 3; index += 1) {
            const post = createNode('container', {
                frame: { x: 32, y: 32 + index * (postHeight + 24), width: usableWidth, height: postHeight },
                props: { padding: 0, name: `Post ${index + 1}` },
            });
            addChild(
                post,
                createNode('text', {
                    frame: { x: 0, y: 0, width: usableWidth, height: 32 },
                    props: { text: `Announcing feature ${index + 1}`, variant: 'subtitle', name: 'Post title' },
                })
            );
            addChild(
                post,
                createNode('text', {
                    frame: { x: 0, y: 44, width: usableWidth, height: 56 },
                    props: {
                        text: 'A short description of the post to encourage readers to click through.',
                        variant: 'body',
                        name: 'Post excerpt',
                    },
                })
            );
            addChild(
                post,
                createNode('button', {
                    frame: { x: 0, y: 112, width: 140, height: 38 },
                    props: { label: 'Read more', variant: 'secondary', name: 'Read more button' },
                })
            );
            addChild(list, post);
        }
        list.frame.height = 32 + 3 * (postHeight + 24);
        return list;
    };

    const buildAuthSection = (frame = {}) => {
        const section = createNode('section', {
            frame,
            props: { padding: 80, background: '#0f172a0d', name: 'Auth layout' },
        });
        const formCard = createNode('card', {
            frame: { x: (section.frame.width ?? width - 80) / 2 - 200, y: 40, width: 400, height: 360 },
            props: { name: 'Sign in card' },
        });
        addChild(
            formCard,
            createNode('text', {
                frame: { x: 24, y: 24, width: 352, height: 36 },
                props: { text: 'Welcome back', variant: 'subtitle', name: 'Form headline' },
            })
        );
        addChild(
            formCard,
            createNode('text', {
                frame: { x: 24, y: 70, width: 352, height: 24 },
                props: { text: 'Email', variant: 'body', name: 'Email label' },
            })
        );
        addChild(
            formCard,
            createNode('container', {
                frame: { x: 24, y: 100, width: 352, height: 48 },
                props: { padding: 12, name: 'Email field' },
            })
        );
        addChild(
            formCard,
            createNode('text', {
                frame: { x: 24, y: 160, width: 352, height: 24 },
                props: { text: 'Password', variant: 'body', name: 'Password label' },
            })
        );
        addChild(
            formCard,
            createNode('container', {
                frame: { x: 24, y: 190, width: 352, height: 48 },
                props: { padding: 12, name: 'Password field' },
            })
        );
        addChild(
            formCard,
            createNode('button', {
                frame: { x: 24, y: 250, width: 352, height: 48 },
                props: { label: 'Sign in', variant: 'primary', name: 'Submit button' },
            })
        );
        addChild(section, formCard);
        section.frame.height = 440;
        return section;
    };

    const buildMarketingTestimonials = (frame = {}) => {
        const testimonials = createNode('section', {
            frame,
            props: { padding: 32, gap: 24, name: 'Testimonials' },
        });
        const cardWidth = ((testimonials.frame?.width ?? width - 80) - 64) / 2;
        for (let index = 0; index < 2; index += 1) {
            const testimonial = createNode('card', {
                frame: { x: 32 + index * (cardWidth + 24), y: 32, width: cardWidth, height: 200 },
                props: { name: `Testimonial ${index + 1}` },
            });
            addChild(
                testimonial,
                createNode('text', {
                    frame: { x: 24, y: 24, width: cardWidth - 48, height: 96 },
                    props: {
                        text: '"Dropple transformed how we collaborate as a team."',
                        variant: 'body',
                        name: 'Quote',
                    },
                })
            );
            addChild(
                testimonial,
                createNode('text', {
                    frame: { x: 24, y: 140, width: cardWidth - 48, height: 24 },
                    props: { text: 'Alex Rivera', variant: 'subtitle', name: 'Author' },
                })
            );
            addChild(testimonials, testimonial);
        }
        testimonials.frame.height = 280;
        return testimonials;
    };

    const buildFeatureChecklist = (frame = {}) => {
        const section = createNode('section', {
            frame,
            props: { padding: 48, gap: 24, name: 'Feature checklist' },
        });
        const widthAvailable = section.frame?.width ?? width - 80;
        addChild(
            section,
            createNode('text', {
                frame: { x: 48, y: 16, width: widthAvailable - 96, height: 40 },
                props: {
                    text: 'Ship faster with a complete design workflow',
                    variant: 'subtitle',
                    name: 'Checklist headline',
                },
            })
        );
        addChild(
            section,
            createNode('text', {
                frame: { x: 48, y: 60, width: widthAvailable - 96, height: 32 },
                props: {
                    text: 'Everything your team needs to go from wireframe to production-ready UI.',
                    variant: 'body',
                    name: 'Checklist subtitle',
                },
            })
        );
        const items = [
            {
                title: 'Design tokens synced',
                description: 'Keep colors, fonts, and radius aligned across every page.',
            },
            {
                title: 'Reusable component sets',
                description: 'Compose pages in seconds with responsive, slot-driven blocks.',
            },
            {
                title: 'Team comments in context',
                description: 'Review iterations and resolve thread feedback inside the canvas.',
            },
        ];
        items.forEach((item, index) => {
            const row = createNode('container', {
                frame: { x: 48, y: 112 + index * 76, width: widthAvailable - 96, height: 68 },
                props: { padding: 16, gap: 16, name: item.title },
            });
            addChild(
                row,
                createNode('container', {
                    frame: { x: 0, y: 8, width: 36, height: 36 },
                    props: { padding: 0, name: 'Icon placeholder', background: '#e0e7ff', radius: 18 },
                })
            );
            addChild(
                row,
                createNode('text', {
                    frame: { x: 52, y: 0, width: widthAvailable - 180, height: 24 },
                    props: { text: item.title, variant: 'subtitle', name: `${item.title} title` },
                })
            );
            addChild(
                row,
                createNode('text', {
                    frame: { x: 52, y: 28, width: widthAvailable - 180, height: 28 },
                    props: { text: item.description, variant: 'body', name: `${item.title} description` },
                })
            );
            addChild(section, row);
        });
        section.frame.height = 112 + items.length * 76 + 32;
        return section;
    };

    const buildPricingTiers = (frame = {}) => {
        const section = createNode('section', {
            frame,
            props: { padding: 32, gap: 24, name: 'Pricing tiers' },
        });
        const widthAvailable = section.frame?.width ?? width - 80;
        const tiers = [
            {
                name: 'Starter',
                price: '$19',
                summary: ['Up to 3 teammates', 'Unlimited project drafts', 'Shared asset library'],
            },
            {
                name: 'Growth',
                price: '$39',
                summary: ['10 teammates', 'Version history', 'Comment & approvals'],
                highlight: true,
            },
            {
                name: 'Scale',
                price: '$79',
                summary: ['Unlimited seats', 'Design tokens API', 'Priority support'],
            },
        ];
        const gapSize = 24;
        const cardWidth = Math.max(220, (widthAvailable - 64 - gapSize * (tiers.length - 1)) / tiers.length);
        tiers.forEach((tier, index) => {
            const card = createNode('card', {
                frame: {
                    x: 32 + index * (cardWidth + gapSize),
                    y: 32,
                    width: cardWidth,
                    height: 320,
                },
                props: {
                    name: `${tier.name} tier`,
                    background: tier.highlight ? '#312e81' : undefined,
                },
            });
            addChild(
                card,
                createNode('text', {
                    frame: { x: 20, y: 24, width: cardWidth - 40, height: 28 },
                    props: {
                        text: tier.name,
                        variant: 'subtitle',
                        name: `${tier.name} label`,
                        color: tier.highlight ? '#E0E7FF' : undefined,
                    },
                })
            );
            addChild(
                card,
                createNode('text', {
                    frame: { x: 20, y: 64, width: cardWidth - 40, height: 48 },
                    props: {
                        text: tier.price,
                        variant: 'heading',
                        name: `${tier.name} price`,
                        color: tier.highlight ? '#FFFFFF' : undefined,
                    },
                })
            );
            tier.summary.forEach((summary, summaryIndex) => {
                addChild(
                    card,
                    createNode('text', {
                        frame: { x: 20, y: 128 + summaryIndex * 32, width: cardWidth - 40, height: 24 },
                        props: {
                            text: summary,
                            variant: 'body',
                            name: `${tier.name} feature ${summaryIndex + 1}`,
                            color: tier.highlight ? '#E0E7FF' : undefined,
                        },
                    })
                );
            });
            addChild(
                card,
                createNode('button', {
                    frame: { x: 20, y: 240, width: cardWidth - 40, height: 44 },
                    props: {
                        label: tier.highlight ? 'Choose growth' : 'Get started',
                        variant: tier.highlight ? 'primary' : 'secondary',
                        name: `${tier.name} action`,
                    },
                })
            );
            addChild(section, card);
        });
        section.frame.height = 32 + 320 + 48;
        return section;
    };

    const buildDashboardHeader = (frame = {}) => {
        const section = createNode('section', {
            frame,
            props: { padding: 32, gap: 24, name: 'Dashboard header' },
        });
        const widthAvailable = section.frame?.width ?? width - 80;
        addChild(
            section,
            createNode('text', {
                frame: { x: 32, y: 16, width: widthAvailable - 64, height: 36 },
                props: { text: 'Revenue overview', variant: 'subtitle', name: 'Dashboard title' },
            })
        );
        addChild(
            section,
            createNode('text', {
                frame: { x: 32, y: 60, width: widthAvailable - 64, height: 28 },
                props: {
                    text: 'Track adoption, engagement, and retention across every surface.',
                    variant: 'body',
                    name: 'Dashboard description',
                },
            })
        );
        const filters = createNode('container', {
            frame: { x: 32, y: 108, width: widthAvailable - 64, height: 64 },
            props: { padding: 16, gap: 16, name: 'Dashboard filters', radius: 20, background: '#f8fafc' },
        });
        const chips = ['Last 30 days', 'Product', 'Region', 'Team'];
        chips.forEach((chip, index) => {
            addChild(
                filters,
                createNode('button', {
                    frame: { x: index * 128, y: 0, width: 120, height: 32 },
                    props: { label: chip, variant: index === 0 ? 'primary' : 'secondary', name: `${chip} filter` },
                })
            );
        });
        addChild(section, filters);
        section.frame.height = 188;
        return section;
    };

    const buildDashboardPanels = (frame = {}) => {
        const section = createNode('section', {
            frame,
            props: { padding: 32, gap: 32, name: 'Dashboard panels' },
        });
        const widthAvailable = section.frame?.width ?? width - 80;
        const contentWidth = widthAvailable - 64;
        const chartWidth = Math.max(420, contentWidth * 0.6);
        const asideWidth = contentWidth - chartWidth - 24;
        const chart = createNode('container', {
            frame: { x: 32, y: 32, width: chartWidth, height: 320 },
            props: { padding: 24, gap: 16, name: 'Revenue chart', background: '#ffffff' },
        });
        addChild(
            chart,
            createNode('text', {
                frame: { x: 0, y: 0, width: chartWidth - 48, height: 28 },
                props: { text: 'Monthly revenue', variant: 'subtitle', name: 'Chart title' },
            })
        );
        addChild(
            chart,
            createNode('container', {
                frame: { x: 0, y: 48, width: chartWidth - 48, height: 220 },
                props: { padding: 12, name: 'Line chart placeholder' },
            })
        );
        addChild(section, chart);

        const breakdown = createNode('container', {
            frame: { x: 32 + chartWidth + 24, y: 32, width: asideWidth, height: 320 },
            props: { padding: 24, gap: 16, name: 'Breakdown panel', background: '#f8fafc' },
        });
        addChild(
            breakdown,
            createNode('text', {
                frame: { x: 0, y: 0, width: asideWidth - 48, height: 24 },
                props: { text: 'Top segments', variant: 'subtitle', name: 'Segments headline' },
            })
        );
        ['Enterprise', 'SMB', 'Self-serve'].forEach((segment, index) => {
            addChild(
                breakdown,
                createNode('container', {
                    frame: { x: 0, y: 36 + index * 72, width: asideWidth - 48, height: 64 },
                    props: { padding: 12, name: `${segment} segment` },
                })
            );
        });
        addChild(section, breakdown);

        const table = createNode('container', {
            frame: { x: 32, y: 384, width: contentWidth, height: 320 },
            props: { padding: 20, gap: 16, name: 'Account table', background: '#ffffff' },
        });
        addChild(
            table,
            createNode('text', {
                frame: { x: 0, y: 0, width: contentWidth - 40, height: 24 },
                props: { text: 'Accounts by expansion', variant: 'subtitle', name: 'Table headline' },
            })
        );
        for (let index = 0; index < 4; index += 1) {
            addChild(
                table,
                createNode('container', {
                    frame: { x: 0, y: 40 + index * 56, width: contentWidth - 40, height: 48 },
                    props: { padding: 12, name: `Table row ${index + 1}` },
                })
            );
        }
        addChild(section, table);
        section.frame.height = 384 + 320 + 48;
        return section;
    };

    const buildPortfolioIntro = (frame = {}) => {
        const section = createNode('section', {
            frame,
            props: { padding: 48, gap: 32, name: 'Portfolio hero' },
        });
        const widthAvailable = section.frame?.width ?? width - 80;
        const copyWidth = Math.min(520, widthAvailable * 0.45);
        addChild(
            section,
            createNode('text', {
                frame: { x: 48, y: 24, width: copyWidth, height: 52 },
                props: {
                    text: 'Product designer crafting clean, accessible interfaces.',
                    variant: 'subtitle',
                    name: 'Portfolio headline',
                },
            })
        );
        addChild(
            section,
            createNode('text', {
                frame: { x: 48, y: 86, width: copyWidth, height: 72 },
                props: {
                    text: 'Over the last 6 years I have worked with B2B SaaS teams to ship design systems, marketing sites, and dashboards.',
                    variant: 'body',
                    name: 'Portfolio summary',
                },
            })
        );
        addChild(
            section,
            createNode('button', {
                frame: { x: 48, y: 170, width: 160, height: 44 },
                props: { label: 'View projects', variant: 'primary', name: 'View projects button' },
            })
        );
        addChild(
            section,
            createNode('container', {
                frame: { x: copyWidth + 96, y: 24, width: widthAvailable - copyWidth - 144, height: 280 },
                props: { padding: 24, name: 'Showcase image', background: '#e0f2fe', radius: 32 },
            })
        );
        section.frame.height = 320;
        return section;
    };

    const buildProjectGallery = (frame = {}) => {
        const section = createNode('section', {
            frame,
            props: { padding: 32, gap: 24, name: 'Project gallery' },
        });
        const widthAvailable = section.frame?.width ?? width - 80;
        const columns = 3;
        const gapSize = 24;
        const cardWidth = Math.max(220, (widthAvailable - 64 - gapSize * (columns - 1)) / columns);
        const cardHeight = 220;
        for (let index = 0; index < 6; index += 1) {
            const row = Math.floor(index / columns);
            const col = index % columns;
            const card = createNode('card', {
                frame: {
                    x: 32 + col * (cardWidth + gapSize),
                    y: 32 + row * (cardHeight + gapSize),
                    width: cardWidth,
                    height: cardHeight,
                },
                props: { name: `Project ${index + 1}` },
            });
            addChild(
                card,
                createNode('text', {
                    frame: { x: 20, y: 20, width: cardWidth - 40, height: 24 },
                    props: { text: `Case study ${index + 1}`, variant: 'subtitle', name: `Project ${index + 1} title` },
                })
            );
            addChild(
                card,
                createNode('container', {
                    frame: { x: 20, y: 60, width: cardWidth - 40, height: cardHeight - 100 },
                    props: { padding: 12, name: `Project ${index + 1} thumbnail` },
                })
            );
            addChild(section, card);
        }
        const rows = Math.ceil(6 / columns);
        section.frame.height = 32 + rows * (cardHeight + gapSize) + 8;
        return section;
    };

    const buildContactStrip = (frame = {}) => {
        const section = createNode('section', {
            frame,
            props: { padding: 40, background: '#0f172a', name: 'Contact strip' },
        });
        const widthAvailable = section.frame?.width ?? width - 80;
        addChild(
            section,
            createNode('text', {
                frame: { x: 40, y: 20, width: widthAvailable - 80, height: 36 },
                props: { text: 'Let’s collaborate on your next project', variant: 'subtitle', name: 'Contact title', color: '#fff' },
            })
        );
        addChild(
            section,
            createNode('text', {
                frame: { x: 40, y: 64, width: widthAvailable - 220, height: 32 },
                props: {
                    text: 'Book a call to walk through ideas, scope, and timelines.',
                    variant: 'body',
                    name: 'Contact body',
                    color: '#cbd5f5',
                },
            })
        );
        addChild(
            section,
            createNode('button', {
                frame: { x: widthAvailable - 40 - 160, y: 56, width: 160, height: 44 },
                props: { label: 'Schedule intro', variant: 'secondary', name: 'Contact button' },
            })
        );
        section.frame.height = 120;
        return section;
    };

    const buildCategoryStrip = (frame = {}) => {
        const section = createNode('section', {
            frame,
            props: { padding: 32, gap: 16, name: 'Category strip' },
        });
        const widthAvailable = section.frame?.width ?? width - 80;
        addChild(
            section,
            createNode('text', {
                frame: { x: 32, y: 12, width: widthAvailable - 64, height: 28 },
                props: { text: 'Shop by category', variant: 'subtitle', name: 'Category headline' },
            })
        );
        for (let index = 0; index < 5; index += 1) {
            addChild(
                section,
                createNode('button', {
                    frame: { x: 32 + index * 160, y: 56, width: 148, height: 40 },
                    props: { label: `Category ${index + 1}`, variant: 'secondary', name: `Category ${index + 1} chip` },
                })
            );
        }
        section.frame.height = 120;
        return section;
    };

    const buildProductSpotlight = (frame = {}) => {
        const section = createNode('section', {
            frame,
            props: { padding: 32, gap: 24, name: 'Product spotlight' },
        });
        const widthAvailable = section.frame?.width ?? width - 80;
        const highlight = createNode('container', {
            frame: { x: 32, y: 32, width: widthAvailable - 64, height: 260 },
            props: { padding: 32, name: 'Spotlight card', background: '#f1f5f9', radius: 32 },
        });
        const highlightWidth = highlight.frame?.width ?? widthAvailable - 64;
        addChild(
            highlight,
            createNode('text', {
                frame: { x: 0, y: 0, width: highlightWidth - 64, height: 32 },
                props: { text: 'Featured drop', variant: 'subtitle', name: 'Spotlight title' },
            })
        );
        addChild(
            highlight,
            createNode('text', {
                frame: { x: 0, y: 44, width: highlightWidth - 120, height: 64 },
                props: {
                    text: 'Limited edition desk bundle for the hybrid workspace.',
                    variant: 'body',
                    name: 'Spotlight description',
                },
            })
        );
        addChild(
            highlight,
            createNode('button', {
                frame: { x: 0, y: 128, width: 160, height: 44 },
                props: { label: 'Add to cart', variant: 'primary', name: 'Spotlight CTA' },
            })
        );
        addChild(
            highlight,
            createNode('container', {
                frame: { x: highlightWidth - 200, y: 0, width: 200, height: 200 },
                props: { padding: 12, name: 'Spotlight image' },
            })
        );
        addChild(section, highlight);
        section.frame.height = 324;
        return section;
    };

    const buildNewsletterBanner = (frame = {}) => {
        const section = createNode('section', {
            frame,
            props: { padding: 40, gap: 16, name: 'Newsletter banner', background: '#eef2ff' },
        });
        const widthAvailable = section.frame?.width ?? width - 80;
        addChild(
            section,
            createNode('text', {
                frame: { x: 40, y: 16, width: widthAvailable - 80, height: 28 },
                props: { text: 'Sign up for product drops', variant: 'subtitle', name: 'Newsletter title' },
            })
        );
        addChild(
            section,
            createNode('container', {
                frame: { x: 40, y: 56, width: widthAvailable - 240, height: 52 },
                props: { padding: 12, name: 'Email field' },
            })
        );
        addChild(
            section,
            createNode('button', {
                frame: { x: widthAvailable - 40 - 160, y: 56, width: 160, height: 52 },
                props: { label: 'Subscribe', variant: 'primary', name: 'Newsletter submit' },
            })
        );
        section.frame.height = 140;
        return section;
    };

    const buildEcommerceHeader = (frame = {}) => {
        const section = createNode('section', {
            frame,
            props: { padding: 28, gap: 24, name: 'Store header', background: '#f8fafc', radius: 0 },
        });
        const sectionWidth = Math.max(320, section.frame?.width ?? width);
        const gutter = Math.max(24, Math.round(sectionWidth * 0.03));
        const innerWidth = sectionWidth - gutter * 2;

        const chrome = createNode('container', {
            frame: { x: gutter, y: gutter, width: innerWidth, height: Math.max(48, Math.round(sectionWidth * 0.04)) },
            props: { padding: 16, gap: 16, name: 'Browser chrome' },
        });
        addChild(
            chrome,
            createNode('text', {
                frame: { x: 0, y: 8, width: Math.max(160, Math.round(innerWidth * 0.12)), height: 24 },
                props: { text: 'Logo', variant: 'subtitle', name: 'Logo text' },
            })
        );
        addChild(
            chrome,
            createNode('container', {
                frame: { x: chrome.frame.width - Math.max(200, Math.round(innerWidth * 0.18)), y: 4, width: Math.max(200, Math.round(innerWidth * 0.18)), height: 36 },
                props: { padding: 12, name: 'Navigation highlights', background: '#e2e8f0', radius: 22 },
            })
        );
        addChild(section, chrome);

        addChild(
            section,
            createNode('container', {
                frame: { x: gutter, y: chrome.frame.y + chrome.frame.height + Math.max(20, Math.round(sectionWidth * 0.025)), width: innerWidth, height: Math.max(160, Math.round(sectionWidth * 0.12)) },
                props: { padding: 24, name: 'Hero media', background: '#cbd5f5', radius: 28 },
            })
        );

        const bottom = section.children.reduce((max, child) => {
            const frameChild = child.frame ?? { y: 0, height: 0 };
            return Math.max(max, frameChild.y + frameChild.height);
        }, 0);
        section.frame.height = bottom + gutter;
        return section;
    };

    const buildEcommerceBody = (frame = {}) => {
        const section = createNode('section', {
            frame,
            props: { padding: 32, gap: 32, name: 'Store layout' },
        });
        const sectionWidth = Math.max(320, section.frame?.width ?? width);
        const outerGutter = Math.max(28, Math.round(sectionWidth * 0.03));
        const innerWidth = sectionWidth - outerGutter * 2;
        const columnGap = Math.max(32, Math.round(innerWidth * 0.04));
        const sidebarWidth = Math.max(220, Math.round(innerWidth * 0.22));
        const mainWidth = innerWidth - sidebarWidth - columnGap;

        const sidebarHeight = Math.max(420, Math.round(sectionWidth * 0.36));
        const sidebar = createNode('card', {
            frame: { x: outerGutter, y: outerGutter, width: sidebarWidth, height: sidebarHeight },
            props: { name: 'Sidebar navigation', padding: 28 },
        });
        addChild(
            sidebar,
            createNode('text', {
                frame: { x: 0, y: 0, width: sidebarWidth - 56, height: 28 },
                props: { text: 'Browse', variant: 'subtitle', name: 'Sidebar title' },
            })
        );
        for (let index = 0; index < 6; index += 1) {
            addChild(
                sidebar,
                createNode('text', {
                    frame: { x: 0, y: 48 + index * 48, width: sidebarWidth - 56, height: 24 },
                    props: { text: `Collection ${index + 1}`, variant: 'body', name: `Sidebar item ${index + 1}` },
                })
            );
        }
        addChild(
            sidebar,
            createNode('button', {
                frame: { x: 0, y: sidebarHeight - 76, width: sidebarWidth - 56, height: 48 },
                props: { label: 'View cart', variant: 'primary', name: 'Sidebar CTA' },
            })
        );
        addChild(section, sidebar);

        const content = createNode('container', {
            frame: { x: outerGutter + sidebarWidth + columnGap, y: outerGutter, width: mainWidth, height: sidebarHeight },
            props: { padding: 0, name: 'Main content region' },
        });
        addChild(
            content,
            createNode('text', {
                frame: { x: 0, y: 0, width: mainWidth, height: 32 },
                props: { text: 'Featured collection', variant: 'subtitle', name: 'Content heading' },
            })
        );
        addChild(
            content,
            createNode('container', {
                frame: { x: 0, y: 44, width: mainWidth, height: Math.max(36, Math.round(mainWidth * 0.05)) },
                props: { padding: 0, name: 'Breadcrumb', background: '#e2e8f0', radius: 24 },
            })
        );
        addChild(
            content,
            createNode('container', {
                frame: { x: 0, y: 44 + Math.max(36, Math.round(mainWidth * 0.05)) + 12, width: mainWidth, height: Math.max(200, Math.round(mainWidth * 0.22)) },
                props: { padding: 20, name: 'Showcase image', background: '#e0f2fe', radius: 28 },
            })
        );
        const descriptionY = content.children[2].frame.y + content.children[2].frame.height + 24;
        addChild(
            content,
            createNode('text', {
                frame: { x: 0, y: descriptionY, width: mainWidth - Math.max(160, Math.round(mainWidth * 0.15)), height: 32 },
                props: { text: 'Layered brand updates for spring', variant: 'body', name: 'Description' },
            })
        );
        addChild(
            content,
            createNode('button', {
                frame: { x: mainWidth - Math.max(160, Math.round(mainWidth * 0.15)), y: descriptionY - 4, width: Math.max(160, Math.round(mainWidth * 0.15)), height: 40 },
                props: { label: 'Add to cart', variant: 'secondary', name: 'Hero CTA' },
            })
        );
        const gridY = descriptionY + 60;
        const totalTiles = 8;
        const grid = createNode('container', {
            frame: { x: 0, y: gridY, width: mainWidth, height: Math.max(200, sidebarHeight - gridY) },
            props: { padding: 12, gap: 16, name: 'Product grid' },
        });
        const columns = Math.max(2, Math.floor(mainWidth / 180));
        const rows = Math.ceil(totalTiles / columns);
        const tileGap = Math.max(12, Math.round(mainWidth * 0.015));
        const tileSize = Math.floor((mainWidth - tileGap * (columns - 1)) / columns);
        for (let index = 0; index < totalTiles; index += 1) {
            const row = Math.floor(index / columns);
            const col = index % columns;
            addChild(
                grid,
                createNode('card', {
                    frame: {
                        x: col * (tileSize + tileGap),
                        y: row * (tileSize + tileGap),
                        width: tileSize,
                        height: tileSize,
                    },
                    props: { name: `Product tile ${index + 1}`, padding: 16 },
                })
            );
        }
        const gridHeight = rows * tileSize + Math.max(0, rows - 1) * tileGap;
        grid.frame.height = gridHeight;
        addChild(content, grid);
        content.frame.height = grid.frame.y + gridHeight;

        // ensure sidebar matches height of content if content taller
        const contentHeight = content.frame.height;
        if (contentHeight > sidebar.frame.height) {
            sidebar.frame.height = contentHeight;
        }
        addChild(section, content);

        const bottom = Math.max(
            sidebar.frame.y + sidebar.frame.height,
            content.frame.y + content.frame.height
        );
        section.frame.height = bottom + outerGutter;
        return section;
    };

    const buildEditorialHeader = (frame = {}) => {
        const section = createNode('section', {
            frame,
            props: { padding: 32, gap: 24, name: 'Editorial header', background: '#f8fafc', radius: 0 },
        });
        const sectionWidth = section.frame?.width ?? width - horizontalMargin * 2;
        const gutter = Math.max(28, Math.round(sectionWidth * 0.03));
        const innerWidth = sectionWidth - gutter * 2;

        const navRow = createNode('container', {
            frame: { x: gutter, y: gutter, width: innerWidth, height: 56 },
            props: { padding: 16, gap: 20, name: 'Navigation row' },
        });
        addChild(
            navRow,
            createNode('text', {
                frame: { x: 0, y: 10, width: Math.max(160, Math.round(innerWidth * 0.12)), height: 24 },
                props: { text: 'Logo', variant: 'subtitle', name: 'Editorial logo' },
            })
        );
        const navLinks = ['Stories', 'Guides', 'Topics', 'About'];
        navLinks.forEach((link, index) => {
            addChild(
                navRow,
                createNode('text', {
                    frame: { x: 200 + index * 110, y: 12, width: 100, height: 24 },
                    props: { text: link, variant: 'body', name: `${link} nav` },
                })
            );
        });
        addChild(section, navRow);

        const hero = createNode('container', {
            frame: { x: gutter, y: navRow.frame.y + navRow.frame.height + 24, width: innerWidth, height: Math.max(220, Math.round(innerWidth * 0.35)) },
            props: { padding: 28, name: 'Hero media', background: '#cbd5f5', radius: 32 },
        });
        addChild(
            hero,
            createNode('container', {
                frame: { x: hero.frame.width / 2 - 180, y: hero.frame.height / 2 - 100, width: 360, height: 200 },
                props: { padding: 24, name: 'Hero card', background: '#ffffff', radius: 24 },
            })
        );
        addChild(
            hero,
            createNode('text', {
                frame: { x: hero.frame.width / 2 - 140, y: hero.frame.height / 2 - 70, width: 280, height: 28 },
                props: { text: 'Featured editorial insight', variant: 'subtitle', name: 'Hero headline', color: '#1e293b' },
            })
        );
        addChild(
            hero,
            createNode('text', {
                frame: { x: hero.frame.width / 2 - 140, y: hero.frame.height / 2 - 32, width: 280, height: 44 },
                props: { text: 'Dive into the latest product research, brand strategy, and storytelling techniques.', variant: 'body', name: 'Hero summary', color: '#475569' },
            })
        );
        addChild(
            hero,
            createNode('button', {
                frame: { x: hero.frame.width / 2 - 70, y: hero.frame.height / 2 + 28, width: 140, height: 40 },
                props: { label: 'Read story', variant: 'secondary', name: 'Hero CTA' },
            })
        );
        addChild(section, hero);

        const heroBottom = hero.frame.y + hero.frame.height;
        section.frame.height = heroBottom + gutter;
        return section;
    };

    const buildEditorialSpotlight = (frame = {}) => {
        const section = createNode('section', {
            frame,
            props: { padding: 36, gap: 32, name: 'Editorial spotlight' },
        });
        const sectionWidth = section.frame?.width ?? width - horizontalMargin * 2;
        const gutter = Math.max(28, Math.round(sectionWidth * 0.03));
        const innerWidth = sectionWidth - gutter * 2;

        const feature = createNode('container', {
            frame: { x: gutter, y: gutter, width: innerWidth, height: Math.max(320, Math.round(innerWidth * 0.45)) },
            props: { padding: 28, gap: 24, name: 'Feature spotlight', background: '#1e293b', radius: 36 },
        });
        addChild(
            feature,
            createNode('text', {
                frame: { x: 0, y: 0, width: innerWidth - 56, height: 32 },
                props: { text: 'Weekly deep dive', variant: 'subtitle', name: 'Feature label', color: '#cbd5f5' },
            })
        );
        addChild(
            feature,
            createNode('text', {
                frame: { x: 0, y: 48, width: innerWidth - 56, height: 60 },
                props: { text: 'Behind the scenes of high-impact product launches', variant: 'heading', name: 'Feature title', color: '#eef2ff' },
            })
        );
        addChild(
            feature,
            createNode('text', {
                frame: { x: 0, y: 120, width: Math.min(innerWidth - 56, 540), height: 48 },
                props: { text: 'From research to animation, explore how leading teams craft memorable ship moments.', variant: 'body', name: 'Feature body', color: '#e2e8f0' },
            })
        );
        addChild(
            feature,
            createNode('button', {
                frame: { x: 0, y: 180, width: 160, height: 44 },
                props: { label: 'Listen now', variant: 'primary', name: 'Feature CTA' },
            })
        );
        addChild(section, feature);

        const circleRow = createNode('container', {
            frame: { x: gutter, y: feature.frame.y + feature.frame.height + 40, width: innerWidth, height: 140 },
            props: { padding: 0, name: 'Topic highlights' },
        });
        const circles = [
            { color: '#94a3b8', label: 'Design ops' },
            { color: '#1e293b', label: 'Product craft' },
            { color: '#f97316', label: 'Brand moments' },
        ];
        const spacing = innerWidth / circles.length;
        circles.forEach((item, index) => {
            const x = index * spacing;
            addChild(
                circleRow,
                createNode('container', {
                    frame: { x, y: 0, width: 120, height: 120 },
                    props: { padding: 0, name: `${item.label} avatar` },
                })
            );
            addChild(
                circleRow,
                createNode('container', {
                    frame: { x: x + 10, y: 0, width: 100, height: 100 },
                    props: { padding: 0, name: `${item.label} circle`, background: item.color, radius: 50 },
                })
            );
            addChild(
                circleRow,
                createNode('text', {
                    frame: { x, y: 110, width: 120, height: 20 },
                    props: { text: item.label, variant: 'body', name: `${item.label} caption`, align: 'center' },
                })
            );
        });
        addChild(section, circleRow);

        const bottom = circleRow.frame.y + circleRow.frame.height;
        section.frame.height = bottom + gutter;
        return section;
    };

    const buildSplitAuthSection = (frame = {}) => {
        const section = createNode('section', {
            frame,
            props: { padding: 48, gap: 32, name: 'Auth split layout' },
        });
        const widthAvailable = section.frame?.width ?? width - 80;
        const leftWidth = Math.max(340, widthAvailable * 0.45);
        addChild(
            section,
            createNode('text', {
                frame: { x: 48, y: 32, width: leftWidth - 32, height: 36 },
                props: { text: 'Welcome back', variant: 'subtitle', name: 'Auth headline' },
            })
        );
        addChild(
            section,
            createNode('text', {
                frame: { x: 48, y: 76, width: leftWidth - 32, height: 56 },
                props: {
                    text: 'Drop into your workspace to continue designing with your team.',
                    variant: 'body',
                    name: 'Auth description',
                },
            })
        );
        const form = createNode('card', {
            frame: { x: widthAvailable - 48 - 420, y: 32, width: 420, height: 420 },
            props: { name: 'Sign-in form' },
        });
        const fields = ['Email', 'Password'];
        addChild(
            form,
            createNode('text', {
                frame: { x: 28, y: 28, width: 364, height: 28 },
                props: { text: 'Sign in to continue', variant: 'subtitle', name: 'Form heading' },
            })
        );
        fields.forEach((field, index) => {
            addChild(
                form,
                createNode('text', {
                    frame: { x: 28, y: 80 + index * 100, width: 364, height: 24 },
                    props: { text: field, variant: 'body', name: `${field} label` },
                })
            );
            addChild(
                form,
                createNode('container', {
                    frame: { x: 28, y: 112 + index * 100, width: 364, height: 52 },
                    props: { padding: 16, name: `${field} field` },
                })
            );
        });
        addChild(
            form,
            createNode('button', {
                frame: { x: 28, y: 280, width: 364, height: 52 },
                props: { label: 'Sign in', variant: 'primary', name: 'Submit login' },
            })
        );
        addChild(
            form,
            createNode('button', {
                frame: { x: 28, y: 344, width: 364, height: 52 },
                props: { label: 'Create account', variant: 'secondary', name: 'Create account CTA' },
            })
        );
        addChild(section, form);
        section.frame.height = 504;
        return section;
    };

    const buildSaasTopBar = (frame = {}) => {
        const section = createNode('section', {
            frame,
            props: { padding: 36, gap: 28, name: 'SaaS header band' },
        });
        const sectionWidth = section.frame?.width ?? width - horizontalMargin * 2;

        const navRow = createNode('container', {
            frame: { x: 36, y: 16, width: sectionWidth - 72, height: 48 },
            props: { padding: 0, gap: 16, name: 'Navigation row' },
        });
        addChild(
            navRow,
            createNode('text', {
                frame: { x: 0, y: 8, width: 200, height: 28 },
                props: { text: 'Dropple', variant: 'subtitle', name: 'Brand' },
            })
        );
        const navItems = ['Features', 'Templates', 'Pricing', 'Changelog'];
        navItems.forEach((item, index) => {
            addChild(
                navRow,
                createNode('text', {
                    frame: { x: 210 + index * 120, y: 12, width: 110, height: 24 },
                    props: { text: item, variant: 'body', name: `${item} link` },
                })
            );
        });
        addChild(
            navRow,
            createNode('button', {
                frame: { x: navRow.frame.width - 148, y: 6, width: 148, height: 36 },
                props: { label: 'Start free trial', variant: 'primary', name: 'Top CTA' },
            })
        );
        addChild(section, navRow);

        addChild(
            section,
            createNode('text', {
                frame: { x: 36, y: 76, width: sectionWidth - 72, height: 40 },
                props: {
                    text: 'Design dashboards, marketing sites, and flows in minutes.',
                    variant: 'subtitle',
                    name: 'Primary headline',
                },
            })
        );
        addChild(
            section,
            createNode('text', {
                frame: { x: 36, y: 122, width: sectionWidth - 72, height: 28 },
                props: {
                    text: 'Drop components, swap content, and export production-ready UI.',
                    variant: 'body',
                    name: 'Supporting copy',
                },
            })
        );
        addChild(
            section,
            createNode('container', {
                frame: { x: 36, y: 160, width: sectionWidth - 72, height: 52 },
                props: {
                    padding: 20,
                    name: 'Secondary bar',
                    background: '#e2e8f0',
                    radius: 18,
                },
            })
        );
        section.frame.height = 220;
        return section;
    };

    const buildSaasPromoStrip = (frame = {}) => {
        const section = createNode('section', {
            frame,
            props: { padding: 24, gap: 16, name: 'Promo strip', background: '#10b981', radius: 24 },
        });
        const sectionWidth = section.frame?.width ?? width - horizontalMargin * 2;
        const labels = ['Automations', 'AI Content', 'Live Collaboration', 'Component Library', 'Dev Handoff'];
        labels.forEach((label, index) => {
            addChild(
                section,
                createNode('text', {
                    frame: { x: 24 + index * ((sectionWidth - 48) / labels.length), y: 12, width: 180, height: 24 },
                    props: {
                        text: label,
                        variant: 'body',
                        name: `${label} item`,
                        color: '#ecfdf5',
                    },
                })
            );
        });
        section.frame.height = 88;
        return section;
    };

    const buildSaasContentGrid = (frame = {}) => {
        const section = createNode('section', {
            frame,
            props: { padding: 32, gap: 32, name: 'Content grid' },
        });
        const sectionWidth = section.frame?.width ?? width - horizontalMargin * 2;
        const gutter = 28;
        const leftWidth = Math.round((sectionWidth - 64) * 0.64);
        const rightWidth = sectionWidth - 64 - leftWidth - gutter;

        const createArticle = (y, title, body, buttonLabel, mediaLabel) => {
            const card = createNode('card', {
                frame: { x: 32, y, width: leftWidth, height: 210 },
                props: { name: `${title} card`, padding: 20 },
            });
            addChild(
                card,
                createNode('container', {
                    frame: { x: 0, y: 0, width: leftWidth - 40, height: 110 },
                    props: { padding: 12, name: mediaLabel, background: '#e2e8f0', radius: 20 },
                })
            );
            addChild(
                card,
                createNode('text', {
                    frame: { x: 0, y: 122, width: leftWidth - 40, height: 28 },
                    props: { text: title, variant: 'subtitle', name: `${title} heading` },
                })
            );
            addChild(
                card,
                createNode('text', {
                    frame: { x: 0, y: 154, width: leftWidth - 40, height: 36 },
                    props: { text: body, variant: 'body', name: `${title} body` },
                })
            );
            addChild(
                card,
                createNode('button', {
                    frame: { x: leftWidth - 180, y: 154, width: 140, height: 36 },
                    props: { label: buttonLabel, variant: 'secondary', name: `${title} CTA` },
                })
            );
            return card;
        };

        addChild(
            section,
            createArticle(
                32,
                'Visual project updates',
                'Illustrate each release with ready-made presentation frames.',
                'View report',
                'Preview image'
            )
        );
        addChild(
            section,
            createArticle(
                270,
                'Launch roadmap',
                'Compile assets, copy, and video in one shareable doc for stakeholders.',
                'Open board',
                'Video preview'
            )
        );

        const rightColumnX = 32 + leftWidth + gutter;
        const adCard = createNode('card', {
            frame: { x: rightColumnX, y: 32, width: rightWidth, height: 260 },
            props: { name: 'Ad spotlight', padding: 24, background: '#f87171' },
        });
        addChild(
            adCard,
            createNode('text', {
                frame: { x: 0, y: 20, width: rightWidth - 48, height: 36 },
                props: {
                    text: 'Campaign slot',
                    variant: 'subtitle',
                    name: 'Ad title',
                    color: '#fee2e2',
                },
            })
        );
        addChild(
            adCard,
            createNode('text', {
                frame: { x: 0, y: 80, width: rightWidth - 48, height: 80 },
                props: {
                    text: '300 × 250',
                    variant: 'heading',
                    name: 'Ad dimensions',
                    color: '#ffffff',
                },
            })
        );
        addChild(
            adCard,
            createNode('button', {
                frame: { x: 0, y: 170, width: 160, height: 40 },
                props: { label: 'Replace creative', variant: 'secondary', name: 'Ad CTA' },
            })
        );
        addChild(section, adCard);

        const listCard = createNode('card', {
            frame: { x: rightColumnX, y: 320, width: rightWidth, height: 220 },
            props: { name: 'Release notes', padding: 24 },
        });
        addChild(
            listCard,
            createNode('text', {
                frame: { x: 0, y: 0, width: rightWidth - 48, height: 28 },
                props: { text: 'Release notes', variant: 'subtitle', name: 'List title' },
            })
        );
        const updates = ['Dark mode refinements', 'New template browser', 'AI copy assistant', 'Prototype sharing'];
        updates.forEach((update, index) => {
            addChild(
                listCard,
                createNode('container', {
                    frame: { x: 0, y: 36 + index * 40, width: rightWidth - 48, height: 32 },
                    props: { padding: 8, name: `${update} item` },
                })
            );
            addChild(
                listCard,
                createNode('text', {
                    frame: { x: 36, y: 40 + index * 40, width: rightWidth - 96, height: 24 },
                    props: { text: update, variant: 'body', name: `${update} description` },
                })
            );
        });
        addChild(section, listCard);

        section.frame.height = 560;
        return section;
    };

    const buildSearchHero = (frame = {}) => {
        const section = createNode('section', {
            frame,
            props: { padding: 80, gap: 32, name: 'Search hero' },
        });
        const widthAvailable = section.frame?.width ?? width - 80;
        addChild(
            section,
            createNode('text', {
                frame: { x: widthAvailable / 2 - 220, y: 0, width: 440, height: 48 },
                props: { text: 'Search the web', variant: 'subtitle', name: 'Search headline', align: 'center' },
            })
        );
        addChild(
            section,
            createNode('container', {
                frame: { x: widthAvailable / 2 - 260, y: 60, width: 520, height: 64 },
                props: { padding: 16, radius: 40, background: '#ffffff', name: 'Search input' },
            })
        );
        section.frame.height = 180;
        return section;
    };

    const buildSearchResults = (frame = {}) => {
        const section = createNode('section', {
            frame,
            props: { padding: 32, gap: 16, name: 'Search results' },
        });
        const usableWidth = section.frame?.width ?? width - 80;
        for (let index = 0; index < 5; index += 1) {
            const result = createNode('container', {
                frame: { x: 32, y: 32 + index * 124, width: usableWidth - 64, height: 108 },
                props: { padding: 16, name: `Result ${index + 1}` },
            });
            addChild(
                result,
                createNode('text', {
                    frame: { x: 0, y: 0, width: usableWidth - 96, height: 28 },
                    props: { text: `Result heading ${index + 1}`, variant: 'subtitle', name: 'Result title' },
                })
            );
            addChild(
                result,
                createNode('text', {
                    frame: { x: 0, y: 36, width: usableWidth - 96, height: 52 },
                    props: {
                        text: 'Short description of the destination page that elaborates on the result.',
                        variant: 'body',
                        name: 'Result snippet',
                    },
                })
            );
            addChild(section, result);
        }
        section.frame.height = 32 + 5 * 124;
        return section;
    };

    const buildStoreLayout = (frame = {}) => {
        const section = createNode('section', {
            frame,
            props: { padding: 32, gap: 32, name: 'Store layout' },
        });
        const sectionWidth = section.frame?.width ?? width - 80;
        const sidebarWidth = Math.max(220, sectionWidth * 0.22);
        const gridWidth = sectionWidth - sidebarWidth - 72;

        const filters = createNode('container', {
            frame: { x: 32, y: 32, width: sidebarWidth, height: 420 },
            props: { padding: 24, gap: 24, name: 'Filters', background: '#f8fafc' },
        });
        addChild(
            filters,
            createNode('text', {
                frame: { x: 0, y: 0, width: sidebarWidth - 48, height: 24 },
                props: { text: 'Filters', variant: 'subtitle', name: 'Filters heading' },
            })
        );
        for (let index = 0; index < 3; index += 1) {
            addChild(
                filters,
                createNode('container', {
                    frame: { x: 0, y: 40 + index * 90, width: sidebarWidth - 48, height: 72 },
                    props: { padding: 12, name: `Filter group ${index + 1}` },
                })
            );
        }

        const grid = createNode('container', {
            frame: { x: sidebarWidth + 56, y: 32, width: gridWidth, height: 540 },
            props: { padding: 0, name: 'Product grid' },
        });
        const cardSize = Math.max(180, (gridWidth - 48) / 3);
        for (let row = 0; row < 3; row += 1) {
            for (let col = 0; col < 3; col += 1) {
                addChild(
                    grid,
                    createNode('card', {
                        frame: {
                            x: col * (cardSize + 16),
                            y: row * (cardSize + 16),
                            width: cardSize,
                            height: cardSize,
                        },
                        props: { name: `Product ${row * 3 + col + 1}` },
                    })
                );
            }
        }

        addChild(section, filters);
        addChild(section, grid);
        section.frame.height = 32 + Math.max(filters.frame.height, grid.frame.height) + 32;
        return section;
    };

    const buildSocialHeader = (frame = {}) => {
        const section = createNode('section', {
            frame,
            props: { padding: 32, background: '#f8fafc', name: 'Profile header' },
        });
        const widthAvailable = section.frame?.width ?? width - 80;
        const banner = createNode('container', {
            frame: { x: 32, y: 32, width: widthAvailable - 64, height: 180 },
            props: { padding: 24, name: 'Cover image' },
        });
        addChild(section, banner);

        const info = createNode('container', {
            frame: { x: 32, y: 232, width: widthAvailable - 64, height: 140 },
            props: { padding: 16, gap: 16, name: 'Profile info' },
        });
        addChild(
            info,
            createNode('text', {
                frame: { x: 0, y: 0, width: widthAvailable - 96, height: 28 },
                props: { text: 'Jane Cooper', variant: 'subtitle', name: 'Display name' },
            })
        );
        addChild(
            info,
            createNode('text', {
                frame: { x: 0, y: 36, width: widthAvailable - 96, height: 56 },
                props: {
                    text: 'Product designer. Sharing UI tips, design systems, and remote workflows.',
                    variant: 'body',
                    name: 'Bio',
                },
            })
        );
        addChild(section, info);
        section.frame.height = 400;
        return section;
    };

    const buildSocialFeed = (frame = {}) => {
        const section = createNode('section', {
            frame,
            props: { padding: 32, gap: 24, name: 'Feed timeline' },
        });
        const usableWidth = section.frame?.width ?? width - 80;
        for (let index = 0; index < 4; index += 1) {
            const post = createNode('container', {
                frame: { x: 32, y: 32 + index * 184, width: usableWidth - 64, height: 168 },
                props: { padding: 16, name: `Post ${index + 1}` },
            });
            addChild(
                post,
                createNode('text', {
                    frame: { x: 0, y: 0, width: usableWidth - 96, height: 48 },
                    props: {
                        text: 'Here is a quick update from the weekend project I am working on…',
                        variant: 'body',
                        name: 'Post body',
                    },
                })
            );
            addChild(
                post,
                createNode('container', {
                    frame: { x: 0, y: 64, width: usableWidth - 96, height: 64 },
                    props: { padding: 12, name: 'Post attachment' },
                })
            );
            addChild(section, post);
        }
        section.frame.height = 32 + 4 * 184;
        return section;
    };

    switch (kind) {
        case 'saas':
            push(buildSaasTopBar({ height: 220 }));
            push(buildSaasPromoStrip({ height: 88 }));
            push(buildSaasContentGrid({ height: 560 }));
            break;
        case 'company':
        case 'marketing':
        case 'landing':
            push(buildNavbar({ height: 92 }));
            push(buildHero({ height: 420 }));
            push(buildFeatureChecklist({ height: 360 }));
            push(buildStatsRow({ height: 160 }));
            push(buildPricingTiers({ height: 400 }));
            push(buildCTA({ height: 160 }));
            break;
        case 'analytics':
        case 'dashboard':
            push(buildNavbar({ height: 80 }));
            push(buildDashboardHeader({ height: 188 }));
            push(buildStatsRow({ height: 160 }));
            push(buildDashboardPanels({ height: 720 }));
            break;
        case 'portfolio':
        case 'social':
            push(buildNavbar({ height: 80 }));
            push(buildPortfolioIntro({ height: 320 }));
            push(buildProjectGallery({ height: 520 }));
            push(buildMarketingTestimonials({ height: 280 }));
            push(buildContactStrip({ height: 120 }));
            break;
        case 'ecommerce':
            push(buildEcommerceHeader({ height: 280 }));
            push(buildEcommerceBody({ height: 584 }));
            break;
        case 'store':
            push(buildNavbar({ height: 92 }));
            push(buildHero({ height: 320 }));
            push(buildCategoryStrip({ height: 120 }));
            push(buildProductSpotlight({ height: 324 }));
            push(buildStoreLayout({ height: 640 }));
            push(buildNewsletterBanner({ height: 140 }));
            break;
        case 'blog':
            push(buildEditorialHeader({ height: 320 }));
            push(buildEditorialSpotlight({ height: 420 }));
            break;
        case 'auth':
            push(buildNavbar({ height: 72 }));
            push(buildSplitAuthSection({ height: 504 }));
            break;
        case 'search':
            push(buildNavbar({ height: 72 }));
            push(buildSearchHero({ height: 200 }));
            push(buildSearchResults({ height: 650 }));
            break;
        case 'mobile':
            push(buildNavbar({ width: width - 40, height: 96, x: 20 }));
            push(buildHero({ width: width - 40, height: 420, x: 20 }));
            push(buildCardsRow({ width: width - 40, height: 260, x: 20 }));
            break;
        case 'blank':
        default:
            // leave empty
            break;
    }

    const contentBottom = root.children.reduce((max, child) => {
        const frame = child.frame ?? { y: 0, height: 0 };
        return Math.max(max, (frame.y ?? 0) + (frame.height ?? 0));
    }, 0);
    const paddedBottom = contentBottom ? contentBottom + 80 : defaultHeight;
    root.height = Math.max(defaultHeight, paddedBottom);

    return root;
}
