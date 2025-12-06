"use client";

import { create } from "zustand";

export const useSnappingStore = create((set) => ({
  guides: [],
  setGuides: (guides) => set({ guides }),
  clearGuides: () => set({ guides: [] }),
}));
