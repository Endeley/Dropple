'use client';

import { create } from 'zustand';
import { applyConstraints } from '@/lib/canvas-core/constraints/applyConstraints';
import { computeAutoLayoutSize } from '@/lib/canvas-core/layout/computeAutoLayoutSize';

/* =========================
   HELPERS
========================= */

const normalizeConstraints = (constraints = {}) => {
    const h = constraints.horizontal;
    const v = constraints.vertical;

    return {
        horizontal: h === 'stretch' ? 'left-right' : h ?? 'left',
        vertical: v === 'stretch' ? 'top-bottom' : v ?? 'top',
    };
};

const computeConstraintOffsets = (child, parent) => {
    if (!child || !parent) return { left: 0, right: 0, top: 0, bottom: 0 };

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

const DEFAULT_CONSTRAINTS = { horizontal: 'left', vertical: 'top' };
const DEFAULT_OFFSETS = { left: 0, right: 0, top: 0, bottom: 0 };

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
        constraints: { ...DEFAULT_CONSTRAINTS, ...normalizedConstraints },
        constraintOffsets: { ...DEFAULT_OFFSETS, ...(node.constraintOffsets || {}) },
        minWidth: node.minWidth ?? 1,
        maxWidth: node.maxWidth ?? Infinity,
        minHeight: node.minHeight ?? 1,
        maxHeight: node.maxHeight ?? Infinity,
        breakpoints: node.breakpoints || [],
        children: node.children || [],
    };
};

const initialState = {
    nodes: {},
    rootIds: [],
};

/* =========================
   STORE
========================= */

export const useNodeTreeStore = create((set, get) => ({
    ...initialState,

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
                    children: [...(parent.children || []), node.id],
                };

                normalized.parentId = parentId;
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

            if (updates.constraints && current.parentId) {
                const parent = state.nodes[current.parentId];
                if (parent) next.constraintOffsets = computeConstraintOffsets(next, parent);
            }

            return { nodes: { ...state.nodes, [id]: next } };
        }),

    removeNode: (id) =>
        set((state) => {
            if (!state.nodes[id]) return state;
            const nodes = { ...state.nodes };

            const removeRecursive = (nid) => {
                const node = nodes[nid];
                if (!node) return;
                (node.children || []).forEach(removeRecursive);
                delete nodes[nid];
            };

            const parentId = nodes[id].parentId;
            removeRecursive(id);

            if (parentId && nodes[parentId]) {
                nodes[parentId] = {
                    ...nodes[parentId],
                    children: (nodes[parentId].children || []).filter((c) => c !== id),
                };
            }

            return {
                nodes,
                rootIds: state.rootIds.filter((r) => r !== id),
            };
        }),

    setNodeParent: (id, newParentId = null, index = null) =>
        set((state) => {
            const nodes = { ...state.nodes };
            const node = nodes[id];
            if (!node) return state;

            // detach from old parent
            if (node.parentId && nodes[node.parentId]) {
                const prev = nodes[node.parentId];
                nodes[node.parentId] = { ...prev, children: (prev.children || []).filter((c) => c !== id) };
            }

            // attach to new parent
            if (newParentId && nodes[newParentId]) {
                const parent = nodes[newParentId];
                const children = [...(parent.children || [])];
                if (typeof index === 'number' && index >= 0) children.splice(index, 0, id);
                else children.push(id);
                nodes[newParentId] = { ...parent, children };
            }

            nodes[id] = { ...node, parentId: newParentId || null };

            const rootIds = newParentId
                ? state.rootIds.filter((r) => r !== id)
                : [...new Set([...state.rootIds.filter((r) => r !== id), id])];

            return { nodes, rootIds };
        }),

    reorderNode: (parentId, nodeId, newIndex) =>
        set((state) => {
            if (parentId) {
                const parent = state.nodes[parentId];
                if (!parent) return state;
                const children = (parent.children || []).filter((id) => id !== nodeId);
                children.splice(newIndex, 0, nodeId);
                return { nodes: { ...state.nodes, [parentId]: { ...parent, children } } };
            }
            const rootIds = state.rootIds.filter((id) => id !== nodeId);
            rootIds.splice(newIndex, 0, nodeId);
            return { rootIds };
        }),

    recomputeConstraintOffsetsForParent: (parentId) =>
        set((state) => {
            const parent = state.nodes[parentId];
            if (!parent || !parent.children?.length) return state;
            const nodes = { ...state.nodes };
            parent.children.forEach((cid) => {
                const child = nodes[cid];
                if (!child) return;
                nodes[cid] = { ...child, constraintOffsets: computeConstraintOffsets(child, parent) };
            });
            return { nodes };
        }),

    recomputeConstraintOffsetsForNode: (nodeId) =>
        set((state) => {
            const node = state.nodes[nodeId];
            if (!node || !node.parentId) return state;
            const parent = state.nodes[node.parentId];
            if (!parent) return state;
            return {
                nodes: {
                    ...state.nodes,
                    [nodeId]: { ...node, constraintOffsets: computeConstraintOffsets(node, parent) },
                },
            };
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
            return { nodes: { ...state.nodes, [id]: { ...node, autoLayout: { ...node.autoLayout, justify: value } } } };
        }),

    setAutoLayoutAlign: (id, value) =>
        set((state) => {
            const node = state.nodes[id];
            if (!node || node.layout !== 'flex') return state;
            return { nodes: { ...state.nodes, [id]: { ...node, autoLayout: { ...node.autoLayout, align: value } } } };
        }),

    setAutoLayoutPadding: (id, value) =>
        set((state) => {
            const node = state.nodes[id];
            if (!node || node.layout !== 'flex') return state;
            let nextNode = { ...node, autoLayout: { ...node.autoLayout, padding: Math.max(0, value) } };
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
            let nextNode = { ...node, autoLayout: { ...node.autoLayout, gap: Math.max(0, value) } };
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
            if (node.layout === 'flex') {
                return { nodes: { ...state.nodes, [id]: { ...node, layout: 'free' } } };
            }
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
            let nextNode = { ...node, autoLayout: { ...node.autoLayout, direction } };
            if (node.sizeX === 'hug' || node.sizeY === 'hug') {
                const children = node.children.map((cid) => state.nodes[cid]).filter(Boolean);
                const nextSize = computeAutoLayoutSize(nextNode, children);
                if (nextSize) nextNode = { ...nextNode, ...nextSize };
            }
            return { nodes: { ...state.nodes, [id]: nextNode } };
        }),

    setFlexGrow: (id, value) =>
        set((state) => {
            const node = state.nodes[id];
            if (!node) return state;
            return { nodes: { ...state.nodes, [id]: { ...node, flexGrow: Math.max(0, value) } } };
        }),

    setAlignSelf: (id, value) =>
        set((state) => {
            const node = state.nodes[id];
            if (!node) return state;
            return { nodes: { ...state.nodes, [id]: { ...node, alignSelf: value } } };
        }),

    insertSubtree: (nodesMap = {}, rootIds = []) =>
        set((state) => {
            const nodes = { ...state.nodes };
            const nextRootIds = new Set(state.rootIds);
            rootIds.forEach((rid) => nextRootIds.add(rid));
            Object.entries(nodesMap).forEach(([id, node]) => {
                nodes[id] = { ...node };
            });
            return { nodes, rootIds: Array.from(nextRootIds) };
        }),

    removeSubtree: (rootIds = []) =>
        set((state) => {
            if (!rootIds.length) return state;
            const nodes = { ...state.nodes };
            let rootSet = new Set(state.rootIds);
            const collect = (id, acc = []) => {
                const n = nodes[id];
                if (!n) return acc;
                acc.push(id);
                (n.children || []).forEach((cid) => collect(cid, acc));
                return acc;
            };
            rootIds.forEach((rid) => {
                const ids = collect(rid, []);
                ids.forEach((id) => delete nodes[id]);
                rootSet.delete(rid);
            });
            return { nodes, rootIds: Array.from(rootSet) };
        }),

    toggleLock: (id) =>
        set((state) => {
            const node = state.nodes[id];
            if (!node) return state;
            return { nodes: { ...state.nodes, [id]: { ...node, locked: !node.locked } } };
        }),

    toggleHidden: (id) =>
        set((state) => {
            const node = state.nodes[id];
            if (!node) return state;
            return { nodes: { ...state.nodes, [id]: { ...node, hidden: !node.hidden } } };
        }),

    renameNode: (id, name) =>
        set((state) => {
            const node = state.nodes[id];
            if (!node) return state;
            return { nodes: { ...state.nodes, [id]: { ...node, name } } };
        }),

    // Stubs for legacy callers
    createInstance: () => null,
    createComponent: () => null,

    clearTree: () => set({ ...initialState }),
}));

// Debug guard for duplicate instances
if (typeof window !== 'undefined') {
    window.__NODE_TREE_STORE__ = window.__NODE_TREE_STORE__ || useNodeTreeStore;
    if (window.__NODE_TREE_STORE__ !== useNodeTreeStore) {
        console.error('🚨 DUPLICATE NodeTreeStore INSTANCE DETECTED');
    }
}
