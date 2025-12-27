"use client";

import { create } from "zustand";

export const useSnappingStore = create((set) => ({
  guides: [],
  highlightTarget: null,
  dropIndicator: null,
  spacingPreview: null,
  setGuides: (guides) => set({ guides }),
  setHighlightTarget: (id) => set({ highlightTarget: id }),
  clearHighlight: () => set({ highlightTarget: null }),
  setDropIndicator: (dropIndicator) => set({ dropIndicator }),
  clearDropIndicator: () => set({ dropIndicator: null }),
  setSpacingPreview: (spacingPreview) => set({ spacingPreview }),
  clearSpacingPreview: () => set({ spacingPreview: null }),
  clearGuides: () => set({ guides: [] }),
}));
