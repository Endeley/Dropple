"use client";

import { create } from "zustand";
import { useNodeTreeStore } from "./nodeTreeStore";
import { useSelectionStore } from "./selectionStore";

const cloneSnapshot = (value) => {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
};

export const useHistoryStore = create((set, get) => ({
  past: [],
  present: null,
  future: [],
  limit: 100,

  recordSnapshot: (label = "") => {
    const nodes = useNodeTreeStore.getState().nodes;
    const rootIds = useNodeTreeStore.getState().rootIds;
    const selection = useSelectionStore.getState().selectedIds;
    const snapshot = { nodes: cloneSnapshot(nodes), rootIds: [...rootIds], selection: [...selection] };
    set((current) => {
      const nextPast = current.present ? [...current.past, current.present] : [...current.past];
      const trimmed =
        nextPast.length > current.limit ? nextPast.slice(nextPast.length - current.limit) : nextPast;
      return {
        past: trimmed,
        present: { state: snapshot, label },
        future: [],
      };
    });
  },

  undo: () => {
    const { past, present, future } = get();
    if (!past.length) return;
    const prev = past[past.length - 1];
    const nextPast = past.slice(0, -1);
    if (prev?.state) applyHistory(prev.state);
    set({
      past: nextPast,
      present: prev,
      future: present ? [present, ...future] : future,
    });
  },

  redo: () => {
    const { past, present, future } = get();
    if (!future.length) return;
    const next = future[0];
    const nextFuture = future.slice(1);
    if (next?.state) applyHistory(next.state);
    set({
      past: present ? [...past, present] : past,
      present: next,
      future: nextFuture,
    });
  },

  clear: () => set({ past: [], present: null, future: [] }),
}));

function applyHistory(state) {
  useNodeTreeStore.setState({ nodes: state.nodes || {}, rootIds: state.rootIds || [] });
  useSelectionStore.setState({ selectedIds: state.selection || [], manual: false });
}
