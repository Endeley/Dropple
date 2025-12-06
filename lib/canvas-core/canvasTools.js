import { create } from "zustand";

export const useCanvasTools = create((set) => ({
  activeTool: "select",
  setTool: (tool) => set({ activeTool: tool }),
}));
