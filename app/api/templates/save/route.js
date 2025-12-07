"use server";

import { convexClient } from "@/lib/convex/client";
import { api } from "@/convex/_generated/api";

export async function POST(request) {
  const contentType = request.headers.get("content-type") || "";
  // multipart form with template + metadata + thumbnail
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const meta = JSON.parse(form.get("metadata") || "{}");
    const templateFile = form.get("template");
    const thumbnailFile = form.get("thumbnail");
    const templateJson = templateFile ? JSON.parse(await templateFile.text()) : null;
    const thumbBytes = thumbnailFile ? Array.from(new Uint8Array(await thumbnailFile.arrayBuffer())) : undefined;

    if (!templateJson) {
      return Response.json({ error: "Missing template payload" }, { status: 400 });
    }

    const payload = {
      name: meta.name || templateJson.name || "Template",
      category: meta.category || templateJson.category || "General",
      tags: meta.tags || templateJson.tags || [],
      mode: templateJson.mode || "uiux",
      templateData: templateJson,
      thumbnail: undefined,
      thumbnailBytes: thumbBytes,
      templateJsonString: JSON.stringify(templateJson),
      description: meta.description || templateJson.description || "",
      visibility: meta.visibility || "private",
    };

    const id = await convexClient.mutation(api.templates.saveTemplate, payload);
    return Response.json({ success: true, id });
  }

  // fallback for older JSON payloads
  const template = await request.json();

  const templateId = template?._id || template?.id;

  // If we don't have a Convex document id, create a new template first.
  if (!templateId) {
    const newId = await convexClient.mutation(api.templates.createTemplate, {
      templateData: {
        name: template?.name || "Untitled Template",
        mode: template?.mode || "uiux",
        thumbnail: template?.thumbnail || "",
        tags: template?.tags || [],
        category: template?.category || "",
        width: template?.width || 1440,
        height: template?.height || 1024,
        layers: template?.layers || [],
        price: typeof template?.price === "number" ? template.price : 0,
      },
    });

    return Response.json({ success: true, id: newId });
  }

  await convexClient.mutation(api.templates.updateTemplate, {
    id: templateId,
    data: template,
  });

  return Response.json({ success: true, id: templateId });
}
