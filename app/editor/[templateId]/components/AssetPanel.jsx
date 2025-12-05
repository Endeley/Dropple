"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEditorStore } from "../hooks/useEditorStore";

export default function AssetPanel() {
  const assets = useQuery(api.assets.listAssets) || [];
  const addNode = useEditorStore((s) => s.addNode);

  return (
    <div className="w-full bg-white p-3 space-y-2 overflow-y-auto max-h-64">
      {assets.map((asset) => (
        <div
          key={asset._id}
          className="cursor-pointer hover:bg-gray-100 p-2 rounded border"
          onClick={() => insertAsset(asset)}
        >
          <img src={getImageUrl(asset.storageId)} className="w-full rounded" alt={asset.name} />
          <p className="text-xs mt-1 truncate">{asset.name}</p>
        </div>
      ))}
      {assets.length === 0 && <p className="text-xs text-gray-500">No assets yet.</p>}
    </div>
  );

  function getImageUrl(storageId) {
    return `/api/storage/${storageId}`;
  }

  function insertAsset(asset) {
    addNode({
      type: "image",
      src: getImageUrl(asset.storageId),
      x: 200,
      y: 200,
      width: 300,
      height: 200,
      fit: "cover",
    });
  }
}
