import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
    args: { designId: v.string() },
    handler: async ({ db }, { designId }) => {
        return await db.query('canvasNodes').withIndex('by_design', (q) => q.eq('designId', designId)).collect();
    },
});

export const upsert = mutation({
    args: {
        designId: v.string(),
        nodeId: v.string(),
        type: v.string(),
        props: v.any(),
        updatedBy: v.optional(v.id('users')),
    },
    handler: async ({ db }, node) => {
        const existing = await db
            .query('canvasNodes')
            .withIndex('by_design', (q) => q.eq('designId', node.designId))
            .filter((q) => q.eq(q.field('nodeId'), node.nodeId))
            .unique();

        if (existing) {
            await db.patch(existing._id, { ...node, updatedAt: Date.now() });
        } else {
            await db.insert('canvasNodes', { ...node, updatedAt: Date.now() });
        }
    },
});

export const remove = mutation({
    args: { designId: v.string(), nodeId: v.string() },
    handler: async ({ db }, { designId, nodeId }) => {
        const node = await db
            .query('canvasNodes')
            .withIndex('by_design', (q) => q.eq('designId', designId))
            .filter((q) => q.eq(q.field('nodeId'), nodeId))
            .unique();
        if (node) {
            await db.delete(node._id);
        }
    },
});
