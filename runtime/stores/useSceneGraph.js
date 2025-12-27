"use client";

import { create } from "zustand";

export const useSceneGraph = create((set, get) => ({
  nodes: {},

  upsertNode: (id, parentId = null) =>
    set((state) => {
      if (!id) return state;
      const nodes = { ...state.nodes };
      const existing = nodes[id] || { id, parentId: null, children: [] };

      // Detach from previous parent
      if (existing.parentId && existing.parentId !== parentId) {
        const prevParent = nodes[existing.parentId];
        if (prevParent) {
          prevParent.children = (prevParent.children || []).filter((c) => c !== id);
          nodes[existing.parentId] = { ...prevParent };
        }
      }

      // Attach to new parent
      if (parentId) {
        const parent = nodes[parentId] || { id: parentId, parentId: null, children: [] };
        const children = new Set(parent.children || []);
        children.add(id);
        nodes[parentId] = { ...parent, children: Array.from(children) };
      }

      nodes[id] = { ...existing, parentId: parentId ?? null, children: existing.children || [] };
      return { nodes };
    }),

  removeNode: (id) =>
    set((state) => {
      if (!id) return state;
      const nodes = { ...state.nodes };
      const node = nodes[id];
      if (!node) return state;
      if (node.parentId && nodes[node.parentId]) {
        nodes[node.parentId] = {
          ...nodes[node.parentId],
          children: (nodes[node.parentId].children || []).filter((c) => c !== id),
        };
      }
      delete nodes[id];
      return { nodes };
    }),
}));
