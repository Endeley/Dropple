import { create } from "zustand";
import { generateId } from "../utils/generateId";
import { applyAutoLayout } from "../utils/autoLayout";
import { convertToAutoLayout } from "../utils/convertToAutoLayout";
import { validateDroppleTemplate } from "@/lib/droppleTemplateSpec";
import { normalizeAssets } from "@/lib/normalizeAssets";

export const useEditorStore = create((set, get) => ({
  width: 1080,
  height: 1080,
  background: "#ffffff",
  nodes: [],
  selectedNodeIds: [],
  isDragging: false,
  smartGuides: [],

  addNode: (node) =>
    set((state) => ({
      nodes: [
        ...state.nodes,
        {
          id: generateId(),
          name: node.name || "Layer",
          visible: node.visible ?? true,
          locked: node.locked ?? false,
          animations: node.animations || [],
          ...node,
        },
      ],
    })),

  updateNode: (id, updates) =>
    set((state) => {
      const updatedNodes = state.nodes.map((node) => (node.id === id ? { ...node, ...updates } : node));

      // apply auto layout for any parent frames
      updatedNodes.forEach((parent) => {
        if (parent.layout?.enabled) {
          const children = updatedNodes.filter((n) => n.parentId === parent.id || parent.children?.includes(n.id));
          applyAutoLayout(parent, children);
        }
      });

      return { nodes: updatedNodes };
    }),

  setSelectedNodes: (ids) => set({ selectedNodeIds: ids }),

  selectNode: (id, additive = false) =>
    set((state) => ({
      selectedNodeIds: additive ? [...new Set([...state.selectedNodeIds, id])] : [id],
    })),

  clearSelection: () => set({ selectedNodeIds: [] }),

  isSelected: (id) => get().selectedNodeIds.includes(id),

  setSmartGuides: (guides) => set({ smartGuides: guides }),
  clearSmartGuides: () => set({ smartGuides: [] }),

  getSelectedNodes: () => {
    const state = get();
    return state.nodes.filter((n) => state.selectedNodeIds.includes(n.id));
  },

  toggleVisibility: (id) =>
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, visible: !n.visible } : n)),
    })),

  toggleLock: (id) =>
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, locked: !n.locked } : n)),
    })),

  renameNode: (id, name) =>
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, name } : n)),
    })),

  reorderNodes: (newOrder) => set({ nodes: newOrder }),

  addAnimation: (nodeId, anim) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, animations: [...(n.animations || []), anim] } : n,
      ),
    })),

  updateAnimation: (nodeId, animId, updates) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              animations: (n.animations || []).map((a) => (a.id === animId ? { ...a, ...updates } : a)),
            }
          : n,
      ),
    })),

  deleteAnimation: (nodeId, animId) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId
          ? { ...n, animations: (n.animations || []).filter((a) => a.id !== animId) }
          : n,
      ),
    })),

  deleteNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      selectedNodeIds: state.selectedNodeIds.filter((sid) => sid !== id),
    })),

  wrapSelectedInAutoLayout: () =>
    set((state) => {
      const selected = state.nodes.filter((n) => state.selectedNodeIds.includes(n.id));
      if (selected.length < 2) return state;

      const result = convertToAutoLayout(selected);
      if (!result) return state;

      const remaining = state.nodes.filter((n) => !state.selectedNodeIds.includes(n.id));
      return {
        nodes: [...remaining, result.frame, ...result.children],
        selectedNodeIds: [result.frame.id],
      };
    }),

  exportTemplate: () => {
    const state = get();
    return {
      name: state.name ?? "Untitled Template",
      mode: state.mode ?? "graphic",
      width: state.width,
      height: state.height,
      background: state.background,
      nodes: state.nodes,
      tags: state.tags ?? [],
      category: state.category ?? "graphic",
    };
  },

  loadTemplate: (template) =>
    set((state) => {
      const normalizedTemplate = template
        ? { ...template, assets: normalizeAssets(template.assets || []) }
        : template;
      const validation = validateDroppleTemplate(normalizedTemplate || {});
      if (!validation.valid) {
        console.error("Template validation failed", validation.errors);
        return state;
      }
      return {
        width: normalizedTemplate.width || 1080,
        height: normalizedTemplate.height || 1080,
        background: normalizedTemplate.background?.value || normalizedTemplate.background || "#ffffff",
        nodes: normalizedTemplate.nodes || [],
      };
    }),
}));
