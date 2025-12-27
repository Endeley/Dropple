"use client";

import { create } from "zustand";

export const useUiStore = create((set) => ({
  theme: "dark",
  panels: { left: true, right: true, bottom: true },
  togglePanel: (name) =>
    set((state) => ({
      panels: { ...state.panels, [name]: !state.panels[name] },
    })),
  setTheme: (theme) => set({ theme }),
}));
