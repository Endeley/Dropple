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

  return Response.json({
    ...res,
    size: file.size,
    type: file.type,
  });
}
