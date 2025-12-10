"use client";

import { create } from "zustand";
import { deepClone as cloneDeep } from "@/lib/deepClone";
import { motionThemeMap } from "@/lib/motionThemes";
import { applyMotionThemeToLayers } from "@/lib/applyMotionTheme";
import { componentToNodes } from "@/lib/componentToNodes";
import { normalizeAssets } from "@/lib/normalizeAssets";

const defaultAutoLayout = {
  enabled: false,
  direction: "vertical",
  padding: 16,
  gap: 12,
  align: "start",
  hugging: false,
};

const defaultConstraints = {
  horizontal: "left",
  vertical: "top",
};

const defaultLayerMeta = {
  locked: false,
  hidden: false,
  expanded: true,
  name: "Layer",
  interactions: [],
  responsive: {
    base: {},
    tablet: {},
    desktop: {},
    large: {},
  },
  animations: [],
};

const DEFAULT_TIMELINE_DURATION = 4000;
const DEFAULT_TIMELINE_FPS = 60;
const TIMELINE_TRACKS = [
  { property: "position", defaultValue: { x: 0, y: 0 } },
  { property: "scale", defaultValue: { x: 1, y: 1 } },
  { property: "rotation", defaultValue: 0 },
  { property: "opacity", defaultValue: 1 },
  { property: "color", defaultValue: "#ffffff" },
  { property: "filter", defaultValue: { blur: 0, contrast: 100, saturate: 100 } },
  { property: "clipPath", defaultValue: "none" },
  { property: "transform3d", defaultValue: { rotateX: 0, rotateY: 0, translateZ: 0 } },
];

const buildTracksFromLayer = (layer) =>
  TIMELINE_TRACKS.map((track) => ({
    property: track.property,
    keyframes: [
      {
        time: 0,
        value:
          typeof track.defaultValue === "object"
            ? { ...track.defaultValue }
            : track.defaultValue,
        easing: "ease-out",
      },
      {
        time: 1200,
        value:
          typeof track.defaultValue === "object"
            ? { ...track.defaultValue }
            : track.defaultValue,
        easing: "ease-in-out",
      },
    ],
  }));

export const useTemplateBuilderStore = create((set, get) => {
  const getActiveContext = () => {
    const state = get();
    if (state.isEditingComponent && state.editingComponentId) {
      const component = state.components.find(
        (c) => c._id === state.editingComponentId,
      );
      if (!component) {
        return { mode: "template", layers: state.currentTemplate.layers, component: null };
      }
      const nodes = state.editingVariantId
        ? component.variants?.find((v) => v.id === state.editingVariantId)?.nodes || []
        : component.nodes || [];
      return { mode: "component", layers: nodes, component };
    }
    const activePage =
      state.pages.find((p) => p.id === state.activePageId) || state.pages[0] || null;
    return {
      mode: "template",
      layers: activePage?.layers || state.currentTemplate.layers,
      component: null,
    };
  };

  const getActivePage = () => {
    const state = get();
    return state.pages.find((p) => p.id === state.activePageId) || state.pages[0];
  };

  const setActivePageLayers = (layers) => {
    set((state) => {
      const pageIndex = state.pages.findIndex((p) => p.id === state.activePageId);
      if (pageIndex === -1) return state;
      const pages = [...state.pages];
      pages[pageIndex] = { ...pages[pageIndex], layers };
      return {
        pages,
        currentTemplate: { ...state.currentTemplate, layers },
      };
    });
    get().triggerAutoSave();
  };

  const findLayer = (id) => {
    const context = getActiveContext();
    return context.layers.find((l) => l.id === id) || null;
  };

  const collectClipboardLayers = (ids) => {
    const { layers } = getActiveContext();
    const map = new Map(layers.map((l) => [l.id, l]));
    const visited = new Set();
    const collected = [];

    const dfs = (layerId) => {
      if (!layerId || visited.has(layerId)) return;
      const layer = map.get(layerId);
      if (!layer) return;
      visited.add(layerId);
      collected.push(cloneDeep(layer));
      (layer.children || []).forEach(dfs);
    };

    const roots = [];
    ids.forEach((id) => {
      if (!map.has(id)) return;
      roots.push(id);
      dfs(id);
    });

    return { layers: collected, rootIds: roots };
  };

  const remapClipboardLayers = (clipboard, targetParentId, offset) => {
    const idMap = new Map();
    clipboard.layers.forEach((layer) => {
      idMap.set(layer.id, "layer_" + crypto.randomUUID());
    });

    const rootNewIds = [];
    const remapped = clipboard.layers.map((layer) => {
      const clone = cloneDeep(layer);
      const originalId = clone.id;
      clone.id = idMap.get(originalId);
      if (clipboard.rootIds.includes(originalId)) {
        rootNewIds.push(clone.id);
      }

      if (clone.parentId && idMap.has(clone.parentId)) {
        clone.parentId = idMap.get(clone.parentId);
      } else if (targetParentId && clipboard.rootIds.includes(originalId)) {
        clone.parentId = targetParentId;
      }

      if (clone.children?.length) {
        clone.children = clone.children
          .map((childId) => idMap.get(childId) ?? childId)
          .filter(Boolean);
      }

      if (clipboard.rootIds.includes(originalId)) {
        clone.x = (clone.x || 0) + offset;
        clone.y = (clone.y || 0) + offset;
      }

      return clone;
    });

    return { remapped, rootNewIds };
  };

  const applyRemappedClones = (remapped, rootNewIds, shouldSelect = true) => {
    const state = get();
    beginHistoryTransaction("paste layers");
    const context = getActiveContext();

    if (context.mode === "component" && context.component) {
      set((currentState) => {
        const components = currentState.components.map((comp) => {
          if (comp._id !== context.component._id) return comp;
          const next = { ...comp };

          if (currentState.editingVariantId) {
            const variants = [...(comp.variants || [])];
            const idx = variants.findIndex(
              (v) => v.id === currentState.editingVariantId,
            );
            if (idx !== -1) {
              const variant = variants[idx];
              variants[idx] = {
                ...variant,
                nodes: [...(variant.nodes || []), ...remapped],
              };
              next.variants = variants;
            }
          } else {
            next.nodes = [...(comp.nodes || []), ...remapped];
          }

          return next;
        });

        const updatedComponent = components.find(
          (c) => c._id === context.component._id,
        );
        const targetNodes = currentState.editingVariantId
          ? updatedComponent?.variants?.find(
              (v) => v.id === currentState.editingVariantId,
            )?.nodes
          : updatedComponent?.nodes;

        let updatedLayers = getActivePage().layers || [];
        if (targetNodes) {
          updatedLayers = updatedLayers.map((l) => {
            if (
              l.type !== "component-instance" ||
              l.componentId !== context.component._id
            )
              return l;
            const matchesVariant =
              (l.variantId || null) === (currentState.editingVariantId || null);
            if (!matchesVariant) return l;
            return {
              ...l,
              nodes: targetNodes,
              componentNodes: updatedComponent?.nodes || l.componentNodes,
              componentVariants: updatedComponent?.variants || l.componentVariants,
            };
          });
        }

        const selection =
          shouldSelect && rootNewIds.length
            ? {
                selectedLayerId: rootNewIds[0],
                selectedLayers: rootNewIds,
              }
            : {};

        return {
          components,
          currentTemplate: {
            ...currentState.currentTemplate,
            layers: updatedLayers,
          },
          ...selection,
        };
      });
      setActivePageLayers(
        get().currentTemplate.layers,
      );
      get().triggerAutoSave();
      endHistoryTransaction();
      return;
    }

    const baseLayers = getActivePage().layers || [];
    const layerMap = new Map(baseLayers.map((l) => [l.id, { ...l }]));

    remapped.forEach((layer) => {
      layerMap.set(layer.id, layer);
    });

    remapped.forEach((layer) => {
      if (!layer.parentId) return;
      const parent = layerMap.get(layer.parentId);
      if (!parent) return;
      parent.children = Array.from(new Set([...(parent.children || []), layer.id]));
      layerMap.set(parent.id, parent);
    });

  const layers = Array.from(layerMap.values());
  const selection =
    shouldSelect && rootNewIds.length
      ? { selectedLayerId: rootNewIds[0], selectedLayers: rootNewIds }
      : {};

    set({
      currentTemplate: {
        ...state.currentTemplate,
        layers,
      },
      ...selection,
    });
    setActivePageLayers(layers);

    state.triggerAutoSave();
    endHistoryTransaction();
  };

  const snapshotState = (state) => ({
    pages: cloneDeep(state.pages),
    activePageId: state.activePageId,
    currentTemplate: cloneDeep(state.currentTemplate),
    components: cloneDeep(state.components),
    instanceRegistry: cloneDeep(state.instanceRegistry),
    selectedLayers: cloneDeep(state.selectedLayers),
    selectedLayerId: state.selectedLayerId,
  });

  const pushHistory = (label = "change") => {
    if (get().historyTransaction) return;
    const snap = snapshotState(get());
    set((state) => {
      const next = state.historyStack.slice(0, state.historyPointer + 1);
      next.push({ label, snap });
      return { historyStack: next, historyPointer: next.length - 1 };
    });
  };

  const restoreSnapshot = (snap) => {
    set((state) => ({
      ...state,
      pages: cloneDeep(snap.pages),
      activePageId: snap.activePageId,
      currentTemplate: cloneDeep(snap.currentTemplate),
      components: cloneDeep(snap.components),
      instanceRegistry: cloneDeep(snap.instanceRegistry),
      selectedLayers: cloneDeep(snap.selectedLayers),
      selectedLayerId: snap.selectedLayerId,
    }));
  };

  const beginHistoryTransaction = (label = "change") => {
    pushHistory(label);
    set({ historyTransaction: true });
  };

  const endHistoryTransaction = () => set({ historyTransaction: false });

  // --- NodeStore helpers (operate on active page layers) ---
  const getNode = (id) => getActivePage().layers?.find((l) => l.id === id) || null;
  const getChildren = (id) => (getActivePage().layers || []).filter((l) => l.parentId === id);

  const setLayersWithHistory = (layers, label = "change") => {
    pushHistory(label);
    setActivePageLayers(layers);
  };

  const insertNodes = (nodes = [], { parentId = null, undoable = true } = {}) => {
    if (!nodes.length) return;
    if (undoable) beginHistoryTransaction("insert nodes");
    const layers = [...(getActivePage().layers || [])];
    nodes.forEach((n) => {
      const node = { ...n };
      if (parentId) {
        node.parentId = parentId;
        const parent = layers.find((l) => l.id === parentId);
        if (parent) {
          parent.children = Array.from(new Set([...(parent.children || []), node.id]));
        }
      }
      layers.push(node);
    });
    setActivePageLayers(layers);
    get().triggerAutoSave();
    if (undoable) endHistoryTransaction();
  };

  const updateNode = (id, patch = {}, { undoable = true } = {}) => {
    const layers = (getActivePage().layers || []).map((l) =>
      l.id === id ? { ...l, ...patch } : l,
    );
    undoable ? setLayersWithHistory(layers, "update node") : setActivePageLayers(layers);
    get().triggerAutoSave();
  };

  const deleteNode = (id, { undoable = true } = {}) => {
    const removeIds = new Set();
    const walk = (targetId) => {
      removeIds.add(targetId);
      getChildren(targetId).forEach((c) => walk(c.id));
    };
    walk(id);
    let layers = (getActivePage().layers || []).filter((l) => !removeIds.has(l.id));
    // prune children refs
    layers = layers.map((l) => ({
      ...l,
      children: (l.children || []).filter((cid) => !removeIds.has(cid)),
    }));
    undoable ? setLayersWithHistory(layers, "delete node") : setActivePageLayers(layers);
    get().triggerAutoSave();
  };

  const moveNode = (id, newParentId = null, index = null, { undoable = true } = {}) => {
    const layers = [...(getActivePage().layers || [])];
    const nodeIdx = layers.findIndex((l) => l.id === id);
    if (nodeIdx === -1) return;
    const node = { ...layers[nodeIdx], parentId: newParentId };
    layers[nodeIdx] = node;
    // remove from old parents
    layers.forEach((l) => {
      if (l.children?.includes(id)) {
        l.children = l.children.filter((cid) => cid !== id);
      }
    });
    if (newParentId) {
      const parentIdx = layers.findIndex((l) => l.id === newParentId);
      if (parentIdx !== -1) {
        const parent = { ...layers[parentIdx] };
        const nextChildren = [...(parent.children || [])];
        if (index === null || index > nextChildren.length) index = nextChildren.length;
        nextChildren.splice(index ?? nextChildren.length, 0, id);
        parent.children = Array.from(new Set(nextChildren));
        layers[parentIdx] = parent;
      }
    }
    undoable ? setLayersWithHistory(layers, "move node") : setActivePageLayers(layers);
    get().triggerAutoSave();
  };

  const duplicateNodes = (ids = [], { undoable = true } = {}) => {
    if (undoable) pushHistory("duplicate nodes");
    const created = [];
    ids.forEach((id) => {
      const newIds = get().duplicateLayer(id, { select: false });
      if (newIds?.length) created.push(...newIds);
    });
    if (created.length) {
      set({ selectedLayerId: created[0], selectedLayers: created });
    }
    get().triggerAutoSave();
    return created;
  };

  const transformNode = (id, transform = {}) => {
    const node = getNode(id);
    if (!node) return;
    const patch = {
      x: transform.x ?? node.x,
      y: transform.y ?? node.y,
      width: transform.width ?? node.width,
      height: transform.height ?? node.height,
      rotation: transform.rotation ?? node.rotation,
    };
    updateNode(id, patch);
  };

  const writeNodePatch = (id, patch = {}) => {
    const layer = getNode(id);
    if (!layer) return;
    const instId = layer.componentInstanceId;
    const inst = instId ? get().instanceRegistry?.[instId] : null;
    const isAttached = inst && !inst.detached;
    // slot takes priority
    if (layer.slotId && isAttached) {
      if (patch.content !== undefined) {
        get().updateInstanceSlots(instId, { [layer.slotId]: patch.content });
        return;
      }
    }
    if (isAttached) {
      get().updateInstanceOverrides(instId, {
        [layer.id]: { ...(inst.overrides?.[layer.id] || {}), ...patch },
      });
      return;
    }
    updateNode(layer.id, patch);
  };

  const toggleLayerVisibility = (id) => {
    const node = getNode(id);
    if (!node) return;
    updateNode(id, { hidden: !node.hidden }, { undoable: true });
  };

  const toggleLayerLock = (id) => {
    const node = getNode(id);
    if (!node) return;
    updateNode(id, { locked: !node.locked }, { undoable: true });
  };

  const persistInstance = async (instanceId, frameOverride = null) => {
    const projectId = get().currentTemplate.id;
    if (!projectId) return;
    const inst = get().instanceRegistry?.[instanceId];
    if (!inst) return;
    const payload = {
      ...inst,
      frame: frameOverride || inst.frame || null,
    };
    try {
      await fetch("/api/components/instances/save", {
        method: "POST",
        body: JSON.stringify({ projectId, instance: payload }),
      });
    } catch (_err) {
      // best-effort; ignore
    }
  };

  const saveEditorState = async () => {
    const projectId = get().currentTemplate.id;
    if (!projectId) return;
    const state = get();
    try {
      await fetch("/api/editor/state/save", {
        method: "POST",
        body: JSON.stringify({
          projectId,
          templateId: state.currentTemplate.id,
          pages: state.pages,
          layers: state.pages.reduce((acc, p) => ({ ...acc, [p.id]: p.layers || [] }), {}),
          instanceRegistry: state.instanceRegistry || {},
        }),
      });
    } catch (err) {
      console.error("save editor state failed", err);
    }
  };

  return {
  /* --------------------------------------------------------
   * CORE TEMPLATE STATE
   * -------------------------------------------------------- */

  currentTemplate: {
    id: null,
    name: "Untitled Template",
    mode: "uiux",
    width: 1440,
    height: 1024,
    thumbnail: "",
    layers: [],
    tags: [],
  },
  historyStack: [],
  historyPointer: -1,
  historyTransaction: false,
  components: [],
  styles: [],
  pages: [
    {
      id: "page_1",
      name: "Page 1",
      artboards: [],
      layers: [],
    },
  ],
  activePageId: "page_1",
  timeline: {
    duration: DEFAULT_TIMELINE_DURATION,
    zoom: 1,
    loop: true,
    playing: false,
    speed: 1,
    fps: DEFAULT_TIMELINE_FPS,
  },
  breakpoints: {
    base: 0,
    tablet: 768,
    desktop: 1024,
    large: 1440,
  },
  activeBreakpoint: "desktop",
  assets: [],
  scrubberTime: 0,
  presence: [],
  myPresence: {
    cursor: { x: 0, y: 0 },
    selection: [],
  },
  themes: [
    {
      _id: "theme-light",
      name: "Light",
      tokens: {
        colors: {
          primary: "#2563eb",
          secondary: "#9333ea",
          surface: "#ffffff",
          text: "#0f172a",
          background: "#f8fafc",
          success: "#22c55e",
          danger: "#ef4444",
          warning: "#f59e0b",
        },
      },
    },
    {
      _id: "theme-dark",
      name: "Dark",
      tokens: {
        colors: {
          primary: "#60a5fa",
          secondary: "#c084fc",
          surface: "#111827",
          text: "#e5e7eb",
          background: "#0b1120",
          success: "#22c55e",
          danger: "#f87171",
          warning: "#fbbf24",
        },
      },
    },
  ],
  activeThemeId: "theme-light",
  agentMessages: [],

  editingMode: false, // false = create, true = edit
  isEditingComponent: false,
  editingComponentId: null,
  editingVariantId: null,

  clipboardLayers: [],
  clipboardRootIds: [],
  clipboardStyles: null,
  pasteCount: 0,
  writeNodePatch,
  beginHistoryTransaction,
  endHistoryTransaction,

  /* --------------------------------------------------------
   * UI STATE
   * -------------------------------------------------------- */

  selectedLayerId: null,
  selectedLayers: [],
  hoveredLayerId: null,

  canvas: {
    zoom: 1,
    pan: { x: 0, y: 0 },
  },

  exportModalOpen: false,
  setExportModalOpen: (open) => set({ exportModalOpen: open }),

  snapThreshold: 6,
  activeGuides: [],
  setActiveGuides: (guides) => set({ activeGuides: guides }),

  editingTextId: null,
  setEditingTextId: (id) => set({ editingTextId: id }),
  stopEditingText: () => set({ editingTextId: null }),

  setComponents: (components) => set({ components }),
  setStyles: (styles) => set({ styles }),
  setThemes: (themes) => set({ themes }),
  setActiveTheme: (id) => set({ activeThemeId: id }),
  setAgentMessages: (messages) => set({ agentMessages: messages }),
  setActiveBreakpoint: (bp) => set({ activeBreakpoint: bp }),
  setScrubberTime: (t) =>
    set((state) => {
      const duration = state.timeline?.duration || DEFAULT_TIMELINE_DURATION;
      const next = Math.max(0, Math.min(t, duration));
      return { scrubberTime: next };
    }),
  setTimelineDuration: (ms) =>
    set((state) => {
      const duration = Math.max(200, ms || DEFAULT_TIMELINE_DURATION);
      return {
        timeline: { ...(state.timeline || {}), duration },
        scrubberTime: Math.min(state.scrubberTime, duration),
      };
    }),
  setTimelineZoom: (zoom) =>
    set((state) => ({
      timeline: {
        ...(state.timeline || {}),
        zoom: Math.max(0.25, Math.min(zoom || 1, 4)),
      },
    })),
  setTimelineSpeed: (speed) =>
    set((state) => ({
      timeline: {
        ...(state.timeline || {}),
        speed: Math.max(0.25, Math.min(speed || 1, 3)),
      },
    })),
  setTimelineLoop: (loop) =>
    set((state) => ({
      timeline: { ...(state.timeline || {}), loop: Boolean(loop) },
    })),
  playTimeline: () =>
    set((state) => ({
      timeline: { ...(state.timeline || {}), playing: true },
    })),
  pauseTimeline: () =>
    set((state) => ({
      timeline: { ...(state.timeline || {}), playing: false },
    })),
  toggleTimelinePlayback: () =>
    set((state) => ({
      timeline: {
        ...(state.timeline || {}),
        playing: !state.timeline?.playing,
      },
    })),
  setActivePage: (id) =>
    set((state) => {
      const active = state.pages.find((p) => p.id === id) || state.pages[0];
      return {
        activePageId: active?.id || null,
        currentTemplate: {
          ...state.currentTemplate,
          layers: active?.layers || [],
        },
      };
    }),
  loadThemes: async () => {
    try {
      const res = await fetch("/api/themes/list", { method: "GET" });
      if (!res.ok) return;
      const data = await res.json();
      const list = data?.themes || [];
      if (list.length) {
        set((state) => ({
          themes: list,
          activeThemeId: state.activeThemeId || list[0]?._id || null,
        }));
      }
    } catch (err) {
      // ignore if endpoint not available
      console.warn("Themes fetch skipped:", err?.message || err);
    }
  },
  setAssets: (assets) => set({ assets }),
  addAssetLocal: (asset) =>
    set((state) => ({ assets: [...state.assets, asset] })),
  loadAssets: async () => {
    try {
      const res = await fetch("/api/assets/list", { method: "GET" });
      if (!res.ok) return;
      const data = await res.json();
      set({ assets: data.assets || [] });
    } catch (err) {
      console.warn("Assets fetch skipped:", err?.message || err);
    }
  },
  setPresence: (presence) => set({ presence }),
  updateMyCursor: (x, y) =>
    set((state) => ({
      myPresence: { ...state.myPresence, cursor: { x, y } },
    })),
  updateMySelection: (ids) =>
    set((state) => ({
      myPresence: { ...state.myPresence, selection: ids },
    })),

  /* --------------------------------------------------------
   * PAGES
   * -------------------------------------------------------- */

  createPage: (name = "New Page") => {
    const id = "page_" + crypto.randomUUID();
    const newPage = { id, name, artboards: [], layers: [] };
    set((state) => ({
      pages: [...state.pages, newPage],
      activePageId: id,
      currentTemplate: { ...state.currentTemplate, layers: newPage.layers },
    }));
  },

  createPageWithTransition: (name = "New Page", transition = { type: "slide", direction: "right", duration: 0.6, ease: "easeOut" }) => {
    const id = "page_" + crypto.randomUUID();
    const newPage = { id, name, artboards: [], layers: [] };
    set((state) => {
      const pages = [...state.pages, newPage];
      const pageTransitions = {
        ...(state.currentTemplate.pageTransitions || {}),
        default: transition,
      };
      return {
        pages,
        activePageId: id,
        currentTemplate: { ...state.currentTemplate, layers: newPage.layers, pageTransitions },
      };
    });
  },

  renamePage: (id, name) =>
    set((state) => {
      const pages = state.pages.map((p) => (p.id === id ? { ...p, name } : p));
      return { pages };
    }),

  deletePage: (id) =>
    set((state) => {
      let pages = state.pages.filter((p) => p.id !== id);
      if (pages.length === 0) {
        pages = [
          { id: "page_1", name: "Page 1", artboards: [], layers: [] },
        ];
      }
      const active = pages[0];
      return {
        pages,
        activePageId: active.id,
        currentTemplate: { ...state.currentTemplate, layers: active.layers },
      };
    }),

  /* --------------------------------------------------------
   * ACTIVE TOOL
   * -------------------------------------------------------- */

  activeTool: "select",
  setActiveTool: (tool) => set({ activeTool: tool }),

  /* --------------------------------------------------------
   * AUTOSAVE
   * -------------------------------------------------------- */

  saveTimeout: null,

  saveEditorState,

  saveToDatabase: async () => {
    const { currentTemplate } = get();

    try {
      await fetch("/api/templates/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currentTemplate),
      });
    } catch (err) {
      console.error("Auto-save failed:", err);
    }
  },

  triggerAutoSave: () => {
    if (get().saveTimeout) clearTimeout(get().saveTimeout);

    const timeout = setTimeout(() => {
      get().saveToDatabase();
      get().saveEditorState();
      console.log("Auto-saved template.");
    }, 1500);

    set({ saveTimeout: timeout });
  },

  /* --------------------------------------------------------
   * CLIPBOARD
   * -------------------------------------------------------- */

  copyLayers: (ids) => {
    if (!ids || !ids.length) return;
    const clipboard = collectClipboardLayers(ids);
    if (!clipboard.layers.length) return;
    set({
      clipboardLayers: clipboard.layers,
      clipboardRootIds: clipboard.rootIds,
      pasteCount: 0,
    });
  },

  pasteLayers: () => {
    const state = get();
    if (!state.clipboardLayers.length) return;

    const selected = state.selectedLayers;
    const target = selected?.length === 1 ? findLayer(selected[0]) : null;
    const targetParentId =
      target && target.type === "frame"
        ? target.id
        : target?.parentId || null;

    const { remapped, rootNewIds } = remapClipboardLayers(
      { layers: state.clipboardLayers, rootIds: state.clipboardRootIds },
      targetParentId,
      20 + state.pasteCount * 10,
    );

    applyRemappedClones(remapped, rootNewIds, true);
    set({ pasteCount: state.pasteCount + 1 });
  },

  duplicateSelection: () => {
    const state = get();
    if (!state.selectedLayers?.length) return;
    beginHistoryTransaction("duplicate selection");
    const createdIds = [];
    state.selectedLayers.forEach((id) => {
      const newIds = state.duplicateLayer(id, { select: false });
      if (newIds?.length) createdIds.push(...newIds);
    });
    if (createdIds.length) {
      set({ selectedLayerId: createdIds[0], selectedLayers: createdIds });
    }
    endHistoryTransaction();
  },

  duplicateLayer: (id, options = { select: true }) => {
    const state = get();
    const layer = findLayer(id);
    if (!layer) return [];

    const clipboard = collectClipboardLayers([id]);
    if (!clipboard.layers.length) return [];

    const { remapped, rootNewIds } = remapClipboardLayers(
      clipboard,
      layer.parentId || null,
      15,
    );

    applyRemappedClones(remapped, rootNewIds, options.select ?? true);
    return rootNewIds;
  },

  copyStyle: (layerId) => {
    const layer = findLayer(layerId);
    if (!layer) return;

    const styleProps =
      (layer.overrides && Object.keys(layer.overrides).length
        ? layer.overrides
        : layer.props) || {};

    set({
      clipboardStyles: {
        props: cloneDeep(styleProps),
        styleId: layer.styleId || null,
      },
    });
  },

  pasteStyle: (ids) => {
    const state = get();
    if (!state.clipboardStyles || !ids?.length) return;
    ids.forEach((id) => {
      const updates = {};
      if (state.clipboardStyles.styleId) {
        updates.styleId = state.clipboardStyles.styleId;
      }
      if (state.clipboardStyles.props) {
        updates.props = cloneDeep(state.clipboardStyles.props);
      }
      state.updateLayer(id, updates);
    });
  },

  /* --------------------------------------------------------
   * INTERACTIONS / PROTOTYPE
   * -------------------------------------------------------- */

  addInteraction: (layerId, interaction) =>
    set((state) => {
      const pageIndex = state.pages.findIndex((p) => p.id === state.activePageId);
      if (pageIndex === -1) return state;
      const pages = [...state.pages];
      const page = { ...pages[pageIndex], layers: [...(pages[pageIndex].layers || [])] };
      const layerIndex = page.layers.findIndex((l) => l.id === layerId);
      if (layerIndex === -1) return state;
      const layer = {
        ...page.layers[layerIndex],
        interactions: [
          ...(page.layers[layerIndex].interactions || []),
          { id: "int_" + crypto.randomUUID(), ...interaction },
        ],
      };
      page.layers[layerIndex] = layer;
      pages[pageIndex] = page;
      return {
        pages,
        currentTemplate: { ...state.currentTemplate, layers: page.layers },
      };
    }),

  addAnimation: (animation, targetLayerIds = null) =>
    set((state) => {
      const pageIndex = state.pages.findIndex((p) => p.id === state.activePageId);
      if (pageIndex === -1) return state;
      const pages = [...state.pages];
      const page = { ...pages[pageIndex], layers: [...(pages[pageIndex].layers || [])] };
      const layerIds =
        (targetLayerIds && targetLayerIds.length ? targetLayerIds : state.selectedLayers) || [];
      if (!layerIds.length) return state;

      const updatedLayers = page.layers.map((layer) => {
        if (!layerIds.includes(layer.id)) return layer;
        const animations = [...(layer.animations || [])];
        const baseTracks =
          animation?.tracks?.length > 0
            ? animation.tracks
            : buildTracksFromLayer(layer);
        const duration =
          animation?.duration ||
          state.timeline?.duration ||
          DEFAULT_TIMELINE_DURATION;
        const anim = {
          ...animation,
          id: animation?.id || "anim_" + crypto.randomUUID(),
          name: animation?.name || "Motion",
          duration,
          tracks: baseTracks.map((t) => ({
            ...t,
            keyframes: (t.keyframes || []).map((k) => ({ ...k })),
          })),
        };
        animations.push(anim);
        return { ...layer, animations };
      });

      pages[pageIndex] = { ...page, layers: updatedLayers };

      return {
        pages,
        currentTemplate: { ...state.currentTemplate, layers: updatedLayers },
      };
    }),

  ensureTimelineForSelection: () =>
    set((state) => {
      const pageIndex = state.pages.findIndex((p) => p.id === state.activePageId);
      if (pageIndex === -1) return state;
      const layerIds = state.selectedLayers || [];
      if (!layerIds.length) return state;
      const pages = [...state.pages];
      const page = { ...pages[pageIndex], layers: [...(pages[pageIndex].layers || [])] };

      const updatedLayers = page.layers.map((layer) => {
        if (!layerIds.includes(layer.id)) return layer;
        const animations = [...(layer.animations || [])];
        if (animations.length > 0) return layer;
        const anim = {
          id: "anim_" + crypto.randomUUID(),
          name: "Timeline",
          duration: state.timeline?.duration || DEFAULT_TIMELINE_DURATION,
          easing: "ease-in-out",
          tracks: buildTracksFromLayer(layer),
        };
        animations.push(anim);
        return { ...layer, animations };
      });

      pages[pageIndex] = { ...page, layers: updatedLayers };

      return {
        pages,
        currentTemplate: { ...state.currentTemplate, layers: updatedLayers },
      };
    }),

  /* --------------------------------------------------------
   * ANIMATION KEYFRAMES
   * -------------------------------------------------------- */

  addKeyframe: (layerId, animId, property, time, value) =>
    set((state) => {
      const pageIndex = state.pages.findIndex((p) => p.id === state.activePageId);
      if (pageIndex === -1) return state;
      const pages = [...state.pages];
      const page = { ...pages[pageIndex], layers: [...(pages[pageIndex].layers || [])] };
      const layerIndex = page.layers.findIndex((l) => l.id === layerId);
      if (layerIndex === -1) return state;
      const animations = [...(page.layers[layerIndex].animations || [])];
      const animIdx = animations.findIndex((a) => a.id === animId);
      if (animIdx === -1) return state;
      const tracks = [...(animations[animIdx].tracks || [])];
      const trackIdx = tracks.findIndex((t) => t.property === property);
      if (trackIdx === -1) return state;
      const keyframes = [...(tracks[trackIdx].keyframes || [])];
      keyframes.push({ time, value, easing: "ease-in-out" });
      keyframes.sort((a, b) => a.time - b.time);
      tracks[trackIdx] = { ...tracks[trackIdx], keyframes };
      animations[animIdx] = { ...animations[animIdx], tracks };
      page.layers[layerIndex] = { ...page.layers[layerIndex], animations };
      pages[pageIndex] = page;
      const nextDuration = Math.max(
        state.timeline?.duration || DEFAULT_TIMELINE_DURATION,
        (time || 0) + 120,
      );
      return {
        pages,
        currentTemplate: { ...state.currentTemplate, layers: page.layers },
        timeline: { ...(state.timeline || {}), duration: nextDuration },
      };
    }),

  updateKeyframeTime: (layerId, animId, property, index, time) =>
    set((state) => {
      const pageIndex = state.pages.findIndex((p) => p.id === state.activePageId);
      if (pageIndex === -1) return state;
      const pages = [...state.pages];
      const page = { ...pages[pageIndex], layers: [...(pages[pageIndex].layers || [])] };
      const layerIndex = page.layers.findIndex((l) => l.id === layerId);
      if (layerIndex === -1) return state;
      const animations = [...(page.layers[layerIndex].animations || [])];
      const animIdx = animations.findIndex((a) => a.id === animId);
      if (animIdx === -1) return state;
      const tracks = [...(animations[animIdx].tracks || [])];
      const trackIdx = tracks.findIndex((t) => t.property === property);
      if (trackIdx === -1) return state;
      const keyframes = [...(tracks[trackIdx].keyframes || [])];
      if (!keyframes[index]) return state;
      keyframes[index] = { ...keyframes[index], time: Math.max(0, time) };
      keyframes.sort((a, b) => a.time - b.time);
      tracks[trackIdx] = { ...tracks[trackIdx], keyframes };
      animations[animIdx] = { ...animations[animIdx], tracks };
      page.layers[layerIndex] = { ...page.layers[layerIndex], animations };
      pages[pageIndex] = page;
      const nextDuration = Math.max(
        state.timeline?.duration || DEFAULT_TIMELINE_DURATION,
        (time || 0) + 120,
      );
      return {
        pages,
        currentTemplate: { ...state.currentTemplate, layers: page.layers },
        timeline: { ...(state.timeline || {}), duration: nextDuration },
      };
    }),

  updateInteraction: (layerId, interactionId, updates) =>
    set((state) => {
      const pageIndex = state.pages.findIndex((p) => p.id === state.activePageId);
      if (pageIndex === -1) return state;
      const pages = [...state.pages];
      const page = { ...pages[pageIndex], layers: [...(pages[pageIndex].layers || [])] };
      const layerIndex = page.layers.findIndex((l) => l.id === layerId);
      if (layerIndex === -1) return state;
      const interactions = [...(page.layers[layerIndex].interactions || [])];
      const intIdx = interactions.findIndex((i) => i.id === interactionId);
      if (intIdx === -1) return state;
      interactions[intIdx] = { ...interactions[intIdx], ...updates };
      page.layers[layerIndex] = { ...page.layers[layerIndex], interactions };
      pages[pageIndex] = page;
      return {
        pages,
        currentTemplate: { ...state.currentTemplate, layers: page.layers },
      };
    }),

  removeInteraction: (layerId, interactionId) =>
    set((state) => {
      const pageIndex = state.pages.findIndex((p) => p.id === state.activePageId);
      if (pageIndex === -1) return state;
      const pages = [...state.pages];
      const page = { ...pages[pageIndex], layers: [...(pages[pageIndex].layers || [])] };
      const layerIndex = page.layers.findIndex((l) => l.id === layerId);
      if (layerIndex === -1) return state;
      const interactions = (page.layers[layerIndex].interactions || []).filter(
        (i) => i.id !== interactionId,
      );
      page.layers[layerIndex] = { ...page.layers[layerIndex], interactions };
      pages[pageIndex] = page;
      return {
        pages,
        currentTemplate: { ...state.currentTemplate, layers: page.layers },
      };
    }),

  generateThumbnail: async (scale = 2) => {
    const { currentTemplate } = get();
    const html2canvas = (await import("html2canvas")).default;

    const element = document.getElementById("dropple-canvas");
    if (!element) return null;

    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale,
      useCORS: true,
    });

    // Normalize width for consistent thumbnails (optional step)
    const desiredWidth = 900;
    const ratio = canvas.width / canvas.height;
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = desiredWidth;
    tempCanvas.height = desiredWidth / ratio;
    const ctx = tempCanvas.getContext("2d");
    ctx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);

    const thumbnail = tempCanvas.toDataURL("image/webp", 0.9);

    await fetch("/api/templates/thumbnail", {
      method: "POST",
      body: JSON.stringify({
        id: currentTemplate.id,
        thumbnail,
      }),
    });

    return thumbnail;
  },

  /* --------------------------------------------------------
   * TEMPLATE MODE / LOADING
   * -------------------------------------------------------- */

  setEditingMode: (value) => set({ editingMode: value }),

  loadTemplateFromDB: async (templateId) => {
    try {
      const res = await fetch("/api/templates/get", {
        method: "POST",
        body: JSON.stringify({ id: templateId }),
      });

      const text = await res.text();
      let data = {};
      try {
        data = JSON.parse(text || "{}");
      } catch (err) {
        console.error("Error parsing template JSON", err, text);
        return;
      }
      const tpl = data.template
        ? { ...data.template, assets: normalizeAssets(data.template.assets || []) }
        : data.template;

      if (!tpl) {
        console.error("Template not found or empty response:", templateId);
        return;
      }

      // Validate dropple template shape if available
      try {
        const { validateDroppleTemplate } = await import("@/lib/droppleTemplateSpec");
        const validation = validateDroppleTemplate(tpl);
        if (!validation.valid) {
          console.error("Template validation failed", validation.errors);
          return;
        }
      } catch (err) {
        console.warn("Template validation skipped", err?.message || err);
      }

      const page = {
        id: "page_1",
        name: tpl.name || "Page 1",
        artboards: [],
        layers: tpl.layers || [],
      };

      set({
        currentTemplate: {
          id: tpl._id,
          name: tpl.name,
          description: tpl.description,
          mode: tpl.mode,
          width: tpl.width,
          height: tpl.height,
          layers: tpl.layers || [],
          tags: tpl.tags || [],
          thumbnail: tpl.thumbnail || "",
        },
        pages: [page],
        activePageId: page.id,
        editingMode: true,
      });
    } catch (err) {
      console.error("Error loading template:", err);
    }
  },

  enterComponentEdit: (componentId, variantId = null, componentData = null) =>
    set((state) => {
      let components = state.components || [];
      if (!components.find((c) => c._id === componentId) && componentData) {
        components = [
          ...components,
          {
            _id: componentId,
            name: componentData.name || "Component",
            nodes: componentData.nodes || [],
            variants: componentData.variants || [],
          },
        ];
      }

      return {
        components,
        isEditingComponent: true,
        editingComponentId: componentId,
        editingVariantId: variantId,
        selectedLayerId: null,
        selectedLayers: [],
      };
    }),

  exitComponentEdit: () =>
    set({
      isEditingComponent: false,
      editingComponentId: null,
      editingVariantId: null,
      selectedLayerId: null,
      selectedLayers: [],
    }),

  /* --------------------------------------------------------
   * LAYER MANAGEMENT
   * -------------------------------------------------------- */

  addLayer: (layer, parentId = null) => {
    const layerWithDefaults = {
      parentId: parentId ?? layer.parentId ?? null,
      children: layer.children ?? [],
      autoLayout: layer.autoLayout ?? defaultAutoLayout,
      constraints: layer.constraints ?? defaultConstraints,
      locked: layer.locked ?? defaultLayerMeta.locked,
      hidden: layer.hidden ?? defaultLayerMeta.hidden,
      expanded: layer.expanded ?? defaultLayerMeta.expanded,
      name: layer.name ?? defaultLayerMeta.name,
      styleId: layer.styleId ?? null,
      overrides: layer.overrides ?? {},
      interactions: layer.interactions ?? defaultLayerMeta.interactions,
      responsive: layer.responsive ?? defaultLayerMeta.responsive,
      ...layer,
    };

    const page = getActivePage();
    let layers = [...(page?.layers || []), layerWithDefaults];

    if (parentId) {
      layers = layers.map((l) =>
        l.id === parentId && l.type === "frame"
          ? { ...l, children: [...(l.children || []), layerWithDefaults.id] }
          : l,
      );
    }

    setActivePageLayers(layers);

    get().triggerAutoSave();
  },

  addTextLayer: () => {
    const id = "text_" + crypto.randomUUID();
    const parent = getActivePage()
      ?.layers.find((l) => l.id === get().selectedLayerId && l.type === "frame");
    get().addLayer({
      id,
      type: "text",
      content: "Your text here",
      x: 200,
      y: 200,
      width: 200,
      height: 50,
      props: {
        fontSize: 24,
        fontWeight: 500,
        color: "#000",
      },
    }, parent?.id);
    set({ selectedLayerId: id });
  },

  addRectangleLayer: () => {
    const id = "rect_" + crypto.randomUUID();
    const parent = getActivePage()
      ?.layers.find((l) => l.id === get().selectedLayerId && l.type === "frame");
    get().addLayer({
      id,
      type: "rect",
      x: 200,
      y: 200,
      width: 200,
      height: 120,
      props: {
        fill: "#3b82f6",
        borderRadius: 8,
      },
    }, parent?.id);
    set({ selectedLayerId: id });
  },

  addImageLayer: (url = "/placeholder-image.png") => {
    const id = "img_" + crypto.randomUUID();
    const parent = getActivePage()
      ?.layers.find((l) => l.id === get().selectedLayerId && l.type === "frame");
    get().addLayer({
      id,
      type: "image",
      url,
      x: 200,
      y: 200,
      width: 300,
      height: 200,
      props: {},
    }, parent?.id);
    set({ selectedLayerId: id });
  },

  addComponentInstance: (component, variantId = null) => {
    pushHistory("insert component");
    const id = "instance_" + crypto.randomUUID();
    const initialVariantId = variantId ?? component.initialVariant ?? null;
    const initialNodes =
      initialVariantId && component.variants?.length
        ? component.variants.find((v) => v.id === initialVariantId)?.nodes || component.nodes
        : component.nodes;
    const parent = getActivePage()
      ?.layers.find((l) => l.id === get().selectedLayerId && l.type === "frame");
    get().addLayer({
      id,
      type: "component-instance",
      componentId: component._id,
      componentInstanceId: id,
      componentNodes: component.nodes,
      componentVariants: component.variants || [],
      nodes: initialNodes,
      variantId: initialVariantId,
      x: 200,
      y: 200,
      width: 300,
      height: 200,
      overrides: {},
      interactions: [],
      locked: true,
    }, parent?.id);
    set({ selectedLayerId: id });
    get().registerInstance(id, {
      instanceId: id,
      componentId: component._id,
      overrides: {},
      slotData: {},
      variant: initialVariantId || component.variants?.[0]?.id || "default",
      useMasterMotion: true,
      detached: false,
    });
    const projectId = get().currentTemplate.id;
    if (projectId) {
      persistInstance(id, {
        x: parent?.x ?? 200,
        y: parent?.y ?? 200,
        width: 300,
        height: 200,
        parentId: parent?.id || null,
      });
    }
    get().triggerAutoSave();
  },

  addArtboard: () => {
    const canvasWidth = get().currentTemplate?.width || 1440;
    const canvasHeight = get().currentTemplate?.height || 1024;
    const artboardWidth = Math.min(1200, Math.max(320, canvasWidth - 80));
    const artboardHeight = Math.min(900, Math.max(240, canvasHeight - 80));
    const centeredX = Math.max(20, Math.round((canvasWidth - artboardWidth) / 2));
    const centeredY = Math.max(20, Math.round((canvasHeight - artboardHeight) / 2));
    const id = "artboard_" + crypto.randomUUID();
    const artboard = {
      id,
      type: "artboard",
      name: "Artboard",
      x: centeredX,
      y: centeredY,
      width: artboardWidth,
      height: artboardHeight,
      props: { fill: "#f8fafc" },
      children: [],
      isArtboard: true,
      interactions: [],
    };
    get().addLayer(artboard);
    set((state) => {
      const pageIndex = state.pages.findIndex((p) => p.id === state.activePageId);
      if (pageIndex === -1) return state;
      const pages = [...state.pages];
      const artboards = [...(pages[pageIndex].artboards || []), id];
      pages[pageIndex] = { ...pages[pageIndex], artboards };
      return { pages };
    });
  },

  addDeviceArtboard: (device = "desktop") => {
    const presets = {
      base: { width: 390, height: 844, name: "Mobile" },
      mobile: { width: 390, height: 844, name: "Mobile" },
      tablet: { width: 768, height: 1024, name: "Tablet" },
      desktop: { width: 1440, height: 900, name: "Desktop" },
      large: { width: 1600, height: 1000, name: "Large" },
    };
    const { width, height, name } = presets[device] || presets.desktop;
    const page = getActivePage();
    const artboards = (page?.layers || []).filter((l) => l.type === "artboard");
    const offsetX = 20 + artboards.length * 60;
    const offsetY = 20 + (artboards.length % 2) * 60;
    const id = `${device}_artboard_${crypto.randomUUID()}`;
    const artboard = {
      id,
      type: "artboard",
      name: name || "Artboard",
      x: offsetX,
      y: offsetY,
      width,
      height,
      props: { fill: "#f8fafc" },
      children: [],
      isArtboard: true,
      interactions: [],
    };
    get().addLayer(artboard);
    set((state) => {
      const pageIndex = state.pages.findIndex((p) => p.id === state.activePageId);
      if (pageIndex === -1) return state;
      const pages = [...state.pages];
      const nextArtboards = [...(pages[pageIndex].artboards || []), id];
      pages[pageIndex] = { ...pages[pageIndex], artboards: nextArtboards };
      return { pages };
    });
  },

  createGroup: () => {
    const { selectedLayers } = get();
    const page = getActivePage();
    const pageLayers = page?.layers || [];
    if (!selectedLayers || selectedLayers.length < 2) return;

    const children = selectedLayers
      .map((id) => pageLayers.find((l) => l.id === id))
      .filter(Boolean);
    if (!children.length) return;

    const minX = Math.min(...children.map((c) => c.x));
    const minY = Math.min(...children.map((c) => c.y));
    const maxX = Math.max(...children.map((c) => c.x + c.width));
    const maxY = Math.max(...children.map((c) => c.y + c.height));

    const groupId = "group_" + crypto.randomUUID();

    const parentIdCommon = children.every((c) => c.parentId === children[0].parentId)
      ? children[0].parentId
      : null;

    const groupLayer = {
      id: groupId,
      type: "group",
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      children: children.map((c) => c.id),
      parentId: parentIdCommon,
      constraints: defaultConstraints,
      autoLayout: defaultAutoLayout,
      styleId: null,
      overrides: {},
    };

    const updatedLayers = pageLayers.map((l) =>
      children.find((c) => c.id === l.id)
        ? { ...l, x: l.x - minX, y: l.y - minY, parentId: groupId }
        : l,
    );

    updatedLayers.push(groupLayer);

    updatedLayers.push(groupLayer);

    setActivePageLayers(updatedLayers);
    set({ selectedLayerId: groupId, selectedLayers: [groupId] });

    get().triggerAutoSave();
  },

  setVariantForInstance: (layerId, variantId) => {
    const page = getActivePage();
    const layers = page?.layers || [];
    const layer = layers.find((l) => l.id === layerId);
    if (!layer) return;
    layer.variantId = variantId === "default" ? null : variantId;
    const componentVariants = layer.componentVariants || [];
    const targetNodes =
      variantId === "default"
        ? layer.componentNodes
        : componentVariants.find((v) => v.id === variantId)?.nodes;
    if (targetNodes) {
      layer.nodes = targetNodes;
    }
    setActivePageLayers([...layers]);
    get().triggerAutoSave();
  },

  applyMotionPresetToLayer: (layerId, preset) => {
    if (!preset) return;
    const page = getActivePage();
    const layers = page?.layers || [];
    const idx = layers.findIndex((l) => l.id === layerId);
    if (idx === -1) return;
    const layer = { ...layers[idx] };
    const anim = {
      id: preset.id || "anim_" + crypto.randomUUID(),
      name: preset.name,
      variants: preset.variants || preset.states || {},
      triggers: preset.triggers || [],
      scroll: preset.scroll,
      tracks: preset.tracks || [],
      playTimelineOnLoad: preset.playTimelineOnLoad,
      timelineLoop: preset.timelineLoop,
      timelineLoopCount: preset.timelineLoopCount,
    };
    const animations = [...(layer.animations || [])];
    animations.unshift(anim);
    layer.animations = animations;
    layers[idx] = layer;
    setActivePageLayers([...layers]);
  },

  applyMotionTheme: (themeId, scope = "selection") =>
    set((state) => {
      const theme = motionThemeMap[themeId] || null;
      if (!theme) return state;
      const pages = [...state.pages];
      const selected = new Set(state.selectedLayers || []);

      const updateLayers = (layers) => {
        if (scope === "selection" && selected.size) {
          return applyMotionThemeToLayers(layers, theme, Array.from(selected));
        }
        return applyMotionThemeToLayers(layers, theme, null);
      };

      const updatedPages = pages.map((p) => {
        const shouldApply =
          scope === "all" ||
          (scope === "page" && p.id === state.activePageId) ||
          (scope === "selection" && selected.size);
        if (!shouldApply) return p;
        return { ...p, layers: updateLayers(p.layers || []) };
      });

      const activePage = updatedPages.find((p) => p.id === state.activePageId) || updatedPages[0];
      return {
        pages: updatedPages,
        currentTemplate: { ...state.currentTemplate, layers: activePage?.layers || state.currentTemplate.layers },
      };
    }),

  refineMotionSelection: () =>
    set((state) => {
      const pageIndex = state.pages.findIndex((p) => p.id === state.activePageId);
      if (pageIndex === -1) return state;
      const selected = new Set(state.selectedLayers || []);
      const page = { ...state.pages[pageIndex], layers: [...(state.pages[pageIndex].layers || [])] };
      const targetLayers = selected.size ? page.layers.filter((l) => selected.has(l.id)) : page.layers;
      const result = refineMotion({ layers: targetLayers });
      if (!result?.template?.layers) return state;
      const refined = page.layers.map((l) => selected.size && !selected.has(l.id) ? l : (result.template.layers.find((r) => r.id === l.id) || l));
      const pages = [...state.pages];
      pages[pageIndex] = { ...page, layers: refined };
      return {
        pages,
        currentTemplate: { ...state.currentTemplate, layers: refined },
      };
    }),

  adjustAutoLayoutSpacing: (delta = 4) =>
    set((state) => {
      const pageIndex = state.pages.findIndex((p) => p.id === state.activePageId);
      if (pageIndex === -1) return state;
      const selected = new Set(state.selectedLayers || []);
      if (!selected.size) return state;
      const page = { ...state.pages[pageIndex], layers: [...(state.pages[pageIndex].layers || [])] };
      const updated = page.layers.map((l) => {
        if (!selected.has(l.id)) return l;
        if (!l.autoLayout?.enabled) return l;
        const gap = (l.autoLayout.gap || 0) + delta;
        const padding = (l.autoLayout.padding || 0) + Math.round(delta / 2);
        return {
          ...l,
          autoLayout: { ...l.autoLayout, gap: Math.max(0, gap), padding: Math.max(0, padding) },
        };
      });
      const pages = [...state.pages];
      pages[pageIndex] = { ...page, layers: updated };
      return { pages, currentTemplate: { ...state.currentTemplate, layers: updated } };
    }),

  setDefaultPageTransition: (type = "slide", direction = "right", duration = 0.6, ease = "easeOut") =>
    set((state) => ({
      currentTemplate: {
        ...state.currentTemplate,
        pageTransitions: {
          ...(state.currentTemplate.pageTransitions || {}),
          default: { type, direction, duration, ease },
        },
      },
    })),

  fixAllMotionAndLayout: () =>
    set((state) => {
      const pageIndex = state.pages.findIndex((p) => p.id === state.activePageId);
      if (pageIndex === -1) return state;
      const page = { ...state.pages[pageIndex], layers: [...(state.pages[pageIndex].layers || [])] };
      const refined = refineMotion({ layers: page.layers }).template.layers || page.layers;

      const normalizeLayout = (layers) =>
        layers.map((l) => {
          if (!l.autoLayout?.enabled) return l;
          const gap = l.autoLayout.gap || 0;
          const padding = l.autoLayout.padding || 0;
          return {
            ...l,
            autoLayout: {
              ...l.autoLayout,
              gap: Math.max(8, Math.min(24, gap)),
              padding: Math.max(12, Math.min(32, padding)),
            },
          };
        });

      const normalizedLayouts = normalizeLayout(refined);

      const pages = [...state.pages];
      pages[pageIndex] = { ...page, layers: normalizedLayouts };

      return {
        pages,
        currentTemplate: {
          ...state.currentTemplate,
          layers: normalizedLayouts,
          pageTransitions: {
            ...(state.currentTemplate.pageTransitions || {}),
            default: state.currentTemplate.pageTransitions?.default || { type: "slide", direction: "right", duration: 0.6, ease: "easeOut" },
          },
        },
      };
    }),

  loadTemplateFromObject: (tpl) =>
    set((state) => {
      if (!tpl) return state;
      const normalizedTpl = { ...tpl, assets: normalizeAssets(tpl.assets || []) };
      try {
        const { validateDroppleTemplate } = require("@/lib/droppleTemplateSpec");
        const validation = validateDroppleTemplate(normalizedTpl);
        if (!validation.valid) {
          console.error("Template validation failed", validation.errors);
          return state;
        }
      } catch (err) {
        console.warn("Template validation skipped", err?.message || err);
      }
      const newId = normalizedTpl.id || normalizedTpl._id || crypto.randomUUID();
      const layers = normalizedTpl.layers || normalizedTpl.nodes || [];
      const page = {
        id: "page_1",
        name: normalizedTpl.name || "Page 1",
        artboards: [],
        layers,
      };
      return {
        currentTemplate: {
          ...state.currentTemplate,
          id: newId,
          name: normalizedTpl.name || "AI Template",
          description: normalizedTpl.description || "",
          mode: normalizedTpl.mode || "uiux",
          width: normalizedTpl.width || state.currentTemplate.width || 1440,
          height: normalizedTpl.height || state.currentTemplate.height || 1024,
          layers,
          tags: normalizedTpl.tags || [],
          thumbnail: normalizedTpl.thumbnail || "",
          pageTransitions: normalizedTpl.pageTransitions || state.currentTemplate.pageTransitions || {},
        },
        pages: [page],
        activePageId: page.id,
      };
    }),

  hydrateProjectFromConvex: async (projectId) => {
    if (!projectId) return;
    try {
      const compsResp = await fetch(`/api/components/list?projectId=${projectId}`);
      const compsJson = await compsResp.json();
      const instResp = await fetch(`/api/components/instances/list?projectId=${projectId}`);
      const instJson = await instResp.json();
      const stateResp = await fetch(`/api/editor/state/load?projectId=${projectId}`);
      const stateJson = await stateResp.json();
      if (Array.isArray(compsJson.components)) {
        set((state) => ({
          components: compsJson.components,
        }));
      }
      if (Array.isArray(instJson.instances)) {
        const reg = {};
        instJson.instances.forEach((inst) => {
          reg[inst.instanceId] = {
            instanceId: inst.instanceId,
            componentId: inst.componentId,
            overrides: inst.overrides || {},
            slotData: inst.slotData || {},
            variant: inst.variant || "default",
            useMasterMotion: inst.useMasterMotion ?? true,
            frame: inst.frame || null,
            detached: false,
          };
        });
        set({ instanceRegistry: reg });
      }
      if (stateJson?.state) {
        const snap = stateJson.state;
        if (snap.pages) {
          set((current) => ({
            pages: snap.pages,
            activePageId: snap.pages[0]?.id || current.activePageId,
            currentTemplate: { ...current.currentTemplate, layers: snap.layers?.[current.activePageId] || snap.pages?.[0]?.layers || [] },
          }));
        }
        if (snap.layers && !snap.pages) {
          set((current) => ({
            currentTemplate: { ...current.currentTemplate, layers: snap.layers[current.activePageId] || current.currentTemplate.layers },
          }));
        }
        if (snap.instanceRegistry) {
          set({ instanceRegistry: snap.instanceRegistry });
        }
      }
    } catch (err) {
      console.error("hydrate project failed", err);
    }
  },

  insertComponentDefinition: (def, variantId = null, tokenMap = null) => {
    const activeTokens = get().tokens || {};
    const resolvedTokenMap = tokenMap || activeTokens;
    const comp = componentToNodes(def, resolvedTokenMap);
    const existing = get().components || [];
    const nextComponents = existing.find((c) => c._id === comp._id) ? existing : [...existing, comp];
    get().setComponents(nextComponents);
    get().addComponentInstance(comp, variantId || comp.variants?.[0]?.id || null);
    // Persist master best-effort
    const projectId = get().currentTemplate.id;
    fetch("/api/components/save", {
      method: "POST",
      body: JSON.stringify({ component: comp, projectId }),
    }).catch(() => {});
  },

  insertComponent: (request) => {
    // request: { componentId?, componentSchema?, position?, parentFrameId?, variantId? }
    const state = get();
    const { componentId, componentSchema, position, parentFrameId, variantId } = request || {};
    let targetComponent = componentId
      ? state.components.find((c) => c._id === componentId)
      : null;

    if (!targetComponent && componentSchema) {
      // create master locally
      state.insertComponentDefinition(componentSchema, variantId);
      return;
    }

    if (!targetComponent) return;

    const id = "instance_" + crypto.randomUUID();
    const initialVariantId = variantId ?? targetComponent.initialVariant ?? targetComponent.variants?.[0]?.id ?? null;
    const initialNodes =
      initialVariantId && targetComponent.variants?.length
        ? targetComponent.variants.find((v) => v.id === initialVariantId)?.nodes || targetComponent.nodes
        : targetComponent.nodes;

    const viewportCenter = { x: 400, y: 300 }; // fallback
    const baseLayers = getActivePage().layers || [];
    const parentFrame = parentFrameId
      ? baseLayers.find((l) => l.id === parentFrameId)
      : baseLayers.find((l) => l.id === state.selectedLayerId && l.type === "frame");

    const rootFrame = initialNodes?.find((n) => !n.parentId);
    const defaultPos = position || { x: viewportCenter.x, y: viewportCenter.y };

    const placedRoot = rootFrame
      ? {
          ...rootFrame,
          x: parentFrame && parentFrame.autoLayout?.enabled ? 0 : defaultPos.x,
          y: parentFrame && parentFrame.autoLayout?.enabled ? 0 : defaultPos.y,
          parentId: parentFrame ? parentFrame.id : rootFrame.parentId,
        }
      : null;

    const placedNodes = initialNodes.map((n) => {
      if (!placedRoot || n.id !== placedRoot.id) return n;
      return placedRoot;
    });

    const instancePayload = {
      instanceId: id,
      componentId: targetComponent._id,
      overrides: {},
      slotData: {},
      variant: initialVariantId || "default",
      useMasterMotion: true,
      frame: placedRoot
        ? { x: placedRoot.x || 0, y: placedRoot.y || 0, width: placedRoot.width || 300, height: placedRoot.height || 200, parentId: placedRoot.parentId }
        : null,
    };

    get().registerInstance(id, instancePayload);
    // create instance layer
    get().addLayer(
      {
        id,
        type: "component-instance",
        componentId: targetComponent._id,
        componentInstanceId: id,
        componentNodes: targetComponent.nodes,
        componentVariants: targetComponent.variants || [],
        nodes: placedNodes,
        variantId: initialVariantId,
        x: placedRoot?.x ?? defaultPos.x,
        y: placedRoot?.y ?? defaultPos.y,
        width: placedRoot?.width ?? 300,
        height: placedRoot?.height ?? 200,
        overrides: {},
        interactions: [],
        locked: true,
        parentId: placedRoot?.parentId,
      },
      parentFrame?.id,
    );

    // persist instance best-effort
    const projectId = state.currentTemplate.id;
    if (projectId) {
      fetch("/api/components/instances/save", {
        method: "POST",
        body: JSON.stringify({ projectId, instance: instancePayload }),
      }).catch(() => {});
    }
  },

  createInstanceFromComponent: (componentId, variantId = null) => {
    get().insertComponent({ componentId, variantId });
  },

  // Instance registry (client-side). For persistence, sync to backend when needed.
  instanceRegistry: {},

  registerInstance: (instanceId, payload) =>
    set((state) => ({
      instanceRegistry: {
        ...(state.instanceRegistry || {}),
        [instanceId]: payload,
      },
    })),

  updateInstanceOverrides: (instanceId, overrides) => {
    pushHistory("override instance");
    set((state) => {
      const reg = { ...(state.instanceRegistry || {}) };
      if (!reg[instanceId]) return state;
      reg[instanceId] = {
        ...reg[instanceId],
        overrides: { ...(reg[instanceId].overrides || {}), ...overrides },
      };
      persistInstance(instanceId);
      return { instanceRegistry: reg };
    });
  },

  updateInstanceSlots: (instanceId, slotData) => {
    pushHistory("slot update");
    set((state) => {
      const reg = { ...(state.instanceRegistry || {}) };
      if (!reg[instanceId]) return state;
      reg[instanceId] = {
        ...reg[instanceId],
        slotData: { ...(reg[instanceId].slotData || {}), ...slotData },
      };
      persistInstance(instanceId);
      return { instanceRegistry: reg };
    });
  },

  updateInstanceVariant: (instanceId, variant) => {
    pushHistory("instance variant");
    set((state) => {
      const reg = { ...(state.instanceRegistry || {}) };
      if (!reg[instanceId]) return state;
      reg[instanceId] = { ...reg[instanceId], variant };
      persistInstance(instanceId);
      return { instanceRegistry: reg };
    });
  },

  setInstanceUseMasterMotion: (instanceId, flag) => {
    pushHistory("toggle master motion");
    set((state) => {
      const reg = { ...(state.instanceRegistry || {}) };
      if (!reg[instanceId]) return state;
      reg[instanceId] = { ...reg[instanceId], useMasterMotion: flag };
      persistInstance(instanceId);
      return { instanceRegistry: reg };
    });
  },

  detachInstance: (instanceId) => {
    pushHistory("detach instance");
    set((state) => {
      const reg = { ...(state.instanceRegistry || {}) };
      if (!reg[instanceId]) return state;
      reg[instanceId] = { ...reg[instanceId], detached: true };
      const pageIndex = state.pages.findIndex((p) => p.id === state.activePageId);
      if (pageIndex === -1) return { instanceRegistry: reg };
      const pages = [...state.pages];
      const page = { ...pages[pageIndex], layers: [...(pages[pageIndex].layers || [])] };
      const idx = page.layers.findIndex((l) => l.id === instanceId);
      if (idx !== -1) {
        page.layers[idx] = { ...page.layers[idx], locked: false };
        pages[pageIndex] = page;
        return { instanceRegistry: reg, pages, currentTemplate: { ...state.currentTemplate, layers: page.layers } };
      }
      return { instanceRegistry: reg };
    });
  },

  detachInstanceToLayers: (instanceId) => {
    pushHistory("detach to layers");
    set((state) => {
      const reg = { ...(state.instanceRegistry || {}) };
      const instance = reg[instanceId];
      if (!instance) return state;
      const pageIndex = state.pages.findIndex((p) => p.id === state.activePageId);
      if (pageIndex === -1) return state;
      const pages = [...state.pages];
      const page = { ...pages[pageIndex], layers: [...(pages[pageIndex].layers || [])] };
      const layerIdx = page.layers.findIndex((l) => l.id === instanceId);
      if (layerIdx === -1) return state;
      const root = page.layers[layerIdx];
      const comp = state.components.find((c) => c._id === root.componentId);
      if (!comp) return state;
      // replace the instance with raw child layers (deep clone)
      const baseNodes = root.nodes || comp.nodes || [];
      const cloned = baseNodes.map((n) => ({ ...cloneDeep(n), parentId: root.parentId }));
      // remove the instance layer
      const newLayers = page.layers.filter((l) => l.id !== instanceId).concat(cloned);
      pages[pageIndex] = { ...page, layers: newLayers };
      delete reg[instanceId];
      return {
        pages,
        currentTemplate: { ...state.currentTemplate, layers: newLayers },
        instanceRegistry: reg,
      };
    });
  },

  applyMasterUpdate: (componentId, changes = {}) => {
    pushHistory("apply master update");
    set((state) => {
      const reg = { ...(state.instanceRegistry || {}) };
      const affectedInstances = Object.values(reg).filter(
        (inst) => inst.componentId === componentId && !inst.detached,
      );
      if (!affectedInstances.length) return state;
      const pages = [...state.pages];
      pages.forEach((page, pIdx) => {
        const layers = [...(page.layers || [])].map((l) => {
          if (l.type !== "component-instance" || l.componentId !== componentId) return l;
          const inst = reg[l.id];
          if (!inst || inst.detached) return l;
          // merge changes into overrides only if not already overridden
          const overrides = { ...(inst.overrides || {}) };
          Object.entries(changes).forEach(([nodeId, nodeChanges]) => {
            const currentOverride = overrides[nodeId] || {};
            const nextOverride = { ...currentOverride };
            Object.entries(nodeChanges || {}).forEach(([propKey, propVal]) => {
              if (currentOverride[propKey] === undefined) {
                nextOverride[propKey] = propVal;
              }
            });
            overrides[nodeId] = nextOverride;
          });
          reg[l.id] = { ...inst, overrides };
          return l;
        });
        pages[pIdx] = { ...page, layers };
      });
      return {
        instanceRegistry: reg,
        pages,
        currentTemplate: pages.find((p) => p.id === state.activePageId) || state.currentTemplate,
      };
    });
  },

  resetInstanceOverrides: (instanceId) => {
    pushHistory("reset overrides");
    set((state) => {
      const reg = { ...(state.instanceRegistry || {}) };
      if (!reg[instanceId]) return state;
      reg[instanceId] = { ...reg[instanceId], overrides: {}, slotData: {} };
      return { instanceRegistry: reg };
    });
  },

  updateMasterFromInstance: (instanceId) => {
    pushHistory("push to master");
    set((state) => {
      const reg = { ...(state.instanceRegistry || {}) };
      const inst = reg[instanceId];
      if (!inst) return state;
      const compIdx = state.components.findIndex((c) => c._id === inst.componentId);
      if (compIdx === -1) return state;
      const components = [...state.components];
      const comp = cloneDeep(components[compIdx]);
      Object.entries(inst.overrides || {}).forEach(([nodeId, nodeChanges]) => {
        const target = comp.nodes.find((n) => n.id === nodeId);
        if (target) {
          Object.entries(nodeChanges || {}).forEach(([k, v]) => {
            target[k] = v;
          });
        }
      });
      components[compIdx] = comp;
      return { components };
    });
  },

  refreshInstancesFromMaster: (componentId) => {
    pushHistory("refresh instances");
    set((state) => {
      const comp = state.components.find((c) => c._id === componentId);
      if (!comp) return state;
      const pages = [...state.pages];
      pages.forEach((page, pIdx) => {
        const layers = [...(page.layers || [])].map((l) => {
          if (l.type !== "component-instance" || l.componentId !== componentId) return l;
          const variantNodes =
            l.variantId && comp.variants?.length
              ? comp.variants.find((v) => v.id === l.variantId)?.nodes || comp.nodes
              : comp.nodes;
          return {
            ...l,
            componentNodes: comp.nodes,
            componentVariants: comp.variants || [],
            nodes: variantNodes,
          };
        });
        pages[pIdx] = { ...page, layers };
      });
      return {
        pages,
        currentTemplate: pages.find((p) => p.id === state.activePageId) || state.currentTemplate,
      };
    });
  },

  setInstanceVariant: (instanceId, variantId) => {
    pushHistory("instance variant");
    set((state) => {
      const reg = { ...(state.instanceRegistry || {}) };
      if (!reg[instanceId]) return state;
      reg[instanceId] = { ...reg[instanceId], variant: variantId };
      const pageIndex = state.pages.findIndex((p) => p.id === state.activePageId);
      if (pageIndex === -1) return { instanceRegistry: reg };
      const pages = [...state.pages];
      const page = { ...pages[pageIndex], layers: [...(pages[pageIndex].layers || [])] };
      const layerIdx = page.layers.findIndex((l) => l.id === instanceId);
      if (layerIdx !== -1) {
        page.layers[layerIdx] = { ...page.layers[layerIdx], variantId: variantId };
        pages[pageIndex] = page;
        persistInstance(instanceId);
        return { instanceRegistry: reg, pages, currentTemplate: { ...state.currentTemplate, layers: page.layers } };
      }
      return { instanceRegistry: reg };
    });
  },

  addFrameLayer: () => {
    const id = "frame_" + crypto.randomUUID();
    get().addLayer({
      id,
      type: "frame",
      x: 200,
      y: 200,
      width: 300,
      height: 300,
      children: [],
      autoLayout: {
        enabled: true,
        direction: "vertical",
        padding: 20,
        gap: 12,
        align: "start",
        hugging: false,
      },
    });
    set({ selectedLayerId: id });
  },

  deleteLayer: (layerId) => {
    const page = getActivePage();
    if (!page) return;
    const instProtected = (state.instanceRegistry || {})[layerId];
    if (instProtected && !instProtected.detached) return;
    pushHistory("delete layer");
    const filtered = page.layers.filter((l) => l.id !== layerId);
    setActivePageLayers(filtered);

    get().triggerAutoSave();
  },

  deleteLayers: (layerIds = []) => {
    if (!layerIds.length) return;
    beginHistoryTransaction("delete layers");
    layerIds.forEach((id) => get().deleteLayer(id));
    endHistoryTransaction();
  },

  updateLayer: (layerId, updatedData) => {
    const state = get();

    // Component master editing path
    if (state.isEditingComponent && state.editingComponentId) {
      let components = state.components.map((comp) => {
        if (comp._id !== state.editingComponentId) return comp;
        const compCopy = {
          ...comp,
          nodes: [...(comp.nodes || [])],
          variants: comp.variants ? [...comp.variants] : [],
        };

        let targetNodes = compCopy.nodes;
        if (state.editingVariantId) {
          const variantIndex = compCopy.variants.findIndex(
            (v) => v.id === state.editingVariantId,
          );
          if (variantIndex !== -1) {
            const variant = compCopy.variants[variantIndex];
            compCopy.variants[variantIndex] = {
              ...variant,
              nodes: [...(variant.nodes || [])],
            };
            targetNodes = compCopy.variants[variantIndex].nodes;
          }
        }

        const idx = targetNodes.findIndex((n) => n.id === layerId);
        if (idx !== -1) {
          const prev = targetNodes[idx];
          const next = { ...prev, ...updatedData };
          if (prev.styleId && updatedData.props) {
            next.overrides = { ...(prev.overrides || {}), ...updatedData.props };
            delete next.props;
          }
          targetNodes[idx] = next;
        }

        return compCopy;
      });

      const updatedComponent = components.find(
        (c) => c._id === state.editingComponentId,
      );
      const targetNodes =
        state.editingVariantId && updatedComponent
          ? updatedComponent.variants?.find((v) => v.id === state.editingVariantId)?.nodes
          : updatedComponent?.nodes;

      const updatedLayers = getActivePage().layers.map((l) => {
        if (
          l.type !== "component-instance" ||
          l.componentId !== state.editingComponentId
        )
          return l;
        const matchesVariant =
          (l.variantId || null) === (state.editingVariantId || null);
        if (!matchesVariant || !targetNodes) return l;
        return {
          ...l,
          nodes: targetNodes,
          componentNodes: updatedComponent?.nodes || l.componentNodes,
          componentVariants: updatedComponent?.variants || l.componentVariants,
        };
      });

      set({
        components,
        currentTemplate: { ...state.currentTemplate, layers: updatedLayers },
      });
      setActivePageLayers(updatedLayers);
      state.triggerAutoSave();
      return;
    }

    // Normal template editing path
    const pageLayers = getActivePage().layers || [];
    const updated = pageLayers.map((layer) => {
      if (layer.id !== layerId) return layer;
      const inst = state.instanceRegistry?.[layer.componentInstanceId];
      const protectedInstance = inst && !inst.detached;

      if (protectedInstance) {
        // Block edits on attached instances (including children) except for basic transforms/variant
        const safeKeys = new Set(["x", "y", "width", "height", "variantId"]);
        const filtered = { ...layer };
        Object.entries(updatedData || {}).forEach(([k, v]) => {
          if (safeKeys.has(k)) filtered[k] = v;
        });
        return filtered;
      }

      const prevWidth = layer.width;
      const prevHeight = layer.height;
      const next = { ...layer, ...updatedData };

      // If layer is linked to a style, route style-related changes to overrides
      if (layer.styleId && updatedData.props) {
        next.overrides = { ...layer.overrides, ...updatedData.props };
        delete next.props;
      } else if (updatedData.props && layer.overrides) {
        next.overrides = { ...layer.overrides, ...updatedData.props };
      }

      if (
        (updatedData.width !== undefined && prevWidth !== updatedData.width) ||
        (updatedData.height !== undefined && prevHeight !== updatedData.height)
      ) {
        next.oldWidth = prevWidth;
        next.oldHeight = prevHeight;
      }
      return next;
    });

    set({
      currentTemplate: {
        ...state.currentTemplate,
        layers: updated,
      },
    });
    setActivePageLayers(updated);

    state.triggerAutoSave();
  },

  toggleLayerLock: (id) => {
    const layers = (getActivePage().layers || []).map((l) =>
      l.id === id ? { ...l, locked: !l.locked } : l,
    );
    setActivePageLayers(layers);
    get().triggerAutoSave();
  },

  toggleLayerVisibility: (id) => {
    const layers = (getActivePage().layers || []).map((l) =>
      l.id === id ? { ...l, hidden: !l.hidden } : l,
    );
    setActivePageLayers(layers);
    get().triggerAutoSave();
  },

  toggleLayerExpand: (id) => {
    const layers = (getActivePage().layers || []).map((l) =>
      l.id === id ? { ...l, expanded: !l.expanded } : l,
    );
    setActivePageLayers(layers);
  },

  renameLayer: (id, name) => {
    const layers = (getActivePage().layers || []).map((l) =>
      l.id === id ? { ...l, name } : l,
    );
    setActivePageLayers(layers);
    get().triggerAutoSave();
  },

  applyStyleToLayer: (layerId, style) => {
    const layers = (getActivePage().layers || []).map((l) =>
      l.id === layerId
        ? { ...l, styleId: style._id, overrides: {} }
        : l,
    );
    setActivePageLayers(layers);
    get().triggerAutoSave();
  },

  detachStyle: (layerId) => {
    const layers = (getActivePage().layers || []).map((l) =>
      l.id === layerId ? { ...l, styleId: null, overrides: {} } : l,
    );
    setActivePageLayers(layers);
    get().triggerAutoSave();
  },

  reorderLayers: (sourceId, targetId) => {
    const layers = [...(getActivePage().layers || [])];
    const sourceIndex = layers.findIndex((l) => l.id === sourceId);
    const targetIndex = layers.findIndex((l) => l.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;
    const [moved] = layers.splice(sourceIndex, 1);
    layers.splice(targetIndex, 0, moved);
    setActivePageLayers(layers);
    get().triggerAutoSave();
  },

  undoHistory: () => {
    const { historyStack, historyPointer } = get();
    if (historyPointer < 0) return;
    const entry = historyStack[historyPointer];
    restoreSnapshot(entry.snap);
    set({ historyPointer: historyPointer - 1 });
  },

  redoHistory: () => {
    const { historyStack, historyPointer } = get();
    if (historyPointer >= historyStack.length - 1) return;
    const entry = historyStack[historyPointer + 1];
    restoreSnapshot(entry.snap);
    set({ historyPointer: historyPointer + 1 });
  },

  /* --------------------------------------------------------
   * SELECTION + CANVAS INTERACTION
   * -------------------------------------------------------- */

  selectLayer: (layerId) => set({ selectedLayerId: layerId, selectedLayers: [layerId] }),

  deselectLayer: () => set({ selectedLayerId: null }),
  setSelectedLayers: (ids) =>
    set((state) => ({
      selectedLayers: ids,
      selectedLayerId: ids[0] ?? null,
      myPresence: { ...state.myPresence, selection: ids },
    })),
  addSelectedLayer: (id) =>
    set((state) => {
      const selectedLayers = [...new Set([...state.selectedLayers, id])];
      return {
        selectedLayers,
        selectedLayerId: state.selectedLayerId ?? id,
        myPresence: { ...state.myPresence, selection: selectedLayers },
      };
    }),
  removeSelectedLayer: (id) =>
    set((state) => {
      const remaining = state.selectedLayers.filter((x) => x !== id);
      return {
        selectedLayers: remaining,
        selectedLayerId: state.selectedLayerId === id ? remaining[0] ?? null : state.selectedLayerId,
        myPresence: { ...state.myPresence, selection: remaining },
      };
    }),
  clearSelection: () =>
    set((state) => ({
      selectedLayers: [],
      selectedLayerId: null,
      myPresence: { ...state.myPresence, selection: [] },
    })),

  hoverLayer: (layerId) => set({ hoveredLayerId: layerId }),

  setCanvasZoom: (zoom) => set({ canvas: { ...get().canvas, zoom } }),

  setCanvasPan: (pan) => set({ canvas: { ...get().canvas, pan } }),

  /* --------------------------------------------------------
   * TEMPLATE SAVE (UI ONLY, DB coming next)
   * -------------------------------------------------------- */

  saveTemplateLocally: () => {
    const tpl = get().currentTemplate;
    console.log("Saving template locally:", tpl);
  },

  /* --------------------------------------------------------
   * TEMPLATE NAME + META
   * -------------------------------------------------------- */

  setTemplateName: (name) =>
    set({
      currentTemplate: {
        ...get().currentTemplate,
        name,
      },
    }),

  setTemplateTags: (tags) =>
    set({
      currentTemplate: {
        ...get().currentTemplate,
        tags,
      },
    }),

  publishTemplate: async ({ title, description, price, tags, category }) => {
    const { currentTemplate } = get();

    await fetch("/api/templates/publish", {
      method: "POST",
      body: JSON.stringify({
        id: currentTemplate.id,
        title,
        description,
        price,
        tags,
        category,
      }),
    });

    console.log("Template published:", currentTemplate.id);
  },
  };
});
