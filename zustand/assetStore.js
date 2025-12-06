"use client";

import { create } from "zustand";

export const useAssetStore = create((set) => ({
  assets: [],
  addAsset: (asset) => set((state) => ({ assets: [...state.assets, asset] })),
  setAssets: (assets) => set({ assets }),
}));
