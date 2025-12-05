"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function AssetUploadButton() {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const uploadAsset = useMutation(api.assets.uploadAsset);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await generateUploadUrl();
    const result = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const { storageId } = await result.json();

    await uploadAsset({
      name: file.name,
      type: file.type,
      storageId,
    });
  }

  return (
    <label className="cursor-pointer px-3 py-1 bg-blue-600 text-white rounded inline-flex items-center gap-2 text-sm">
      Upload Asset
      <input type="file" className="hidden" onChange={handleUpload} />
    </label>
  );
}
