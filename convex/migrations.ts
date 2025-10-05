import { mutation } from './_generated/server';

import { ensureTemplateData, validateTemplateData } from './templateData';

const LEGACY_KEY_NAME = 'migration:legacyBackfill:2025-03-31';

function hasArtboards(data: any): boolean {
    return Boolean(data && typeof data === 'object' && Array.isArray(data.artboards) && data.artboards.length);
}

async function markMigrationRan(ctx: any) {
    await ctx.db.insert('migrations', {
        key: LEGACY_KEY_NAME,
        createdAt: Date.now(),
    });
}

async function hasMigrationRan(ctx: any) {
    const existing = await ctx.db
        .query('migrations')
        .withIndex('by_key', (q: any) => q.eq('key', LEGACY_KEY_NAME))
        .first();
    return Boolean(existing);
}

async function backfillTemplates(ctx: any) {
    const templates = await ctx.db.query('templates').collect();
    let migrated = 0;
    for (const tpl of templates) {
        const data = tpl.data;
        if (!data || hasArtboards(data)) {
            continue;
        }

        const normalized = ensureTemplateData(data, {
            artboardId: data.defaultArtboardId ?? `ab-${tpl.slug ?? tpl._id}`,
            artboardName: tpl.title ?? 'Artboard',
        });
        validateTemplateData(normalized);

        const templatePayload: any = {
            ...normalized,
            title: normalized.title ?? tpl.title,
            slug: normalized.slug ?? tpl.slug,
            category: normalized.category ?? tpl.category,
        };

        await ctx.db.patch(tpl._id, {
            data: templatePayload,
            updatedAt: Date.now(),
        });
        migrated += 1;
    }
    return migrated;
}

async function backfillDesigns(ctx: any) {
    const designs = await ctx.db.query('designs').collect();
    let migrated = 0;
    for (const design of designs) {
        const data = design.data;
        if (!data || hasArtboards(data)) {
            continue;
        }

        const normalized = ensureTemplateData(data, {
            artboardId: data.defaultArtboardId ?? `ab-${design._id}`,
            artboardName: data.title ?? design.title ?? 'Artboard',
        });
        validateTemplateData(normalized);

        const designPayload: any = {
            ...normalized,
            designId: design._id,
            updatedAt: Date.now(),
            ownerUserId: design.ownerUserId,
        };
        if (data?.templateId) {
            designPayload.templateId = data.templateId;
        }

        await ctx.db.patch(design._id, {
            data: designPayload,
            pages: [normalized],
            width: normalized.artboards[0]?.size?.width ?? design.width,
            height: normalized.artboards[0]?.size?.height ?? design.height,
            updatedAt: Date.now(),
        });
        migrated += 1;
    }
    return migrated;
}

export const backfillLegacyTemplatesAndDesigns = mutation({
    args: {},
    handler: async (ctx) => {
        if (await hasMigrationRan(ctx)) {
            return { status: 'skipped', reason: 'already_migrated' };
        }

        const [templateCount, designCount] = await Promise.all([backfillTemplates(ctx), backfillDesigns(ctx)]);

        await markMigrationRan(ctx);

        return {
            status: 'ok',
            templatesMigrated: templateCount,
            designsMigrated: designCount,
        };
    },
});
