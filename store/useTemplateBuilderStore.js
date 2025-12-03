"use client";

import { create } from "zustand";

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

  editingMode: false, // false = create, true = edit

  /* --------------------------------------------------------
   * UI STATE
   * -------------------------------------------------------- */

  selectedLayerId: null,
  hoveredLayerId: null,

  canvas: {
    zoom: 1,
    pan: { x: 0, y: 0 },
  },

  editingTextId: null,
  setEditingTextId: (id) => set({ editingTextId: id }),
  stopEditingText: () => set({ editingTextId: null }),

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

  /* --------------------------------------------------------
   * LAYER MANAGEMENT
   * -------------------------------------------------------- */

  addLayer: (layer) => {
    set({
      currentTemplate: {
        ...get().currentTemplate,
        layers: [...get().currentTemplate.layers, layer],
      },
    });

    get().triggerAutoSave();
  },

  addTextLayer: () => {
    const id = "text_" + crypto.randomUUID();
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
    });
    set({ selectedLayerId: id });
  },

  addRectangleLayer: () => {
    const id = "rect_" + crypto.randomUUID();
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
    });
    set({ selectedLayerId: id });
  },

  addImageLayer: (url = "/placeholder-image.png") => {
    const id = "img_" + crypto.randomUUID();
    get().addLayer({
      id,
      type: "image",
      url,
      x: 200,
      y: 200,
      width: 300,
      height: 200,
      props: {},
    });
    set({ selectedLayerId: id });
  },

  addComponentInstance: (component) => {
    const id = "instance_" + crypto.randomUUID();
    get().addLayer({
      id,
      type: "component-instance",
      componentId: component._id,
      nodes: component.nodes,
      x: 200,
      y: 200,
      width: 300,
      height: 200,
      overrides: {},
    });
    set({ selectedLayerId: id });
    get().triggerAutoSave();
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
    const updated = get().currentTemplate.layers.map((layer) =>
      layer.id === layerId ? { ...layer, ...updatedData } : layer,
    );

    set({
      currentTemplate: {
        ...get().currentTemplate,
        layers: updated,
      },
    });

    get().triggerAutoSave();
  },

  /* --------------------------------------------------------
   * SELECTION + CANVAS INTERACTION
   * -------------------------------------------------------- */

  selectLayer: (layerId) => set({ selectedLayerId: layerId }),

  deselectLayer: () => set({ selectedLayerId: null }),

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
