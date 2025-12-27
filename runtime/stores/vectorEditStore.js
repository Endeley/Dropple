"use client";

import { create } from "zustand";

export const useVectorEditStore = create((set) => ({
  editingPathId: null,
  selected: null, // { anchorIndex, handle: "anchor" | "cx1" | "cx2" }
  setEditingPath: (id) => set({ editingPathId: id, selected: null }),
  clearEditing: () => set({ editingPathId: null, selected: null }),
  setSelectedHandle: (selected) => set({ selected }),
}));
