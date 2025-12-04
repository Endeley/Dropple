"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function POST(request) {
  const body = await request.json();
  const {
    type,
    title,
    description,
    tags = [],
    fileUrl,
    previewUrl,
    fileType,
    size,
    width,
    height,
    packId,
    isPremium = false,
    price = 0,
  } = body || {};

  if (!type || !title || !fileUrl || !previewUrl || !fileType || !size) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const id = await convexClient.mutation(api.assets.createLibraryAsset, {
      type,
      title,
      description,
      tags,
      fileUrl,
      previewUrl,
      fileType,
      size,
      width,
      height,
      packId,
      isPremium,
      price,
    });

    return Response.json({ success: true, id });
  } catch (err) {
    console.error("Failed to create library asset", err);
    return Response.json({ error: "Failed to create asset" }, { status: 500 });
  }
}
