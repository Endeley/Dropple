import { create } from "zustand";

export const useCanvasState = create((set) => ({
  zoom: 1,
  pan: { x: 0, y: 0 },
  gridVisible: true,
  setZoom: (zoom) => set({ zoom }),
  setPan: (pan) => set({ pan }),
  toggleGrid: () => set((state) => ({ gridVisible: !state.gridVisible })),
}));
