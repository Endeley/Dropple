"use client";

import { create } from "zustand";

const cloneSnapshot = (value) => {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
};

export const useHistoryStore = create((set, get) => ({
  past: [],
  present: null, // { state, label }
  future: [],
  limit: 100,

  init: (state, label = "init") =>
    set({
      past: [],
      future: [],
      present: { state: cloneSnapshot(state), label },
    }),

  setLimit: (limit) =>
    set((current) => {
      const trimmed =
        current.past.length > limit
          ? current.past.slice(current.past.length - limit)
          : current.past;
      return { limit, past: trimmed };
    }),

  push: (state, label = "") =>
    set((current) => {
      const nextPast = current.present
        ? [...current.past, current.present]
        : [...current.past];
      const trimmed =
        nextPast.length > current.limit
          ? nextPast.slice(nextPast.length - current.limit)
          : nextPast;

      return {
        past: trimmed,
        present: { state: cloneSnapshot(state), label },
        future: [],
      };
    }),

  undo: () =>
    set((current) => {
      if (!current.past.length) return current;
      const prev = current.past[current.past.length - 1];
      const past = current.past.slice(0, -1);
      const future = current.present
        ? [current.present, ...current.future]
        : current.future;
      return { past, present: prev, future };
    }),

  redo: () =>
    set((current) => {
      if (!current.future.length) return current;
      const next = current.future[0];
      const future = current.future.slice(1);
      const past = current.present
        ? [...current.past, current.present]
        : current.past;
      return { past, present: next, future };
    }),

  clear: () => set({ past: [], present: null, future: [] }),

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
  current: () => get().present?.state ?? null,
}));
