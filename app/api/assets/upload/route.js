"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  const buffer = new Uint8Array(await file.arrayBuffer());

  const res = await convexClient.action(api.assets.uploadImage, {
    file: {
      name: file.name,
      type: file.type,
      size: file.size,
      data: buffer,
    },
  });

  if (!res?.url) {
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }

  // Also add to asset library for reuse
  try {
    await convexClient.mutation(api.assetLibrary.createLibraryAsset, {
      type: "image",
      title: file.name,
      description: "",
      tags: [],
      fileUrl: res.url,
      previewUrl: res.url,
      fileType: file.type,
      size: file.size,
      width: null,
      height: null,
      isPremium: false,
      price: 0,
      source: "upload",
      license: "owner",
    });
  } catch (err) {
    console.warn("Failed to create library asset", err);
  }

  return Response.json({
    ...res,
    size: file.size,
    type: file.type,
  });
}
