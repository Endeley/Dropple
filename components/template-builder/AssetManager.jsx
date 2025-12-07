/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";

export default function AssetManager() {
  const { assets, loadAssets } = useTemplateBuilderStore();
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadAssets().catch(() => {});
  }, [loadAssets]);

  const filtered = assets.filter((a) =>
    (a.name || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-3 space-y-2 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-lg">Assets</h2>
      </div>

      <input
        placeholder="Search assets..."
        className="p-2 border rounded text-sm"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-2 overflow-y-auto">
        {filtered.map((asset) => (
          <AssetItem key={asset._id || asset.fileId} asset={asset} />
        ))}
      </div>
    </div>
  );
}

function AssetItem({ asset }) {
  const { addLayer } = useTemplateBuilderStore.getState();

  function handleDragStart(e) {
    e.dataTransfer.setData("asset-url", asset.url);
    e.dataTransfer.setData("asset-width", asset.width || "");
    e.dataTransfer.setData("asset-height", asset.height || "");
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="border rounded overflow-hidden cursor-pointer bg-white shadow-sm"
    >
      <img src={asset.url} alt={asset.name || "asset"} className="w-full h-20 object-cover" />
      <div className="p-1 text-xs truncate">{asset.name}</div>
    </div>
  );
}
