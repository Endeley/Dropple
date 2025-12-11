"use client";

import { create } from "zustand";
import { useComponentStore } from "./componentStore";

const defaultConstraints = {
  horizontal: "left",
  vertical: "top",
};

const defaultResponsiveFrame = {
  mode: "fixed", // fixed | responsive | fluid | adaptive
  minWidth: 320,
  maxWidth: 1920,
  adaptiveLayouts: {},
  baseWidth: null,
  baseHeight: null,
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
  directionByBreakpoint: {},
  wrap: false,
  alignment: "start",
  spacing: 8,
  spacingToken: null,
  padding: { top: 16, right: 16, bottom: 16, left: 16 },
  primaryAxisSizing: "fixed", // hug | fixed
  counterAxisSizing: "fixed", // hug | fill | fixed
};

const spacingTokens = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

const computeConstraintOffsets = (child, parent) => {
  if (!parent || !child) {
    return { left: 0, right: 0, top: 0, bottom: 0 };
  }
  const left = (child.x ?? 0) - (parent.x ?? 0);
  const top = (child.y ?? 0) - (parent.y ?? 0);
  const right = (parent.x ?? 0) + (parent.width ?? 0) - ((child.x ?? 0) + (child.width ?? 0));
  const bottom = (parent.y ?? 0) + (parent.height ?? 0) - ((child.y ?? 0) + (child.height ?? 0));
  return {
    left: Number.isFinite(left) ? left : 0,
    right: Number.isFinite(right) ? right : 0,
    top: Number.isFinite(top) ? top : 0,
    bottom: Number.isFinite(bottom) ? bottom : 0,
  };
};

const withDefaults = (node = {}) => {
  const base = {
    constraints: { ...defaultConstraints, ...(node.constraints || {}) },
    layout: { ...defaultLayout, ...(node.layout || {}) },
    transform3d: { ...defaultTransform3d, ...(node.transform3d || {}) },
    interactions: node.interactions || [],
    responsive: { ...defaultResponsiveFrame, ...(node.responsive || {}) },
    aspectRatio: node.aspectRatio ?? null,
    ...node,
  };

  // Give frames a visible default fill unless explicitly provided.
  if (base.type === "frame" && base.fill == null) {
    base.fill = "#f8fafc";
    if (base.stroke == null) base.stroke = "#cbd5e1";
    if (base.strokeWidth == null) base.strokeWidth = 1;
    if (base.scroll == null) base.scroll = { overflowX: "visible", overflowY: "visible" };
  }

  // Default container-like shapes (div/section behavior)
  if (base.type === "shape" || base.type === "rect") {
    if (base.fill == null) base.fill = "#f8fafc";
    if (base.backgroundImage == null) base.backgroundImage = null;
    if (base.backgroundGradient == null) base.backgroundGradient = null;
    if (base.padding == null) base.padding = 0;
    if (base.radius == null && base.borderRadius == null) base.radius = 0;
    if (base.autoLayout == null) {
      base.autoLayout = {
        enabled: false,
        direction: "vertical",
        spacing: 12,
        align: "start",
        justify: "start",
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
      };
    }
    if (base.scroll == null) base.scroll = { overflowX: "visible", overflowY: "visible" };
  }

  // Default box model for visual nodes
  const eligibleForBox = ["frame", "shape", "rect", "image", "text", "richtext"];
  if (eligibleForBox.includes(base.type)) {
    if (!base.box) {
      base.box = {
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        border: {
          width: 0,
          color: "rgba(0,0,0,0.2)",
          style: "solid",
          radius: base.radius || base.borderRadius || 0,
          radiusTopLeft: base.radius || base.borderRadius || 0,
          radiusTopRight: base.radius || base.borderRadius || 0,
          radiusBottomRight: base.radius || base.borderRadius || 0,
          radiusBottomLeft: base.radius || base.borderRadius || 0,
        },
        shadow: {
          enabled: false,
          x: 0,
          y: 2,
          blur: 8,
          spread: 0,
          color: "rgba(0,0,0,0.2)",
        },
        opacity: 1,
        outline: {
          width: 0,
          color: "rgba(0,0,0,0.2)",
          style: "solid",
        },
      };
    }
  }

  if (base.order == null) base.order = 0;
  if (base.slot === undefined) base.slot = null;
  if (base.slotName === undefined) base.slotName = null;
  if (!base.constraintOffsets) {
    base.constraintOffsets = { left: 0, right: 0, top: 0, bottom: 0 };
  }

  // Default constraints for all nodes (except frames already have defaults above)
  if (!base.constraints) {
    base.constraints = {
      horizontal: "left", // left, right, center, left-right, stretch
      vertical: "top", // top, bottom, center, top-bottom, stretch
    };
  }
  return base;
};

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

const resolveBreakpointOverride = (frame, activeBreakpointId) => {
  const layoutMap = frame?.responsive?.adaptiveLayouts || {};
  return activeBreakpointId && layoutMap[activeBreakpointId] ? layoutMap[activeBreakpointId] : null;
};

const reflowFrame = (nodes, frame, viewportWidth, activeBreakpointId) => {
  if (!frame) return nodes;
  const baseWidth = frame.responsive?.baseWidth || frame.width || viewportWidth || 0;
  const baseHeight = frame.responsive?.baseHeight || frame.height || 0;
  const responsive = { ...defaultResponsiveFrame, ...(frame.responsive || {}), baseWidth, baseHeight };
  let targetWidth = frame.width || baseWidth;
  switch (responsive.mode) {
    case "responsive":
    case "fluid":
    case "adaptive":
      targetWidth = Math.max(responsive.minWidth, Math.min(responsive.maxWidth, viewportWidth || baseWidth));
      break;
    case "fixed":
    default:
      targetWidth = frame.width || baseWidth;
      break;
  }
  let targetHeight = frame.height || baseHeight;
  if (frame.aspectRatio) {
    targetHeight = targetWidth / frame.aspectRatio;
  }
  const override = resolveBreakpointOverride(frame, activeBreakpointId);
  if (override) {
    targetWidth = override.width ?? targetWidth;
    targetHeight = override.height ?? targetHeight;
  }

  const nextNodes = { ...nodes };
  const updatedFrame = {
    ...frame,
    width: targetWidth,
    height: targetHeight,
    responsive,
  };
  nextNodes[frame.id] = updatedFrame;

  const scaleX = baseWidth ? targetWidth / baseWidth : 1;
  const scaleY = baseHeight ? targetHeight / baseHeight : 1;

  (frame.children || []).forEach((childId) => {
    const child = nextNodes[childId];
    if (!child) return;
    const c = child.constraints || defaultConstraints;
    let nx = child.x ?? 0;
    let ny = child.y ?? 0;
    let nw = child.width ?? 0;
    let nh = child.height ?? 0;

    const rightOffset = baseWidth - ((child.x ?? 0) + (child.width ?? 0));
    const bottomOffset = baseHeight - ((child.y ?? 0) + (child.height ?? 0));

    switch (c.horizontal) {
      case "left-right":
        nx = child.x ?? 0;
        nw = Math.max(1, targetWidth - nx - rightOffset);
        break;
      case "center":
        nw = child.width ?? 0;
        nx = Math.max(0, (targetWidth - nw) / 2);
        break;
      case "right":
        nw = child.width ?? 0;
        nx = Math.max(0, targetWidth - rightOffset - nw);
        break;
      case "scale":
        nx = (child.x ?? 0) * scaleX;
        nw = (child.width ?? 0) * scaleX;
        break;
      default:
        nx = child.x ?? 0;
        nw = child.width ?? 0;
        break;
    }

    switch (c.vertical) {
      case "top-bottom":
        ny = child.y ?? 0;
        nh = Math.max(1, targetHeight - ny - bottomOffset);
        break;
      case "center":
        nh = child.height ?? 0;
        ny = Math.max(0, (targetHeight - nh) / 2);
        break;
      case "bottom":
        nh = child.height ?? 0;
        ny = Math.max(0, targetHeight - bottomOffset - nh);
        break;
      case "scale":
        ny = (child.y ?? 0) * scaleY;
        nh = (child.height ?? 0) * scaleY;
        break;
      default:
        ny = child.y ?? 0;
        nh = child.height ?? 0;
        break;
    }

    nextNodes[childId] = { ...child, x: nx, y: ny, width: nw, height: nh };
  });

  if (updatedFrame.layout?.enabled) {
    return applyAutoLayout(nextNodes, frame.id);
  }

  return nextNodes;
};

const parseSpacing = (value, size, token) => {
  if (token && spacingTokens[token]) return spacingTokens[token];
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("token:")) {
      const t = trimmed.replace("token:", "");
      if (spacingTokens[t]) return spacingTokens[t];
    }
    if (trimmed.endsWith("%")) {
      const pct = parseFloat(trimmed.replace("%", "")) || 0;
      return (pct / 100) * size;
    }
    if (spacingTokens[trimmed]) return spacingTokens[trimmed];
    const num = parseFloat(trimmed);
    if (!Number.isNaN(num)) return num;
  }
  return 0;
};

const clampSize = (value, min, max) => {
  let v = value;
  if (typeof min === "number") v = Math.max(min, v);
  if (typeof max === "number") v = Math.min(max, v);
  return v;
};

const applyAutoLayout = (nodes, containerId, opts = {}) => {
  const container = nodes[containerId];
  if (!container?.layout?.enabled) return nodes;
  const layout = { ...defaultLayout, ...(container.layout || {}) };
  const activeDirection = layout.directionByBreakpoint?.[opts.breakpointId] || layout.direction;
  const childrenIds = container.children || [];
  let cursorX = layout.padding.left;
  let cursorY = layout.padding.top;
  let maxWidth = 0;
  let maxHeight = 0;
  let lineExtent = 0;
  const spacingValue = parseSpacing(
    layout.spacing,
    activeDirection === "vertical" ? container.height || 0 : container.width || 0,
    layout.spacingToken,
  );
  const nextNodes = { ...nodes };

  childrenIds.forEach((childId, idx) => {
    const child = nextNodes[childId];
    if (!child) return;
    const spacing = idx === 0 ? 0 : spacingValue;
    if (activeDirection === "vertical") {
      cursorY += spacing;
      const width =
        layout.counterAxisSizing === "fill"
          ? Math.max(1, (container.width || child.width || 0) - layout.padding.left - layout.padding.right)
          : child.width || 0;
      const clampedWidth = clampSize(width, child.minWidth, child.maxWidth);
      const clampedHeight = clampSize(child.height || 0, child.minHeight, child.maxHeight);
      if (layout.wrap && container.height && cursorY + (child.height || 0) > (container.height || 0)) {
        cursorY = layout.padding.top;
        cursorX = maxWidth + spacing;
      }
      nextNodes[childId] = { ...child, x: cursorX, y: cursorY, width: clampedWidth, height: clampedHeight };
      cursorY += clampedHeight;
      maxWidth = Math.max(maxWidth, cursorX + clampedWidth);
      maxHeight = Math.max(maxHeight, cursorY);
      lineExtent = Math.max(lineExtent, clampedWidth);
    } else {
      cursorX += spacing;
      const height =
        layout.counterAxisSizing === "fill"
          ? Math.max(1, (container.height || child.height || 0) - layout.padding.top - layout.padding.bottom)
          : child.height || 0;
      const clampedHeight = clampSize(height, child.minHeight, child.maxHeight);
      const clampedWidth = clampSize(child.width || 0, child.minWidth, child.maxWidth);
      if (layout.wrap && container.width && cursorX + (child.width || 0) > (container.width || 0)) {
        cursorX = layout.padding.left;
        cursorY += lineExtent + spacing;
        lineExtent = 0;
      }
      nextNodes[childId] = { ...child, x: cursorX, y: cursorY, height: clampedHeight, width: clampedWidth };
      cursorX += clampedWidth;
      maxWidth = Math.max(maxWidth, cursorX);
      maxHeight = Math.max(maxHeight, cursorY + clampedHeight);
      lineExtent = Math.max(lineExtent, clampedHeight);
    }
  });

  const nextContainer = { ...container, layout };
  if (layout.primaryAxisSizing === "hug") {
    if (activeDirection === "vertical") {
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

  recomputeConstraintOffsetsForParent: (parentId) =>
    set((state) => {
      if (!parentId) return state;
      const parent = state.nodes[parentId];
      if (!parent) return state;
      const nodes = { ...state.nodes };
      Object.values(nodes).forEach((child) => {
        if (!child || child.parent !== parentId) return;
        nodes[child.id] = {
          ...child,
          constraintOffsets: computeConstraintOffsets(child, parent),
        };
      });
      return { nodes };
    }),

  setTree: (nodes = {}, rootIds = []) => set({ nodes, rootIds }),

  createComponent: (rootId) => {
    let createdId = null;
    set((state) => {
      const master = collectSubtree(state.nodes, rootId);
      const compId = crypto.randomUUID();
      createdId = compId;
      useComponentStore.getState().addComponent({
        id: compId,
        rootId,
        nodes: master,
        rootIds: [rootId],
      });
      return state;
    });
    return createdId;
  },

  createInstance: (componentId, x = 0, y = 0) => {
    let createdId = null;
    set((state) => {
      const comp = useComponentStore.getState().getComponent(componentId);
      if (!comp) return state;
      const instanceId = crypto.randomUUID();
      createdId = instanceId;
      const masterRoot = comp.nodes?.[comp.rootId];
      const width = masterRoot?.width || 100;
      const height = masterRoot?.height || 100;
      const node = withDefaults({
        id: instanceId,
        type: "component-instance",
        componentId,
        nodeOverrides: {},
        propOverrides: {},
        x,
        y,
        width,
        height,
        children: [],
      });
      return {
        nodes: { ...state.nodes, [instanceId]: node },
        rootIds: [...state.rootIds, instanceId],
      };
    });
    return createdId;
  },

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
        normalized.constraintOffsets = computeConstraintOffsets(normalized, parent);
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

  reparentNode: (id, newParentId = null) =>
    set((state) => {
      const nodes = { ...state.nodes };
      if (!nodes[id]) return state;
      const nextRootIds = new Set(state.rootIds);

      // Remove from old parent/root
      const prevParent = nodes[id].parent;
      if (prevParent && nodes[prevParent]) {
        nodes[prevParent] = {
          ...nodes[prevParent],
          children: (nodes[prevParent].children || []).filter((cid) => cid !== id),
        };
      } else {
        nextRootIds.delete(id);
      }

      // Attach to new parent or root
      if (newParentId && nodes[newParentId]) {
        const parent = nodes[newParentId];
        const children = Array.from(new Set([...(parent.children || []), id]));
        nodes[newParentId] = { ...parent, children };
        nodes[id] = {
          ...nodes[id],
          parent: newParentId,
          constraintOffsets: computeConstraintOffsets(nodes[id], parent),
        };
      } else {
        nodes[id] = { ...nodes[id], parent: null };
        nextRootIds.add(id);
      }

      return { nodes, rootIds: Array.from(nextRootIds) };
    }),

  updateNode: (id, updates) =>
    set((state) => {
      if (!state.nodes[id]) return state;
      const current = state.nodes[id];
      const parent = current.parent ? state.nodes[current.parent] : null;
      const mergedBase = { ...current, ...updates };
      // Recalculate offsets only when spatial fields change or parent supplied.
      const spatialChanged =
        updates.parent !== undefined ||
        updates.x !== undefined ||
        updates.y !== undefined ||
        updates.width !== undefined ||
        updates.height !== undefined;
      if (parent && spatialChanged) {
        mergedBase.constraintOffsets = computeConstraintOffsets(mergedBase, parent);
      }
      const merged = mergedBase;
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

  updateResponsive: (id, responsive) =>
    set((state) => {
      if (!state.nodes[id]) return state;
      const current = state.nodes[id];
      const mergedResponsive = { ...defaultResponsiveFrame, ...(current.responsive || {}), ...(responsive || {}) };
      const merged = withDefaults({ ...current, responsive: mergedResponsive });
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

  applyResponsiveLayout: (viewportWidth = 1440, activeBreakpointId = null) =>
    set((state) => {
      let nextNodes = { ...state.nodes };
      const frameIds = state.rootIds.filter((id) => state.nodes[id]?.type === "frame");
      frameIds.forEach((fid) => {
        nextNodes = reflowFrame(nextNodes, nextNodes[fid], viewportWidth, activeBreakpointId);
        if (nextNodes[fid]?.layout?.enabled) {
          nextNodes = applyAutoLayout(nextNodes, fid, { breakpointId: activeBreakpointId });
        }
      });
      return { nodes: nextNodes };
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
        nodes[id] = withDefaults({ ...node });
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
