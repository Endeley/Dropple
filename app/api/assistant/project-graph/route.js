"use server";

import { analyzeMotion } from "@/engine/motion/motionRefiner";

export async function POST(req) {
  try {
    const body = await req.json();
    const template = body?.template || {};
    const pages = body?.pages || [];
    const components = body?.components || [];

    const layers = template.layers || (pages[0]?.layers || []);
    const analysis = analyzeMotion({ layers });

    const stats = {
      pageCount: pages.length || 1,
      layerCount: layers.length,
      componentCount: components.length,
      hasAnimations: layers.some((l) => l.animations?.length),
      hasScroll: layers.some((l) => l.animations?.some((a) => a.scroll)),
    };

    const suggestions = [];
    if (!stats.hasAnimations) suggestions.push("Add motion presets to bring the layout to life.");
    if (analysis?.issues?.includes("Easing curves are inconsistent")) suggestions.push("Unify easing curves for a cohesive feel.");
    if (analysis?.issues?.includes("Durations feel uneven")) suggestions.push("Normalize animation durations for smoother pacing.");
    if (analysis?.issues?.includes("Motion distances vary widely")) suggestions.push("Align motion distances for consistent reveals.");
    if (!layers.some((l) => l.type === "component-instance")) suggestions.push("Insert a reusable component (button/card/nav) to speed up layout.");
    if (stats.pageCount < 2) suggestions.push("Add another page or state to build a multi-screen flow.");
    if (!layers.some((l) => l.type === "text" && (l.content || "").toLowerCase().includes("cta"))) {
      suggestions.push("Add a clear CTA in the hero/primary section.");
    }

    return Response.json({ analysis, stats, suggestions });
  } catch (err) {
    console.error("Project graph analysis failed", err);
    return Response.json({ error: "Failed to analyze project" }, { status: 500 });
  }
}
