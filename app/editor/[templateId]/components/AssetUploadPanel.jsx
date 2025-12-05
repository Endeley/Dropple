"use client";

import AssetUploadButton from "@/components/AssetUploadButton";
import AssetPanel from "./AssetPanel";

export default function AssetUploadPanel() {
  return (
    <div className="border-b">
      <div className="p-3">
        <h3 className="font-semibold text-sm mb-2">Assets</h3>
        <AssetUploadButton />
      </div>
      <AssetPanel />
    </div>
  );
}
