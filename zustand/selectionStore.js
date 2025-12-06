"use client";

import { create } from "zustand";

export const useSelectionStore = create((set) => ({
  selectedIds: [],
  setSelected: (ids) => set({ selectedIds: ids }),
  addToSelection: (id) =>
    set((state) => ({
      selectedIds: [...new Set([...(state.selectedIds || []), id])],
    })),
  clearSelection: () => set({ selectedIds: [] }),
}));
