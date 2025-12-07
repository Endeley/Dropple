"use client";

import { create } from "zustand";

export const useToolStore = create((set) => ({
  tool: "select",
  setTool: (tool) => set({ tool }),
  gridSize: 8,
  snapToGrid: false,
  setSnapToGrid: (snapToGrid) => set({ snapToGrid }),
  toggleGrid: () =>
    set((state) => ({
      snapToGrid: !state.snapToGrid,
    })),
}));
