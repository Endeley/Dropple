"use client";

import { create } from "zustand";

const defaultConstraints = {
  horizontal: "left",
  vertical: "top",
};

const defaultTransform3d = {
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  translateZ: 0,
  perspective: 0,
  perspectiveOrigin: { x: 0.5, y: 0.5 },
  scaleZ: 1,
  transformStyle: "flat",
};

const defaultLayout = {
  enabled: false,
  direction: "vertical",
  alignment: "start",
  spacing: 8,
  padding: { top: 16, right: 16, bottom: 16, left: 16 },
  primaryAxisSizing: "fixed", // hug | fixed
  counterAxisSizing: "fixed", // hug | fill | fixed
};

const withDefaults = (node = {}) => ({
  constraints: { ...defaultConstraints, ...(node.constraints || {}) },
  layout: { ...defaultLayout, ...(node.layout || {}) },
  transform3d: { ...defaultTransform3d, ...(node.transform3d || {}) },
  ...node,
});

const collectSubtree = (nodes, rootId) => {
  const result = {};
  const walk = (id) => {
    const n = nodes[id];
    if (!n) return;
    result[id] = { ...n };
    (n.children || []).forEach(walk);
  };
  walk(rootId);
  return result;
};

const collectSubtreeIds = (nodes, rootId, acc = []) => {
  const n = nodes[rootId];
  if (!n) return acc;
  acc.push(rootId);
  (n.children || []).forEach((cid) => collectSubtreeIds(nodes, cid, acc));
  return acc;
};

const applyAutoLayout = (nodes, containerId) => {
  const container = nodes[containerId];
  if (!container?.layout?.enabled) return nodes;
  const layout = { ...defaultLayout, ...(container.layout || {}) };
  const childrenIds = container.children || [];
  let cursorX = layout.padding.left;
  let cursorY = layout.padding.top;
  let maxWidth = 0;
  let maxHeight = 0;
  const nextNodes = { ...nodes };

  childrenIds.forEach((childId, idx) => {
    const child = nextNodes[childId];
    if (!child) return;
    const spacing = idx === 0 ? 0 : layout.spacing || 0;
    if (layout.direction === "vertical") {
      cursorY += spacing;
      const width =
        layout.counterAxisSizing === "fill"
          ? Math.max(1, (container.width || child.width || 0) - layout.padding.left - layout.padding.right)
          : child.width || 0;
      nextNodes[childId] = { ...child, x: layout.padding.left, y: cursorY, width };
      cursorY += child.height || 0;
      maxWidth = Math.max(maxWidth, width);
      maxHeight = cursorY;
    } else {
      cursorX += spacing;
      const height =
        layout.counterAxisSizing === "fill"
          ? Math.max(1, (container.height || child.height || 0) - layout.padding.top - layout.padding.bottom)
          : child.height || 0;
      nextNodes[childId] = { ...child, x: cursorX, y: layout.padding.top, height };
      cursorX += child.width || 0;
      maxWidth = cursorX;
      maxHeight = Math.max(maxHeight, height);
    }
  });

  const nextContainer = { ...container, layout };
  if (layout.primaryAxisSizing === "hug") {
    if (layout.direction === "vertical") {
      nextContainer.height = maxHeight + layout.padding.bottom;
    } else {
      nextContainer.width = maxWidth + layout.padding.right;
    }
  }
  nextNodes[containerId] = nextContainer;
  return nextNodes;
};

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
  createComponentFromNode: (nodeId, componentId) => {
    const state = get();
    const masterNode = state.nodes[nodeId];
    if (!masterNode) return;
    const masterTree = collectSubtree(state.nodes, nodeId);
    return { master: masterTree, rootId: nodeId };
  },
  reflowAutoLayout: (containerId) =>
    set((state) => {
      const nodes = applyAutoLayout(state.nodes, containerId);
      return { nodes };
    }),

  setTree: (nodes = {}, rootIds = []) => set({ nodes, rootIds }),

  addNode: (node, parentId = null, index = null) =>
    set((state) => {
      const nodes = { ...state.nodes };
      const normalized = withDefaults(node);
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

      nodes[node.id] = { ...normalized, parent: targetParent };

      let nextNodes = nodes;
      if (targetParent && nodes[targetParent]?.layout?.enabled) {
        nextNodes = applyAutoLayout(nextNodes, targetParent);
      }
      return { nodes: nextNodes, rootIds: Array.from(nextRootIds) };
    }),

  updateNode: (id, updates) =>
    set((state) => {
      if (!state.nodes[id]) return state;
      const merged = withDefaults({ ...state.nodes[id], ...updates });
      const nodes = { ...state.nodes, [id]: merged };
      let nextNodes = nodes;
      if (merged.layout?.enabled) {
        nextNodes = applyAutoLayout(nextNodes, id);
      }
      if (merged.parent && nextNodes[merged.parent]?.layout?.enabled) {
        nextNodes = applyAutoLayout(nextNodes, merged.parent);
      }
      return { nodes: nextNodes, rootIds: state.rootIds };
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
      let nextNodes = nodes;
      if (parentId && nextNodes[parentId]?.layout?.enabled) {
        nextNodes = applyAutoLayout(nextNodes, parentId);
      }
      return { nodes: nextNodes, rootIds: Array.from(nextRootIds) };
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

  insertSubtree: (nodesMap = {}, rootIds = []) =>
    set((state) => {
      const nodes = { ...state.nodes };
      const nextRootIds = new Set(state.rootIds);
      rootIds.forEach((rid) => nextRootIds.add(rid));
      Object.entries(nodesMap).forEach(([id, node]) => {
        nodes[id] = { ...node };
      });
      return { nodes, rootIds: Array.from(nextRootIds) };
    }),

  removeSubtree: (rootIds = []) =>
    set((state) => {
      if (!rootIds.length) return state;
      const nodes = { ...state.nodes };
      let rootSet = new Set(state.rootIds);
      rootIds.forEach((rid) => {
        const ids = collectSubtreeIds(nodes, rid, []);
        ids.forEach((id) => delete nodes[id]);
        rootSet.delete(rid);
      });
      return { nodes, rootIds: Array.from(rootSet) };
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
