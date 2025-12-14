'use client';

import { create } from 'zustand';
import { useNodeTreeStore } from '@/zustand/nodeTreeStore';

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
    /* Existing state */
    selectedIds: [],
    manual: false,

    /* 🔹 NEW: blended constraint UI state */
    blendedConstraints: {
        x: null,
        y: null,
    },

    /* -------------------------------------------
     Selection actions (existing, extended)
  ------------------------------------------- */

    setSelected: (ids, manual = false) => {
        set({ selectedIds: ids, manual });
        get().updateBlendedConstraints();
    },

    setSelectedManual: (ids) => {
        set({ selectedIds: ids, manual: true });
        get().updateBlendedConstraints();
    },

    addToSelection: (id) =>
        set((state) => {
            const next = [...new Set([...(state.selectedIds || []), id])];
            return { selectedIds: next, manual: true };
        }),

    clearSelection: () => {
        set({ selectedIds: [], manual: false });
        get().updateBlendedConstraints();
    },

    clearManual: () => set((state) => ({ ...state, manual: false })),

    deselectAll: () => {
        set({ selectedIds: [], manual: false });
        get().updateBlendedConstraints();
    },

    /* -------------------------------------------
     🔹 NEW: Multi-select constraint blending
  ------------------------------------------- */

    updateBlendedConstraints: () => {
        const { selectedIds } = get();
        const { nodes } = useNodeTreeStore.getState();

        if (!selectedIds.length) {
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
