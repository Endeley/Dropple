"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function GET(_request, { params }) {
  const { id } = params;
  if (!id) {
    return Response.json({ error: "Missing template id" }, { status: 400 });
  }

  try {
    const stored = await convexClient.query(api.templates.getTemplate, {
      id,
    });

    if (!stored) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    let templateData = stored.templateData;
    if (!templateData && stored.templateJsonUrl) {
      try {
        const res = await fetch(stored.templateJsonUrl);
        templateData = await res.json();
      } catch (err) {
        console.error("Failed to fetch template JSON from storage", err);
      }
    }

    const merged = {
      ...(templateData || {}),
      id: stored._id,
      name: stored.name,
      category: stored.category,
      tags: stored.tags,
      description: stored.description,
      thumbnail: stored.thumbnailUrl || stored.thumbnail,
      width: stored.width || templateData?.frame?.width,
      height: stored.height || templateData?.frame?.height,
    };

    return Response.json({ template: merged });
  } catch (err) {
    console.error("Failed to fetch template", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
