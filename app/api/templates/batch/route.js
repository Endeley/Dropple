"use server";

import { assembleTemplate } from "@/lib/templateAssembler";
import { convertBlueprintToDroppleTemplate } from "@/lib/convertBlueprintToDroppleTemplate";
import { validateDroppleTemplate } from "@/lib/droppleTemplateSpec";
import { normalizeAssets } from "@/lib/normalizeAssets";
import { convexClient } from "@/lib/convex/client";
import { api } from "@/convex/_generated/api";
import { defaultTemplateBriefs } from "@/lib/defaultTemplateBriefs";
import { zipTemplates } from "@/lib/zipTemplates";

export async function POST(req) {
  const { briefs = [], save = false, useDefaults = false, zip = false } = await req.json();
  const sourceBriefs =
    (Array.isArray(briefs) && briefs.length
      ? briefs
      : useDefaults
        ? defaultTemplateBriefs
        : []);
  if (!sourceBriefs.length) {
    return Response.json({ error: "briefs array is required (or set useDefaults=true)" }, { status: 400 });
  }

  const limited = sourceBriefs.slice(0, 100);
  const results = [];
  const generatedTemplates = [];
  for (const brief of limited) {
    try {
      const blueprint = await assembleTemplate({
        prompt: brief.prompt || "Generate a template",
        styleId: brief.styleId,
        componentId: brief.componentId,
        brand: brief.brand || null,
        imageUrl: brief.imageUrl || null,
        category: brief.category || null,
      });
      const tpl = convertBlueprintToDroppleTemplate(blueprint || {});
      const template = {
        ...tpl,
        category: brief.category || tpl.category || "",
        tags: brief.tags || tpl.tags || [],
        assets: normalizeAssets(tpl.assets || tpl.images || []),
      };
      const { valid, errors } = validateDroppleTemplate(template);
      if (!valid) {
        results.push({ ok: false, error: "Validation failed", details: errors, brief });
        continue;
      }
      if (save) {
        try {
          await convexClient.mutation(api.templates.createTemplate, {
            name: template.name || "AI Template",
            mode: template.mode || "uiux",
            description: template.description || "",
            category: template.category || "",
            tags: template.tags || [],
            styles: template.styleId ? [template.styleId] : [],
            formats: [],
            templateData: template,
            width: template.width,
            height: template.height,
            thumbnail: template.thumbnail || "",
            thumbnailUrl: template.thumbnail || "",
            pageTransitions: template.pageTransitions || null,
            animation: template.motionThemeId ? { hasMotion: true, motionTheme: template.motionThemeId } : undefined,
            isPublished: false,
            price: template.price,
            license: template.license || "free",
          });
        } catch (err) {
          results.push({ ok: false, error: err?.message || "Save failed", brief });
          continue;
        }
      }
      generatedTemplates.push(template);
      results.push({ ok: true, template });
    } catch (err) {
      results.push({ ok: false, error: err?.message || "Generation failed", brief });
    }
  }
  if (zip) {
    const zipBuf = await zipTemplates(generatedTemplates);
    return new Response(zipBuf, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": "attachment; filename=dropple-templates.zip",
      },
    });
  }
  return Response.json({ count: results.length, results, templates: zip ? undefined : generatedTemplates });
}
