"use client";

import { create } from "zustand";

export const useSnappingStore = create((set) => ({
  guides: [],
  highlightTarget: null,
  dropIndicator: null,
  setGuides: (guides) => set({ guides }),
  setHighlightTarget: (id) => set({ highlightTarget: id }),
  clearHighlight: () => set({ highlightTarget: null }),
  setDropIndicator: (dropIndicator) => set({ dropIndicator }),
  clearDropIndicator: () => set({ dropIndicator: null }),
  clearGuides: () => set({ guides: [] }),
}));
