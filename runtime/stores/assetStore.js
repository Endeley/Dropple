"use client";

import { create } from "zustand";

const createDefaultAsset = (file) => ({
  id: `asset_${crypto.randomUUID()}`,
  name: file?.name || "Untitled Asset",
  type: "image",
  url: "",
  variants: {},
  size: { width: 0, height: 0 },
  createdAt: Date.now(),
  updatedAt: Date.now(),
  version: 1,
  metadata: {},
  scope: "project", // project | page | global
});

export const useAssetStore = create((set, get) => ({
  assets: {},

  addAsset: (asset) =>
    set((state) => ({
      assets: { ...state.assets, [asset.id]: asset },
    })),

  updateAsset: (id, updates) =>
    set((state) => {
      const existing = state.assets[id];
      if (!existing) return state;
      return {
        assets: {
          ...state.assets,
          [id]: { ...existing, ...updates, updatedAt: Date.now() },
        },
      };
    }),

  addVersion: (id, versionData) =>
    set((state) => {
      const existing = state.assets[id];
      if (!existing) return state;
      const versions = [
        ...(existing.versions || []),
        { ...versionData, createdAt: Date.now() },
      ];
      return {
        assets: {
          ...state.assets,
          [id]: { ...existing, versions, version: versions.length },
        },
      };
    }),

  getAsset: (id) => get().assets[id],

  importFileAsAsset: async (file) => {
    const reader = new FileReader();
    const asset = createDefaultAsset(file);
    return new Promise((resolve) => {
      reader.onload = () => {
        const url = reader.result;
        get().addAsset({ ...asset, url });
        resolve({ ...asset, url });
      };
      reader.readAsDataURL(file);
    });
  },
}));
