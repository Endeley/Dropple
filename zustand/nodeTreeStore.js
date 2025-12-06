"use client";

import { create } from "zustand";

const removeWithChildren = (nodes, id) => {
  const ids = [id];
  const node = nodes[id];
  if (node?.children?.length) {
    node.children.forEach((childId) => {
      ids.push(...removeWithChildren(nodes, childId));
    });
  }
  return ids;
};

export const useNodeTreeStore = create((set, get) => ({
  nodes: {},
  rootIds: [],

  setTree: (nodes = {}, rootIds = []) => set({ nodes, rootIds }),

  addNode: (node, parentId = null, index = null) =>
    set((state) => {
      const nodes = { ...state.nodes };
      const targetParent = parentId ?? node.parent ?? null;
      const nextRootIds = new Set(state.rootIds);

      if (targetParent && nodes[targetParent]) {
        const parent = nodes[targetParent];
        const children = [...(parent.children || [])];
        if (index !== null && index >= 0) {
          children.splice(index, 0, node.id);
        } else {
          children.push(node.id);
        }
        nodes[targetParent] = { ...parent, children };
        nextRootIds.delete(node.id);
      } else if (!targetParent) {
        nextRootIds.add(node.id);
      }

      nodes[node.id] = { ...node, parent: targetParent };

      return { nodes, rootIds: Array.from(nextRootIds) };
    }),

  updateNode: (id, updates) =>
    set((state) => {
      if (!state.nodes[id]) return state;
      return {
        nodes: { ...state.nodes, [id]: { ...state.nodes[id], ...updates } },
      };
    }),

  removeNode: (id) =>
    set((state) => {
      if (!state.nodes[id]) return state;
      const nodes = { ...state.nodes };
      const toRemove = removeWithChildren(nodes, id);
      const parentId = nodes[id].parent;

      toRemove.forEach((nid) => {
        delete nodes[nid];
      });

      if (parentId && nodes[parentId]) {
        nodes[parentId] = {
          ...nodes[parentId],
          children: (nodes[parentId].children || []).filter(
            (child) => child !== id
          ),
        };
      }

      const rootIds = state.rootIds.filter((rootId) => !toRemove.includes(rootId));
      return { nodes, rootIds };
    }),

  setNodeParent: (id, newParentId = null, index = null) =>
    set((state) => {
      const nodes = { ...state.nodes };
      const node = nodes[id];
      if (!node) return state;

      const nextRootIds = new Set(state.rootIds);

      if (node.parent && nodes[node.parent]) {
        const prevParent = nodes[node.parent];
        nodes[node.parent] = {
          ...prevParent,
          children: (prevParent.children || []).filter((child) => child !== id),
        };
      }

      if (newParentId && nodes[newParentId]) {
        const parent = nodes[newParentId];
        const children = [...(parent.children || [])];
        if (index !== null && index >= 0) {
          children.splice(index, 0, id);
        } else {
          children.push(id);
        }
        nodes[newParentId] = { ...parent, children };
        nextRootIds.delete(id);
      } else {
        nextRootIds.add(id);
      }

      nodes[id] = { ...node, parent: newParentId || null };
      return { nodes, rootIds: Array.from(nextRootIds) };
    }),

  reorderNode: (parentId, nodeId, newIndex) =>
    set((state) => {
      if (parentId) {
        const parent = state.nodes[parentId];
        if (!parent) return state;
        const children = (parent.children || []).filter((id) => id !== nodeId);
        children.splice(newIndex, 0, nodeId);
        return {
          nodes: { ...state.nodes, [parentId]: { ...parent, children } },
        };
      }

      const rootIds = state.rootIds.filter((id) => id !== nodeId);
      rootIds.splice(newIndex, 0, nodeId);
      return { rootIds };
    }),

  toggleLock: (id) =>
    set((state) => {
      if (!state.nodes[id]) return state;
      return {
        nodes: {
          ...state.nodes,
          [id]: { ...state.nodes[id], locked: !state.nodes[id].locked },
        },
      };
    }),

  toggleHidden: (id) =>
    set((state) => {
      if (!state.nodes[id]) return state;
      return {
        nodes: {
          ...state.nodes,
          [id]: { ...state.nodes[id], hidden: !state.nodes[id].hidden },
        },
      };
    }),

  renameNode: (id, name) =>
    set((state) => {
      if (!state.nodes[id]) return state;
      return {
        nodes: { ...state.nodes, [id]: { ...state.nodes[id], name } },
      };
    }),

  clearTree: () => set({ nodes: {}, rootIds: [] }),
}));
