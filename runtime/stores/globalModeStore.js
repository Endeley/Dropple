"use client";

import { create } from "zustand";

export const useGlobalStore = create((set) => ({
  mode: "graphic",
  setMode: (mode) => set({ mode }),
}));
