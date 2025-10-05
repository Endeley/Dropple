import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

import { ensureTemplateData, validateTemplateData } from './templateData';
import { Id } from './_generated/dataModel';

export const list = query({
    args: { category: v.optional(v.string()), search: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const results = await ctx.db.query('templates').collect();
        const filtered = results.filter((tpl) => {
            if (args.category && !(tpl.category ?? '').startsWith(args.category)) {
                return false;
            }
            if (args.search) {
                const target = args.search.toLowerCase();
                const haystack = [tpl.title, tpl.description, tpl.category]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();
                if (!haystack.includes(target)) {
                    return false;
                }
            }
            return true;
        });
        return filtered.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
    },
});

export const getBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query('templates')
            .withIndex('by_slug', (q) => q.eq('slug', args.slug))
            .first();
    },
});

export const startFromTemplate = mutation({
    args: {
        templateId: v.id('templates'),
        userId: v.id('users'),
        teamId: v.optional(v.id('teams')),
        title: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const template = await ctx.db.get(args.templateId);
        if (!template) {
            throw new Error('Template not found');
        }

        const now = Date.now();
        const normalizedData = template.data
            ? ensureTemplateData(template.data, {
                  artboardId: template.data?.defaultArtboardId ?? `ab-${template.slug}`,
                  artboardName: template.title,
              })
            : null;

        if (normalizedData) {
            validateTemplateData(normalizedData);
        }

        const designData = normalizedData
            ? {
                  ...normalizedData,
                  title: normalizedData.title ?? template.title,
                  slug: normalizedData.slug ?? template.slug,
                  category: normalizedData.category ?? template.category,
                  templateId: template._id,
              }
            : null;

        const width = designData?.canvas?.width ?? template.data?.canvas?.width;
        const height = designData?.canvas?.height ?? template.data?.canvas?.height;
        const pages = designData ? [designData] : normalizedData ? [normalizedData] : [];

        const initialData = designData
            ? {
                  ...designData,
                  title: args.title ?? designData.title ?? template.title,
                  templateId: template._id,
                  updatedAt: now,
              }
            : normalizedData
            ? {
                  ...normalizedData,
                  title: args.title ?? normalizedData.title ?? template.title,
                  templateId: template._id,
                  updatedAt: now,
              }
            : undefined;

        if (initialData) {
            validateTemplateData(initialData);
        }

        const designId = await ctx.db.insert('designs', {
            userId: args.userId,
            ...(args.teamId ? { teamId: args.teamId } : {}),
            title: args.title ?? `${template.title} – Copy`,
            layoutId: template.layoutId,
            width,
            height,
            pages,
            previewUrl: template.thumbnailUrl ?? undefined,
            type: template.category,
            status: 'draft',
            data: initialData,
            createdAt: now,
            updatedAt: now,
        });

        const patchedData = {
            ...(initialData ?? {}),
            title: args.title ?? (initialData?.title ?? template.title),
            templateId: template._id,
            designId,
            updatedAt: now,
        };

        await ctx.db.patch(designId, {
            data: patchedData,
        });

        const usageCount = (template.usageCount ?? 0) + 1;
        const popularityScore = Math.round(usageCount * 0.7 + (template.isFeatured ? 10 : 0));
        await ctx.db.patch(args.templateId, {
            usageCount,
            popularityScore,
            updatedAt: now,
        });

        return designId as Id<'designs'>;
    },
});
