"use client";

import { create } from "zustand";

export const ASSET_CATALOG = [
  {
    id: "asset-illustration",
    type: "asset",
    name: "3D Illustration",
    category: "Illustration",
    width: 800,
    height: 600,
    previewUrl:
      "https://images.unsplash.com/photo-1522193672904-9899b0c2110c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "asset-photo",
    type: "asset",
    name: "Hero Photo",
    category: "Photography",
    width: 1600,
    height: 900,
    previewUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "icon-pack",
    type: "icon",
    name: "Feather Icons Set",
    category: "Icons",
    width: 48,
    height: 48,
    previewUrl:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=60&sat=-60",
  },
  {
    id: "component-button",
    type: "component",
    name: "Button Set",
    category: "Components",
    width: 200,
    height: 64,
    previewUrl:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80",
  },
];

export const useAssetBrowserStore = create((set) => ({
  open: false,
  tab: "templates",
  search: "",
  category: "All",
  sort: "recent",
  openBrowser: (tab = "templates") => set({ open: true, tab }),
  closeBrowser: () => set({ open: false }),
  setTab: (tab) => set({ tab }),
  setSearch: (search) => set({ search }),
  setCategory: (category) => set({ category }),
  setSort: (sort) => set({ sort }),
}));
