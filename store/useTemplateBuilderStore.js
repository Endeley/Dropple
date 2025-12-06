"use client";

import { create } from "zustand";
import { deepClone } from "@/lib/deepClone";

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
      collected.push(deepClone(layer));
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
      const clone = deepClone(layer);
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
    const createdIds = [];
    state.selectedLayers.forEach((id) => {
      const newIds = state.duplicateLayer(id, { select: false });
      if (newIds?.length) createdIds.push(...newIds);
    });
    if (createdIds.length) {
      set({ selectedLayerId: createdIds[0], selectedLayers: createdIds });
    }
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
        props: deepClone(styleProps),
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
        updates.props = deepClone(state.clipboardStyles.props);
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

      const data = await res.json();
      const tpl = data.template;

      if (!tpl) {
        console.error("Template not found:", templateId);
        return;
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
    const id = "instance_" + crypto.randomUUID();
    const parent = getActivePage()
      ?.layers.find((l) => l.id === get().selectedLayerId && l.type === "frame");
    get().addLayer({
      id,
      type: "component-instance",
      componentId: component._id,
      componentNodes: component.nodes,
      componentVariants: component.variants || [],
      nodes: component.nodes,
      variantId,
      x: 200,
      y: 200,
      width: 300,
      height: 200,
      overrides: {},
      interactions: [],
    }, parent?.id);
    set({ selectedLayerId: id });
    get().triggerAutoSave();
  },

  addArtboard: () => {
    const id = "artboard_" + crypto.randomUUID();
    const artboard = {
      id,
      type: "artboard",
      name: "Artboard",
      x: 100,
      y: 100,
      width: 1440,
      height: 1024,
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
    const filtered = page.layers.filter((l) => l.id !== layerId);
    setActivePageLayers(filtered);

    get().triggerAutoSave();
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
