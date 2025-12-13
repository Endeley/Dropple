'use client';

import { create } from 'zustand';
import { applyConstraints } from '@/lib/canvas-core/constraints/applyConstraints';

/* =========================
   HELPERS
========================= */

const computeConstraintOffsets = (child, parent) => {
    if (!child || !parent) {
        return { left: 0, right: 0, top: 0, bottom: 0 };
    }

    return {
        left: (child.x ?? 0) - (parent.x ?? 0),
        top: (child.y ?? 0) - (parent.y ?? 0),
        right: (parent.x ?? 0) + (parent.width ?? 0) - ((child.x ?? 0) + (child.width ?? 0)),
        bottom: (parent.y ?? 0) + (parent.height ?? 0) - ((child.y ?? 0) + (child.height ?? 0)),
    };
};

const defaultConstraints = {
    horizontal: 'left',
    vertical: 'top',
};

const defaultConstraintOffsets = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
};

const withDefaults = (node) => ({
    ...node,
    constraints: {
        ...defaultConstraints,
        ...(node.constraints || {}),
    },
    constraintOffsets: {
        ...defaultConstraintOffsets,
        ...(node.constraintOffsets || {}),
    },
    children: node.children || [],
});

/* =========================
   STORE
========================= */

export const useNodeTreeStore = create((set, get) => ({
    /* ---------------- STATE ---------------- */

    nodes: {},
    rootIds: [],

    /* ---------------- TREE ---------------- */

    setTree: (nodes = {}, rootIds = []) =>
        set(() => ({
            nodes: Object.fromEntries(Object.entries(nodes).map(([id, node]) => [id, withDefaults(node)])),
            rootIds,
        })),

    addNode: (node, parentId = null) =>
        set((state) => {
            const normalized = withDefaults(node);
            const nodes = { ...state.nodes, [node.id]: normalized };

            if (parentId && nodes[parentId]) {
                const parent = nodes[parentId];

                nodes[parentId] = {
                    ...parent,
                    children: [...parent.children, node.id],
                };

                normalized.parent = parentId;
                normalized.constraintOffsets = computeConstraintOffsets(normalized, parent);
            }

            return {
                nodes,
                rootIds: parentId ? state.rootIds : [...state.rootIds, node.id],
            };
        }),

    updateNode: (id, updates) =>
        set((state) => {
            const current = state.nodes[id];
            if (!current) return state;

            const next = { ...current, ...updates };

            // 🔥 CRITICAL: constraints changed → recompute offsets
            const constraintsChanged = updates.constraints && JSON.stringify(updates.constraints) !== JSON.stringify(current.constraints);

            if (constraintsChanged && current.parent) {
                const parent = state.nodes[current.parent];
                if (parent) {
                    next.constraintOffsets = computeConstraintOffsets(next, parent);
                }
            }

            return {
                nodes: {
                    ...state.nodes,
                    [id]: next,
                },
            };
        }),

    removeNode: (id) =>
        set((state) => {
            const nodes = { ...state.nodes };

            const removeRecursively = (nodeId) => {
                const n = nodes[nodeId];
                if (!n) return;
                (n.children || []).forEach(removeRecursively);
                delete nodes[nodeId];
            };

            removeRecursively(id);

            return {
                nodes,
                rootIds: state.rootIds.filter((rid) => rid !== id),
            };
        }),

    /* ---------------- CONSTRAINT LIFECYCLE ---------------- */

    recomputeConstraintOffsetsForNode: (nodeId) =>
        set((state) => {
            const node = state.nodes[nodeId];
            if (!node || !node.parent) return state;

            const parent = state.nodes[node.parent];
            if (!parent) return state;

            return {
                nodes: {
                    ...state.nodes,
                    [nodeId]: {
                        ...node,
                        constraintOffsets: computeConstraintOffsets(
                            {
                                ...node,
                                width: Math.max(1, node.width ?? 1),
                                height: Math.max(1, node.height ?? 1),
                            },
                            parent
                        ),
                    },
                },
            };
        }),

    recomputeConstraintOffsetsForParent: (parentId) =>
        set((state) => {
            const parent = state.nodes[parentId];
            if (!parent) return state;

            const nodes = { ...state.nodes };

            Object.values(nodes).forEach((child) => {
                if (child?.parent !== parentId) return;

                nodes[child.id] = {
                    ...child,
                    constraintOffsets: computeConstraintOffsets(child, parent),
                };
            });

            return { nodes };
        }),

    /**
     * Applies constraints to all children of a parent
     * (called when parent resizes)
     */
    applyConstraintsForParent: (parentId) => {
        const { nodes } = get();
        const parent = nodes[parentId];
        if (!parent) return;

        applyConstraints(parent, nodes, (childId, updates) => {
            get().updateNode(childId, updates);
        });

        // refresh offsets after layout
        get().recomputeConstraintOffsetsForParent(parentId);
    },

    /* ---------------- CLEAR ---------------- */

    clearTree: () => set({ nodes: {}, rootIds: [] }),
}));
