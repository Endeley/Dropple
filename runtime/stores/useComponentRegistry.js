"use client";

import { create } from "zustand";

export const useComponentRegistry = create((set, get) => ({
  registry: {},
  register: (id, ref) =>
    set((state) => ({
      registry: { ...state.registry, [id]: ref },
    })),
  unregister: (id) =>
    set((state) => {
      const next = { ...state.registry };
      delete next[id];
      return { registry: next };
    }),
  getRef: (id) => get().registry[id],
}));
