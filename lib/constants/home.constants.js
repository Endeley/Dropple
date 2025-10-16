export const features = [
    { title: 'Templates', description: 'Curated content, crafted with brand-consistent layouts.', badge: 'T', href: '/templates' },
    { title: 'AI Studio', description: 'Generate complex visuals with our AI-first design tools.', badge: 'AI', href: '/editor?tool=ai' },
    { title: 'Logo Maker', description: 'Create bespoke logo systems ready for print and web.', badge: 'LM', href: '/templates?category=brand-identity' },
    { title: 'Brand Kit', description: 'Keep typography, palettes, and assets aligned in one place.', badge: 'BK', href: '/editor?view=brand-kit' },
    { title: 'Social Kit', description: 'Ship platform-perfect posts with smart resizing and exports.', badge: 'SK', href: '/templates?category=social' },
    { title: 'Business', description: 'Collaborate securely with approvals and shared libraries.', badge: 'B', href: '/dashboard?view=teams' },
];

export const logos = [
    { label: 'Company', href: '/templates?category=business' },
    { label: 'Finova', href: '/templates?category=finance' },
    { label: 'Strive', href: '/templates?category=startups' },
    { label: 'Nexify', href: '/templates?category=marketing' },
    { label: 'Globe', href: '/templates?category=enterprise' },
];

export const headerLinks = [
    { label: 'Features', href: '/templates' },
    { label: 'Pricing', href: '/dashboard?view=pricing' },
    { label: 'Resources', href: '/dashboard?view=resources' },
];

export const audienceSegments = [
    { title: 'Enterprises', blurb: 'Empower global teams with governance, SLAs, and premium onboarding.', href: '/templates?category=enterprise' },
    { title: 'Businesses', blurb: 'Scale creative production with centralized brand kits and approvals.', href: '/templates?category=business' },
    { title: 'Creators', blurb: 'Ship polished content faster with ready-to-edit templates and AI boosts.', href: '/templates?category=creators' },
    { title: 'Educators', blurb: 'Engage students with collaborative workspaces and classroom-ready assets.', href: '/templates?category=education' },
    { title: 'Teams', blurb: 'Invite collaborators, assign roles, and track progress in one hub.', href: '/dashboard?view=teams' },
];

export const footerSections = [
    {
        title: 'Product',
        links: [
            { label: 'Features', href: '/templates' },
            { label: 'Pricing', href: '/dashboard?view=pricing' },
            { label: 'Integrations', href: '/dashboard?view=integrations' },
        ],
    },
    {
        title: 'Solutions',
        links: [
            { label: 'For Individuals', href: '/templates?category=creators' },
            { label: 'For Businesses', href: '/templates?category=business' },
            { label: 'For Organizations', href: '/templates?category=enterprise' },
            { label: 'Developer Tools', href: '/dashboard?view=integrations' },
        ],
    },
    {
        title: 'Resources',
        links: [
            { label: 'Blog', href: '/dashboard?view=resources' },
            { label: 'Help Center', href: '/dashboard?view=support' },
            { label: 'Community', href: '/dashboard?view=community' },
            { label: 'Support', href: 'mailto:hello@dropple.co' },
        ],
    },
    {
        title: 'Company',
        links: [
            { label: 'About Us', href: '/dashboard?view=about' },
            { label: 'Careers', href: '/dashboard?view=careers' },
            { label: 'Press', href: '/dashboard?view=press' },
            { label: 'Contact', href: 'mailto:hello@dropple.co' },
        ],
    },
];

export const footerLegalLinks = [
    { label: 'Terms of Service', href: '/dashboard?view=legal-terms' },
    { label: 'Privacy Policy', href: '/dashboard?view=privacy' },
];

export const footerLinks = [
    { label: 'About', href: '/dashboard?view=about' },
    { label: 'Help', href: '/dashboard?view=support' },
    { label: 'Privacy', href: '/dashboard?view=privacy' },
    { label: 'Terms', href: '/dashboard?view=legal-terms' },
];
