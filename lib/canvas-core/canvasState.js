import { create } from "zustand";

export const useCanvasState = create((set) => ({
  zoom: 1,
  pan: { x: 0, y: 0 },
  gridVisible: true,
  rulersVisible: true,
  setZoom: (zoom) => set({ zoom }),
  setPan: (pan) => set({ pan }),
  setGridVisible: (gridVisible) => set({ gridVisible }),
  setRulersVisible: (rulersVisible) => set({ rulersVisible }),
  toggleGrid: () => set((state) => ({ gridVisible: !state.gridVisible })),
  toggleRulers: () => set((state) => ({ rulersVisible: !state.rulersVisible })),
}));
