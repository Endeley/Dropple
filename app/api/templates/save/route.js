"use server";

import { convexClient } from "@/lib/convex/client";
import { api } from "@/convex/_generated/api";

export async function POST(request) {
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
