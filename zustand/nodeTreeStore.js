'use client';

import { create } from 'zustand';
import { applyConstraints } from '@/lib/canvas-core/constraints/applyConstraints';
import { computeAutoLayoutSize } from '@/lib/canvas-core/layout/computeAutoLayoutSize';

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

        layout: node.layout ?? 'free',

        sizeX: node.sizeX ?? 'fixed',
        sizeY: node.sizeY ?? 'fixed',

        flexGrow: node.flexGrow ?? 1,
        alignSelf: node.alignSelf ?? 'auto',

        autoLayout: {
            direction: node.autoLayout?.direction ?? 'column',
            gap: node.autoLayout?.gap ?? 8,
            padding: node.autoLayout?.padding ?? 8,
            justify: node.autoLayout?.justify ?? 'start',
            align: node.autoLayout?.align ?? 'start',
        },

        constraints: {
            ...DEFAULT_CONSTRAINTS,
            ...normalizedConstraints,
        },

        constraintOffsets: {
            ...DEFAULT_OFFSETS,
            ...(node.constraintOffsets || {}),
        },

        minWidth: node.minWidth ?? 1,
        maxWidth: node.maxWidth ?? Infinity,
        minHeight: node.minHeight ?? 1,
        maxHeight: node.maxHeight ?? Infinity,

        breakpoints: node.breakpoints || [],
        children: node.children || [],
    };
};

/* =========================
   STORE
========================= */

export const useNodeTreeStore = create((set, get) => ({
    nodes: {},
    rootIds: [],

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

            const next = {
                ...current,
                ...updates,
                constraints: updates.constraints ? normalizeConstraints(updates.constraints) : current.constraints,
                width: Math.max(current.minWidth, Math.min(current.maxWidth, updates.width ?? current.width ?? 1)),
                height: Math.max(current.minHeight, Math.min(current.maxHeight, updates.height ?? current.height ?? 1)),
            };

            if (updates.constraints && current.parent) {
                const parent = state.nodes[current.parent];
                if (parent) {
                    next.constraintOffsets = computeConstraintOffsets(next, parent);
                }
            }

            return { nodes: { ...state.nodes, [id]: next } };
        }),

    recomputeConstraintOffsetsForParent: (parentId) =>
        set((state) => {
            const parent = state.nodes[parentId];
            if (!parent || !parent.children?.length) return state;

            const nodes = { ...state.nodes };

            parent.children.forEach((cid) => {
                const child = nodes[cid];
                if (!child) return;
                nodes[cid] = {
                    ...child,
                    constraintOffsets: computeConstraintOffsets(child, parent),
                };
            });

            return { nodes };
        }),

    applyConstraintsForParent: (parentId) => {
        const { nodes } = get();
        const parent = nodes[parentId];
        if (!parent) return;

        applyConstraints(parent, nodes, (childId, updates) => {
            get().updateNode(childId, updates);
        });

        get().recomputeConstraintOffsetsForParent(parentId);
    },

    /* ---------- AUTO-LAYOUT CONTROLS ---------- */

    setSizeMode: (id, axis) =>
        set((state) => {
            const node = state.nodes[id];
            if (!node) return state;

            const cycle = ['fixed', 'fill', 'hug'];
            const key = axis === 'x' ? 'sizeX' : 'sizeY';
            const next = cycle[(cycle.indexOf(node[key]) + 1) % cycle.length];

            let nextNode = { ...node, [key]: next };

            if (next === 'hug' && node.layout === 'flex') {
                const children = node.children.map((cid) => state.nodes[cid]).filter(Boolean);
                const nextSize = computeAutoLayoutSize(nextNode, children);
                if (nextSize) nextNode = { ...nextNode, ...nextSize };
            }

            return { nodes: { ...state.nodes, [id]: nextNode } };
        }),

    setAutoLayoutJustify: (id, value) =>
        set((state) => {
            const node = state.nodes[id];
            if (!node || node.layout !== 'flex') return state;

            return {
                nodes: {
                    ...state.nodes,
                    [id]: {
                        ...node,
                        autoLayout: { ...node.autoLayout, justify: value },
                    },
                },
            };
        }),

    setAutoLayoutAlign: (id, value) =>
        set((state) => {
            const node = state.nodes[id];
            if (!node || node.layout !== 'flex') return state;

            return {
                nodes: {
                    ...state.nodes,
                    [id]: {
                        ...node,
                        autoLayout: { ...node.autoLayout, align: value },
                    },
                },
            };
        }),

    setAutoLayoutPadding: (id, value) =>
        set((state) => {
            const node = state.nodes[id];
            if (!node || node.layout !== 'flex') return state;

            let nextNode = {
                ...node,
                autoLayout: { ...node.autoLayout, padding: Math.max(0, value) },
            };

            if (node.sizeX === 'hug' || node.sizeY === 'hug') {
                const children = node.children.map((cid) => state.nodes[cid]).filter(Boolean);
                const nextSize = computeAutoLayoutSize(nextNode, children);
                if (nextSize) nextNode = { ...nextNode, ...nextSize };
            }

            return { nodes: { ...state.nodes, [id]: nextNode } };
        }),

    setAutoLayoutGap: (id, value) =>
        set((state) => {
            const node = state.nodes[id];
            if (!node || node.layout !== 'flex') return state;

            let nextNode = {
                ...node,
                autoLayout: { ...node.autoLayout, gap: Math.max(0, value) },
            };

            if (node.sizeX === 'hug' || node.sizeY === 'hug') {
                const children = node.children.map((cid) => state.nodes[cid]).filter(Boolean);
                const nextSize = computeAutoLayoutSize(nextNode, children);
                if (nextSize) nextNode = { ...nextNode, ...nextSize };
            }

            return { nodes: { ...state.nodes, [id]: nextNode } };
        }),
    toggleAutoLayout: (id) =>
        set((state) => {
            const node = state.nodes[id];
            if (!node) return state;

            // TURN OFF
            if (node.layout === 'flex') {
                return {
                    nodes: {
                        ...state.nodes,
                        [id]: {
                            ...node,
                            layout: 'free',
                        },
                    },
                };
            }

            // TURN ON (initialize defaults safely)
            return {
                nodes: {
                    ...state.nodes,
                    [id]: {
                        ...node,
                        layout: 'flex',
                        autoLayout: {
                            direction: node.autoLayout?.direction ?? 'column',
                            gap: node.autoLayout?.gap ?? 8,
                            padding: node.autoLayout?.padding ?? 8,
                            justify: node.autoLayout?.justify ?? 'start',
                            align: node.autoLayout?.align ?? 'start',
                        },
                    },
                },
            };
        }),

    setAutoLayoutDirection: (id, direction) =>
        set((state) => {
            const node = state.nodes[id];
            if (!node || node.layout !== 'flex') return state;

            let nextNode = {
                ...node,
                autoLayout: {
                    ...node.autoLayout,
                    direction,
                },
            };

            // Recompute hug size if needed
            if (node.sizeX === 'hug' || node.sizeY === 'hug') {
                const children = node.children.map((cid) => state.nodes[cid]).filter(Boolean);

                const nextSize = computeAutoLayoutSize(nextNode, children);
                if (nextSize) nextNode = { ...nextNode, ...nextSize };
            }

            return {
                nodes: {
                    ...state.nodes,
                    [id]: nextNode,
                },
            };
        }),

    setFlexGrow: (id, value) =>
        set((state) => {
            const node = state.nodes[id];
            if (!node) return state;

            return {
                nodes: {
                    ...state.nodes,
                    [id]: { ...node, flexGrow: Math.max(0, value) },
                },
            };
        }),

    setAlignSelf: (id, value) =>
        set((state) => {
            const node = state.nodes[id];
            if (!node) return state;

            return {
                nodes: {
                    ...state.nodes,
                    [id]: { ...node, alignSelf: value },
                },
            };
        }),

    clearTree: () => set({ nodes: {}, rootIds: [] }),
}));
