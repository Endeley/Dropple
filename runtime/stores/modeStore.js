"use client";

import { create } from "zustand";

export const useModeStore = create((set) => ({
  currentMode: "graphic",
  setMode: (mode) => set({ currentMode: mode }),
}));
