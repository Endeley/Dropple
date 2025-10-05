import { mutation } from './_generated/server';
import { api } from './_generated/api';

export const seedEverything = mutation({
    args: {},
    handler: async (ctx) => {
        const summary: { step: string; result: unknown }[] = [];

        const categoryResult = await ctx.runMutation(api.seedTemplates.seedTemplateCategories, {});
        summary.push({ step: 'templateCategories', result: categoryResult });

        const sampleTemplates = await ctx.runMutation(api.seedTemplates.seedSampleTemplates, {});
        summary.push({ step: 'sampleTemplates', result: sampleTemplates });

        const catalogTemplates = await ctx.runMutation(api.templatesSeed.seedFromCatalog, {});
        summary.push({ step: 'catalogTemplates', result: catalogTemplates });

        return { seeded: summary };
    },
});
