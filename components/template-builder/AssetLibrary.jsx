"use client";

import { useEffect, useState } from "react";
import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";

export default function AssetLibrary() {
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    loadAssets();
  }, []);

  async function loadAssets() {
    const res = await fetch("/api/assets/list", { method: "GET" });
    const data = await res.json();
    setAssets(data.assets || []);
  }

  async function handleInsert(url) {
    useTemplateBuilderStore.getState().addImageLayer(url);
  }

  return (
    <div className="space-y-3">
      <h3 className="font-medium">Your Images</h3>

      <div className="grid grid-cols-3 gap-3">
        {assets.map((a) => (
          <img
            key={a.assetId ?? a._id ?? a.fileId}
            src={a.url}
            onClick={() => handleInsert(a.url)}
            className="w-full h-20 object-cover rounded cursor-pointer hover:ring-2 hover:ring-blue-500"
          />
        ))}
      </div>
    </div>
  );
}
