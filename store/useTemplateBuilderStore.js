"use client";

import { create } from "zustand";

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
};

export const useTemplateBuilderStore = create((set, get) => ({
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

  editingMode: false, // false = create, true = edit
  isEditingComponent: false,
  editingComponentId: null,
  editingVariantId: null,

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

  snapThreshold: 6,
  activeGuides: [],
  setActiveGuides: (guides) => set({ activeGuides: guides }),

  editingTextId: null,
  setEditingTextId: (id) => set({ editingTextId: id }),
  stopEditingText: () => set({ editingTextId: null }),

  setComponents: (components) => set({ components }),

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
      ...layer,
    };

    set((state) => {
      let layers = [...state.currentTemplate.layers, layerWithDefaults];

      if (parentId) {
        layers = layers.map((l) =>
          l.id === parentId && l.type === "frame"
            ? { ...l, children: [...(l.children || []), layerWithDefaults.id] }
            : l,
        );
      }

      return {
        currentTemplate: {
          ...state.currentTemplate,
          layers,
        },
      };
    });

    get().triggerAutoSave();
  },

  addTextLayer: () => {
    const id = "text_" + crypto.randomUUID();
    const parent = get()
      .currentTemplate.layers.find(
        (l) => l.id === get().selectedLayerId && l.type === "frame",
      );
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
    const parent = get()
      .currentTemplate.layers.find(
        (l) => l.id === get().selectedLayerId && l.type === "frame",
      );
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
    const parent = get()
      .currentTemplate.layers.find(
        (l) => l.id === get().selectedLayerId && l.type === "frame",
      );
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
    const parent = get()
      .currentTemplate.layers.find(
        (l) => l.id === get().selectedLayerId && l.type === "frame",
      );
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
    }, parent?.id);
    set({ selectedLayerId: id });
    get().triggerAutoSave();
  },

  createGroup: () => {
    const { selectedLayers, currentTemplate } = get();
    if (!selectedLayers || selectedLayers.length < 2) return;

    const children = selectedLayers
      .map((id) => currentTemplate.layers.find((l) => l.id === id))
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
    };

    const updatedLayers = currentTemplate.layers.map((l) =>
      children.find((c) => c.id === l.id)
        ? { ...l, x: l.x - minX, y: l.y - minY, parentId: groupId }
        : l,
    );

    updatedLayers.push(groupLayer);

    set({
      currentTemplate: {
        ...currentTemplate,
        layers: updatedLayers,
      },
      selectedLayerId: groupId,
      selectedLayers: [groupId],
    });

    get().triggerAutoSave();
  },

  setVariantForInstance: (layerId, variantId) => {
    const template = get().currentTemplate;
    const layer = template.layers.find((l) => l.id === layerId);
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
    set({ currentTemplate: { ...template } });
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
    const filtered = get().currentTemplate.layers.filter((l) => l.id !== layerId);

    set({
      currentTemplate: {
        ...get().currentTemplate,
        layers: filtered,
      },
    });

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

      const updatedLayers = state.currentTemplate.layers.map((l) => {
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
      state.triggerAutoSave();
      return;
    }

    // Normal template editing path
    const updated = state.currentTemplate.layers.map((layer) => {
      if (layer.id !== layerId) return layer;
      const prevWidth = layer.width;
      const prevHeight = layer.height;
      const next = { ...layer, ...updatedData };
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

    state.triggerAutoSave();
  },

  toggleLayerLock: (id) => {
    set((state) => {
      const layers = state.currentTemplate.layers.map((l) =>
        l.id === id ? { ...l, locked: !l.locked } : l,
      );
      return { currentTemplate: { ...state.currentTemplate, layers } };
    });
    get().triggerAutoSave();
  },

  toggleLayerVisibility: (id) => {
    set((state) => {
      const layers = state.currentTemplate.layers.map((l) =>
        l.id === id ? { ...l, hidden: !l.hidden } : l,
      );
      return { currentTemplate: { ...state.currentTemplate, layers } };
    });
    get().triggerAutoSave();
  },

  toggleLayerExpand: (id) => {
    set((state) => {
      const layers = state.currentTemplate.layers.map((l) =>
        l.id === id ? { ...l, expanded: !l.expanded } : l,
      );
      return { currentTemplate: { ...state.currentTemplate, layers } };
    });
  },

  renameLayer: (id, name) => {
    set((state) => {
      const layers = state.currentTemplate.layers.map((l) =>
        l.id === id ? { ...l, name } : l,
      );
      return { currentTemplate: { ...state.currentTemplate, layers } };
    });
    get().triggerAutoSave();
  },

  reorderLayers: (sourceId, targetId) => {
    set((state) => {
      const layers = [...state.currentTemplate.layers];
      const sourceIndex = layers.findIndex((l) => l.id === sourceId);
      const targetIndex = layers.findIndex((l) => l.id === targetId);
      if (sourceIndex === -1 || targetIndex === -1) return state;
      const [moved] = layers.splice(sourceIndex, 1);
      layers.splice(targetIndex, 0, moved);
      return { currentTemplate: { ...state.currentTemplate, layers } };
    });
    get().triggerAutoSave();
  },

  /* --------------------------------------------------------
   * SELECTION + CANVAS INTERACTION
   * -------------------------------------------------------- */

  selectLayer: (layerId) => set({ selectedLayerId: layerId, selectedLayers: [layerId] }),

  deselectLayer: () => set({ selectedLayerId: null }),
  setSelectedLayers: (ids) => set({ selectedLayers: ids, selectedLayerId: ids[0] ?? null }),
  addSelectedLayer: (id) =>
    set((state) => ({
      selectedLayers: [...new Set([...state.selectedLayers, id])],
      selectedLayerId: state.selectedLayerId ?? id,
    })),
  removeSelectedLayer: (id) =>
    set((state) => {
      const remaining = state.selectedLayers.filter((x) => x !== id);
      return {
        selectedLayers: remaining,
        selectedLayerId: state.selectedLayerId === id ? remaining[0] ?? null : state.selectedLayerId,
      };
    }),
  clearSelection: () => set({ selectedLayers: [], selectedLayerId: null }),

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
}));
