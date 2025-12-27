"use client";

import { useAssetStore } from "@/runtime/stores/assetStore";

export function resolveAsset(assetId, dpr = 1) {
  const asset = useAssetStore.getState().assets[assetId];
  if (!asset) return null;
  const variants = asset.variants || {};
  // naive pick: prefer webp, then 2x if dpr > 1.5, else base url
  if (dpr > 1.5 && variants["2x"]) return variants["2x"];
  if (variants.webp) return variants.webp;
  if (variants["1x"]) return variants["1x"];
  return asset.url;
}
