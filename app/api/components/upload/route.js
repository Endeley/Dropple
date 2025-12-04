"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function POST(request) {
  const body = await request.json();
  const {
    title,
    description,
    category,
    tags = [],
    previewImage,
    componentJSON,
    nodes,
    variants,
    isPremium = false,
    price = 0,
  } = body || {};

  if (!title || !category) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const result = await convexClient.mutation(api.components.uploadComponent, {
    title,
    description,
    category,
    tags,
    previewImage,
    componentJSON,
    nodes,
    variants,
    isPremium,
    price,
  });

  return Response.json({ success: true, componentId: result });
}
