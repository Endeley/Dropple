"use client";

import { create } from "zustand";

export const useComponentStore = create((set, get) => ({
  components: {},
  editingSession: null, // { componentId, rootIds, instanceId?, sessionId? }
  draggingComponentId: null,
  addComponent: (component) =>
    set((state) => ({
      components: { ...state.components, [component.id]: component },
    })),
  setComponents: (components) => set({ components }),
  updateComponent: (id, updates) =>
    set((state) => {
      if (!state.components[id]) return state;
      return { components: { ...state.components, [id]: { ...state.components[id], ...updates } } };
    }),
  setDraggingComponent: (id) => set({ draggingComponentId: id }),
  clearDraggingComponent: () => set({ draggingComponentId: null }),
  addVariant: (id, variant) =>
    set((state) => {
      const comp = state.components[id];
      if (!comp) return state;
      const variants = [...(comp.variants || []), variant];
      return { components: { ...state.components, [id]: { ...comp, variants } } };
    }),
  updateVariant: (id, variantId, updates) =>
    set((state) => {
      const comp = state.components[id];
      if (!comp) return state;
      const variants = (comp.variants || []).map((v) => (v.id === variantId ? { ...v, ...updates } : v));
      return { components: { ...state.components, [id]: { ...comp, variants } } };
    }),
  setEditingSession: (session) => set({ editingSession: session }),
  getComponent: (id) => get().components[id],
}));
