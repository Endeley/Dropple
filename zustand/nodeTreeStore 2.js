'use client';

import { create } from 'zustand';

/**
 * CANONICAL CANVAS STORE
 * ---------------------
 * - Holds ONLY state
 * - Mutated ONLY via reducers (dispatchEvent)
 * - NO business logic
 * - NO layout logic
 * - NO AI logic
 */

export const useNodeTreeStore = create((set) => ({
    /* =====================
     CORE STATE
  ===================== */
    nodes: {}, // { [id]: CanvasNode }
    rootIds: [], // ordered root node ids

    /* =====================
     SAFE STATE SETTERS
     (used by dispatcher / replay only)
  ===================== */

    /**
     * Replace entire tree (replay, load, reset)
     */
    setTree: (nodes = {}, rootIds = []) =>
        set({
            nodes,
            rootIds,
        }),

    /**
     * Clear canvas completely
     */
    clearTree: () =>
        set({
            nodes: {},
            rootIds: [],
        }),
}));

// Debug guard to detect duplicate store instances during hot reload
if (typeof window !== 'undefined') {
    window.__NODE_TREE_STORE__ = window.__NODE_TREE_STORE__ || useNodeTreeStore;
    if (window.__NODE_TREE_STORE__ !== useNodeTreeStore) {
        console.error('🚨 DUPLICATE NodeTreeStore INSTANCE DETECTED');
    }
}
