"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function POST(req) {
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const meta = JSON.parse(form.get("metadata") || "{}");
    const templateFile = form.get("template");
    const thumbnailFile = form.get("thumbnail");
    const templateJson = templateFile ? JSON.parse(await templateFile.text()) : null;
    const thumbBytes = thumbnailFile ? Array.from(new Uint8Array(await thumbnailFile.arrayBuffer())) : undefined;

    if (!templateJson) return Response.json({ error: "Missing template" }, { status: 400 });

    const payload = {
      id: meta.id,
      name: meta.name || templateJson.name || "Template",
      category: meta.category || templateJson.category || "General",
      tags: meta.tags || templateJson.tags || [],
      mode: templateJson.mode || "uiux",
      templateData: templateJson,
      thumbnail: undefined,
      thumbnailBytes: thumbBytes,
      templateJsonString: JSON.stringify(templateJson),
      description: meta.description || templateJson.description || "",
      visibility: "public",
    };

    const id = await convexClient.mutation(api.templates.saveTemplate, payload);
    await convexClient.mutation(api.templates.publishTemplate, { id });
    return Response.json({ success: true, id });
  }

  const body = await req.json();

  const { id, title, description, price, tags, category } = body;

  const result = await convexClient.mutation(api.templates.publishTemplate, {
    id,
    title,
    description,
    price,
    tags,
    category,
  });

  return Response.json({ success: true, result });
}
