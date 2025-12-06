"use client";

import { create } from "zustand";

export const useProjectStore = create((set) => ({
  activeProject: null,
  setActiveProject: (project) => set({ activeProject: project }),
}));
