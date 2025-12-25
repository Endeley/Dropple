'use client';

import { create } from 'zustand';

/* -------------------------------------------
   Helpers
------------------------------------------- */

const blend = (values) => {
    const unique = new Set(values);
    return unique.size === 1 ? [...unique][0] : 'MIXED';
};

/* -------------------------------------------
   Selection Store
------------------------------------------- */

export const useSelectionStore = create((set, get) => ({
    /* Core state */
    selectedIds: [],
    manual: false,

    /* Derived UI state (safe) */
    blendedConstraints: {
        x: null,
        y: null,
    },

    /* -------------------------------------------
       Selection actions
    ------------------------------------------- */

    setSelected: (ids, manual = false) => {
        set({ selectedIds: ids, manual });
    },

    setSelectedManual: (ids) => {
        set({ selectedIds: ids, manual: true });
    },

    addToSelection: (id) =>
        set((state) => ({
            selectedIds: [...new Set([...(state.selectedIds || []), id])],
            manual: true,
        })),

    deselectAll: () => {
        set({ selectedIds: [], manual: false });
    },

    clearManual: () => set((state) => ({ ...state, manual: false })),

    /* -------------------------------------------
       SAFE DERIVED UPDATE (EXTERNAL INPUT)
    ------------------------------------------- */

    /**
     * This MUST be called by UI code
     * with a snapshot of nodes.
     */
    updateBlendedConstraintsFromNodes: (nodes) => {
        const { selectedIds } = get();

        if (!selectedIds.length || !nodes) {
            set({
                blendedConstraints: { x: null, y: null },
            });
            return;
        }

        const selectedNodes = selectedIds.map((id) => nodes[id]).filter(Boolean);

        set({
            blendedConstraints: {
                x: blend(selectedNodes.map((n) => n.constraints?.x)),
                y: blend(selectedNodes.map((n) => n.constraints?.y)),
            },
        });
    },
}));
