"use client";

import { create } from "zustand";
import { useNodeTreeStore } from "./nodeTreeStore";

const defaultBreakpoints = [
  { id: "desktop", label: "Desktop", min: 1024 },
  { id: "tablet", label: "Tablet", min: 768, max: 1023 },
  { id: "mobile", label: "Mobile", max: 767 },
];

const cloneBreakpoints = (bps = defaultBreakpoints) => bps.map((bp) => ({ ...bp }));

const defaultPage = {
  id: "page_home",
  name: "Home",
  path: "/",
  frames: [],
  pageVariables: {},
  metadata: {},
  breakpoints: cloneBreakpoints(),
};

export const usePageStore = create((set, get) => ({
  pages: [defaultPage],
  currentPageId: defaultPage.id,
  viewportWidth: 1440,
  currentBreakpointId: "desktop",
  workspaceMode: "design", // design | layout | template

  addPage: (page) =>
    set((state) => {
      const nextPage = page || {
        id: `page_${crypto.randomUUID()}`,
        name: "Untitled Page",
        path: "/",
        frames: [],
        pageVariables: {},
        metadata: {},
        breakpoints: cloneBreakpoints(),
      };
      return {
        pages: [...state.pages, nextPage],
        currentPageId: nextPage.id,
        currentBreakpointId: nextPage.breakpoints?.[0]?.id || "desktop",
      };
    }),

  setCurrentPage: (id) => set({ currentPageId: id }),
  setWorkspaceMode: (mode) => set({ workspaceMode: mode || "design" }),
  setCurrentBreakpoint: (id) => {
    const state = get();
    const page = state.pages.find((p) => p.id === state.currentPageId);
    const bp = page?.breakpoints?.find((b) => b.id === id);
    if (bp) {
      const targetWidth = bp.min ?? bp.max ?? state.viewportWidth;
      set({ currentBreakpointId: id, viewportWidth: targetWidth });
    } else {
      set({ currentBreakpointId: id });
    }
  },

  setViewportWidth: (width) => {
    const state = get();
    const page = state.pages.find((p) => p.id === state.currentPageId);
    const w = Math.max(320, Math.min(2400, width || 0));
    let active = state.currentBreakpointId;
    const match = (page?.breakpoints || cloneBreakpoints()).find((bp) => {
      const minOk = bp.min === undefined || w >= bp.min;
      const maxOk = bp.max === undefined || w <= bp.max;
      return minOk && maxOk;
    });
    if (match) active = match.id;
    set({ viewportWidth: w, currentBreakpointId: active });
  },

  renamePage: (id, name) =>
    set((state) => ({
      pages: state.pages.map((p) => (p.id === id ? { ...p, name } : p)),
    })),

  attachFrameToPage: (pageId, frameId) =>
    set((state) => ({
      pages: state.pages.map((p) =>
        p.id === pageId ? { ...p, frames: Array.from(new Set([...(p.frames || []), frameId])) } : p,
      ),
    })),

  setBreakpoints: (pageId, breakpoints) =>
    set((state) => ({
      pages: state.pages.map((p) =>
        p.id === pageId ? { ...p, breakpoints: cloneBreakpoints(breakpoints || defaultBreakpoints) } : p,
      ),
    })),

  removePage: (id) => {
    const state = get();
    const pages = state.pages.filter((p) => p.id !== id);
    // Remove frames belonging to this page
    const frameIds =
      state.pages.find((p) => p.id === id)?.frames || [];
    const removeNode = useNodeTreeStore.getState().removeNode;
    frameIds.forEach((fid) => removeNode(fid));
    set({
      pages: pages.length ? pages : [defaultPage],
      currentPageId: pages[0]?.id || defaultPage.id,
    });
  },
}));
