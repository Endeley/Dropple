"use client";

import { create } from "zustand";
import { useNodeTreeStore } from "./nodeTreeStore";
import { usePageStore } from "./pageStore";

export const usePrototypeStore = create((set, get) => ({
  currentPageId: null,
  overlayStack: [],
  variables: {},

  setCurrentPage: (pageId) => set({ currentPageId: pageId }),

  navigateTo: (targetId, opts = {}) =>
    set((state) => {
      const pageStore = usePageStore.getState();
      if (pageStore.pages.find((p) => p.id === targetId)) {
        pageStore.setCurrentPage(targetId);
      }
      return {
        currentPageId: targetId,
        navigationTransition: opts.transition || "none",
      };
    }),

  openOverlay: (targetId, opts = {}) =>
    set((state) => ({
      overlayStack: [...state.overlayStack, { id: targetId, transition: opts.transition || "fade" }],
    })),

  closeOverlay: (targetId = null) =>
    set((state) => ({
      overlayStack: targetId
        ? state.overlayStack.filter((o) => o.id !== targetId)
        : state.overlayStack.slice(0, -1),
    })),

  setVariable: (key, value) =>
    set((state) => ({
      variables: { ...state.variables, [key]: value },
    })),

  triggerInteractions: (nodeId, trigger) => {
    const node = useNodeTreeStore.getState().nodes[nodeId];
    if (!node?.interactions?.length) return;
    const { navigateTo, openOverlay, closeOverlay, setVariable } = get();
    node.interactions
      .filter((i) => i.trigger === trigger)
      .forEach((interaction) => {
        (interaction.actions || []).forEach((action) => {
          if (action.type === "navigate" && action.target) {
            navigateTo(action.target, { transition: action.transition });
          }
          if (action.type === "openOverlay" && action.target) {
            openOverlay(action.target, { transition: action.transition });
          }
          if (action.type === "closeOverlay") {
            closeOverlay(action.target || null);
          }
          if (action.type === "setVariable" && action.key) {
            setVariable(action.key, action.value);
          }
        });
      });
  },
}));
