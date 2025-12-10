"use server";

import { convexClient } from "@/lib/convex/client";
import { api } from "@/convex/_generated/api";
import { validateDroppleTemplate } from "@/lib/droppleTemplateSpec";
import { normalizeAssets } from "@/lib/normalizeAssets";

const makeLocalId = () => `tpl-${crypto.randomUUID()}`;
const isConvexId = (val) => typeof val === "string" && /^[a-z0-9]{15,}$/i.test(val);

export async function POST(request) {
  const contentType = request.headers.get("content-type") || "";
  // multipart form with template + metadata + thumbnail
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const meta = JSON.parse(form.get("metadata") || "{}");
    const templateFile = form.get("template");
    const thumbnailFile = form.get("thumbnail");
    const templateJsonRaw = templateFile ? JSON.parse(await templateFile.text()) : null;
    const templateJson = templateJsonRaw
      ? { ...templateJsonRaw, assets: normalizeAssets(templateJsonRaw.assets) }
      : null;
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
      assets: templateJson.assets || [],
      thumbnail: undefined,
      thumbnailBytes: thumbBytes,
      description: meta.description || templateJson.description || "",
      visibility: meta.visibility || "private",
    };

    const validation = validateDroppleTemplate(payload.templateData);
    if (!validation.valid) {
      return Response.json({ error: "Template validation failed", details: validation.errors }, { status: 400 });
    }

    try {
      const id = await convexClient.mutation(api.templates.saveTemplate, payload);
      return Response.json({ success: true, id });
    } catch (err) {
      console.error("Convex saveTemplate failed", err);
      if (err?.response?.status === 401 || err?.status === 401) {
        const localId = makeLocalId();
        return Response.json({
          success: false,
          error: "Authentication required to save to cloud.",
          localId,
          localOnly: true,
        });
      }
      return Response.json({ error: err?.message || "Save failed", success: false }, { status: 500 });
    }
  }

  // fallback for older JSON payloads
  const rawTemplate = await request.json();
  const template = rawTemplate
    ? { ...rawTemplate, assets: normalizeAssets(rawTemplate.assets) }
    : rawTemplate;

  const validation = validateDroppleTemplate(template || {});
  if (!validation.valid) {
    return Response.json({ error: "Template validation failed", details: validation.errors }, { status: 400 });
  }

  let templateId = template?._id || template?.id;
  if (templateId && !isConvexId(templateId)) {
    templateId = undefined; // local/temporary id; create a new template instead of updating
  }

  // If we don't have a Convex document id, create a new template first.
  if (!templateId) {
    try {
      const newId = await convexClient.mutation(api.templates.createTemplate, {
        templateData: template,
        assets: template.assets || [],
        name: template?.name || "Untitled Template",
        mode: template?.mode || "uiux",
        thumbnail: template?.thumbnail || "",
        tags: template?.tags || [],
        category: template?.category || "",
        width: template?.width || 1440,
        height: template?.height || 1024,
        layers: template?.layers || [],
        price: typeof template?.price === "number" ? template.price : 0,
      });

      return Response.json({ success: true, id: newId });
    } catch (err) {
      console.error("Convex createTemplate failed", err);
      if (err?.response?.status === 401 || err?.status === 401) {
        const localId = makeLocalId();
        return Response.json({
          success: false,
          error: "Authentication required to save to cloud.",
          localId,
          localOnly: true,
        });
      }
      return Response.json({ error: err?.message || "Create failed", success: false }, { status: 500 });
    }
  }

  try {
    await convexClient.mutation(api.templates.updateTemplate, {
      id: templateId,
      data: template,
    });
    return Response.json({ success: true, id: templateId });
  } catch (err) {
    console.error("Convex updateTemplate failed", err);
    if (err?.response?.status === 401 || err?.status === 401) {
      return Response.json({
        success: false,
        error: "Authentication required to save to cloud.",
        localOnly: true,
        localId: templateId || makeLocalId(),
      });
    }
    return Response.json({ error: err?.message || "Update failed", success: false }, { status: 500 });
  }
}
