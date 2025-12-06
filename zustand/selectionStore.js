"use client";

import { create } from "zustand";

export const useSelectionStore = create((set) => ({
  selectedIds: [],
  manual: false,
  setSelected: (ids, manual = false) => set({ selectedIds: ids, manual }),
  setSelectedManual: (ids) => set({ selectedIds: ids, manual: true }),
  addToSelection: (id) =>
    set((state) => ({
      selectedIds: [...new Set([...(state.selectedIds || []), id])],
      manual: true,
    })),
  clearSelection: () => set({ selectedIds: [], manual: false }),
  clearManual: () => set((state) => ({ ...state, manual: false })),
  deselectAll: () => set({ selectedIds: [], manual: false }),
}));
