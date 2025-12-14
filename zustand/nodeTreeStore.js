'use client';

import { create } from 'zustand';
import { applyConstraints } from '@/lib/canvas-core/constraints/applyConstraints';
import { useSelectionStore } from '@/zustand/selectionStore';

/* =========================
   HELPERS (PURE)
========================= */

const normalizeConstraints = (constraints = {}) => {
    const h = constraints.horizontal;
    const v = constraints.vertical;

    return {
        horizontal: h === 'stretch' ? 'left-right' : (h ?? 'left'),
        vertical: v === 'stretch' ? 'top-bottom' : (v ?? 'top'),
    };
};

const computeConstraintOffsets = (child, parent) => {
    if (!child || !parent) {
        return { left: 0, right: 0, top: 0, bottom: 0 };
    }

    const cx = child.x ?? 0;
    const cy = child.y ?? 0;
    const cw = Math.max(1, child.width ?? 1);
    const ch = Math.max(1, child.height ?? 1);

    const px = parent.x ?? 0;
    const py = parent.y ?? 0;
    const pw = parent.width ?? 0;
    const ph = parent.height ?? 0;

    return {
        left: cx - px,
        top: cy - py,
        right: px + pw - (cx + cw),
        bottom: py + ph - (cy + ch),
    };
};

const DEFAULT_CONSTRAINTS = {
    horizontal: 'left',
    vertical: 'top',
};

const DEFAULT_OFFSETS = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
};

const withDefaults = (node) => {
    const normalizedConstraints = normalizeConstraints(node.constraints);

    return {
        ...node,
        constraints: {
            ...DEFAULT_CONSTRAINTS,
            ...normalizedConstraints,
        },
        constraintOffsets: {
            ...DEFAULT_OFFSETS,
            ...(node.constraintOffsets || {}),
        },
        breakpoints: node.breakpoints || [],
        children: node.children || [],
    };
};

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
            const nodes = { ...state.nodes };

            nodes[node.id] = normalized;

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

            const normalizedConstraints = updates.constraints ? normalizeConstraints(updates.constraints) : current.constraints;

            const next = {
                ...current,
                ...updates,
                constraints: normalizedConstraints,
                width: Math.max(1, updates.width ?? current.width ?? 1),
                height: Math.max(1, updates.height ?? current.height ?? 1),
            };

            const constraintsChanged = updates.constraints && JSON.stringify(normalizedConstraints) !== JSON.stringify(current.constraints);

            if (constraintsChanged && current.parent) {
                const parent = state.nodes[current.parent];
                if (parent) {
                    next.constraintOffsets = computeConstraintOffsets(next, parent);
                }

                /* 🔹 MULTI-SELECT CONSTRAINT BLENDING HOOK */
                useSelectionStore.getState().updateBlendedConstraints();
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
                if (!child || child.parent !== parentId) return;

                nodes[child.id] = {
                    ...child,
                    constraintOffsets: computeConstraintOffsets(child, parent),
                };
            });

            return { nodes };
        }),

    /**
     * 🔒 ONLY place constraints are applied
     * Called after parent resize (mouse up)
     */
    applyConstraintsForParent: (parentId) => {
        const { nodes } = get();
        const parent = nodes[parentId];
        if (!parent) return;

        applyConstraints(parent, nodes, (childId, updates) => {
            get().updateNode(childId, updates);
        });

        // refresh offsets after final layout
        get().recomputeConstraintOffsetsForParent(parentId);
    },

    /* ---------------- CLEAR ---------------- */

    clearTree: () => set({ nodes: {}, rootIds: [] }),
}));
