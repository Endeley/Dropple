import { mutation } from './_generated/server';

import { ensureTemplateData, validateTemplateData } from './templateData';

const CREATOR_TEMPLATE_META = {
    title: 'Creator Spotlight Poster',
    description: 'Bold creator poster with hero image, headline, role, and CTA.',
    category: 'creators',
};

const CREATOR_TEMPLATE_DATA = {
    version: 1,
    canvas: { width: 1080, height: 1920 },
    background: '#0F172A',
    brandBindings: { primaryColor: 'brand.primary', fonts: ['Inter', 'Poppins'] },
    elements: [
        {
            id: 'bgAccent',
            type: 'rect',
            name: 'Top Accent',
            position: { x: 0, y: 0 },
            size: { width: 1080, height: 360 },
            fill: { type: 'solid', color: '#111827' },
        },
        {
            id: 'heroImage',
            type: 'image',
            name: 'Hero Image',
            src: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=60',
            position: { x: 90, y: 180 },
            size: { width: 900, height: 540 },
            opacity: 1,
            locked: false,
        },
        {
            id: 'chip',
            type: 'rect',
            name: 'Chip',
            position: { x: 90, y: 780 },
            size: { width: 170, height: 44 },
            fill: { type: 'solid', color: '#0EA5E9' },
            radius: 22,
        },
        {
            id: 'chipText',
            type: 'text',
            name: 'Tag',
            text: 'CREATOR',
            fontFamily: 'Inter',
            fontSize: 22,
            fontWeight: 700,
            color: '#FFFFFF',
            position: { x: 115, y: 789 },
            size: { width: 300, height: 40 },
            textAlign: 'left',
            letterSpacing: 1,
        },
        {
            id: 'heading',
            type: 'text',
            name: 'Name',
            text: 'Marissa Carter',
            fontFamily: 'Inter',
            fontSize: 82,
            fontWeight: 800,
            color: '#FFFFFF',
            position: { x: 90, y: 850 },
            size: { width: 900, height: 140 },
            textAlign: 'left',
            lineHeight: 1.05,
        },
        {
            id: 'subhead',
            type: 'text',
            name: 'Role',
            text: 'Digital Creator & Filmmaker',
            fontFamily: 'Inter',
            fontSize: 36,
            fontWeight: 600,
            color: '#22D3EE',
            position: { x: 90, y: 980 },
            size: { width: 900, height: 60 },
            textAlign: 'left',
        },
        {
            id: 'bio',
            type: 'text',
            name: 'Bio',
            text: 'Story-driven visuals for brands & artists. Events, reels, campaigns.',
            fontFamily: 'Inter',
            fontSize: 28,
            fontWeight: 400,
            color: '#94A3B8',
            position: { x: 90, y: 1040 },
            size: { width: 900, height: 140 },
            textAlign: 'left',
            lineHeight: 1.3,
        },
        {
            id: 'ctaBtn',
            type: 'rect',
            name: 'CTA Button',
            position: { x: 90, y: 1210 },
            size: { width: 240, height: 64 },
            fill: { type: 'solid', color: '#6366F1' },
            radius: 32,
        },
        {
            id: 'ctaText',
            type: 'text',
            name: 'CTA Label',
            text: 'Book Now →',
            fontFamily: 'Inter',
            fontSize: 28,
            fontWeight: 700,
            color: '#FFFFFF',
            position: { x: 120, y: 1226 },
            size: { width: 200, height: 40 },
            textAlign: 'left',
        },
        {
            id: 'footerLine',
            type: 'rect',
            name: 'Footer Line',
            position: { x: 90, y: 1720 },
            size: { width: 900, height: 2 },
            opacity: 0.3,
            fill: { type: 'solid', color: '#94A3B8' },
        },
        {
            id: 'social',
            type: 'text',
            name: 'Social',
            text: '@marissacreates  •  youtube.com/@marissa',
            fontFamily: 'Inter',
            fontSize: 22,
            fontWeight: 500,
            color: '#CBD5E1',
            position: { x: 90, y: 1740 },
            size: { width: 900, height: 40 },
            textAlign: 'left',
        },
    ],
};

export const seedCreatorTemplate = mutation({
    args: {},
    handler: async (ctx) => {
        const slug = 'creator-spotlight-poster';
        const existing = await ctx.db
            .query('templates')
            .withIndex('by_slug', (q) => q.eq('slug', slug))
            .first();
        if (existing) {
            return 'Creator template already exists';
        }

        const now = Date.now();
        const data = ensureTemplateData(CREATOR_TEMPLATE_DATA, {
            artboardId: 'ab-creator-spotlight',
            artboardName: 'Poster',
        });
        validateTemplateData(data);
        await ctx.db.insert('templates', {
            title: CREATOR_TEMPLATE_META.title,
            slug,
            category: CREATOR_TEMPLATE_META.category,
            description: CREATOR_TEMPLATE_META.description,
            data,
            tags: ['creators', 'poster'],
            isFeatured: true,
            isPremium: false,
            thumbnailUrl:
                'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1080&q=80',
            popularityScore: 0,
            usageCount: 0,
            status: 'active',
            createdAt: now,
            updatedAt: now,
        });

        return 'Seeded Creator template ✅';
    },
});
