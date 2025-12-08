"use server";

import { analyzeMotion } from "@/lib/motionRefiner";

function ruleBasedSuggestions(template = {}) {
  const layers = template.layers || [];
  const hasCTA = layers.some(
    (l) => l.type === "text" && typeof l.content === "string" && /cta|call to action|get started|sign up|buy/i.test(l.content),
  );
  const hasNav = layers.some((l) => l.name && /nav|navbar|header/i.test(l.name));
  const hasFooter = layers.some((l) => l.name && /footer/i.test(l.name));
  const twoCardRow = layers.some((l) => (l.children || []).length === 2);
  const motionAnalysis = analyzeMotion({ layers });
  const issues = motionAnalysis?.issues || [];

  const suggestions = [];
  if (!hasCTA) suggestions.push("Add a clear CTA to guide users (e.g., Get Started).");
  if (!hasNav) suggestions.push("Add a navigation/header for discoverability.");
  if (!hasFooter) suggestions.push("Add a footer with links/social/legal for completeness.");
  if (twoCardRow) suggestions.push("Balance the grid: add a third item for symmetry or switch to a 2-column layout.");
  if (issues.includes("Easing curves are inconsistent")) suggestions.push("Unify easing curves for cohesion.");
  if (issues.includes("Durations feel uneven")) suggestions.push("Normalize animation durations for smoother pacing.");
  if (issues.includes("Motion distances vary widely")) suggestions.push("Align motion distances for consistent reveals.");
  if (!layers.some((l) => l.animations?.length)) suggestions.push("Apply motion presets to key sections for liveliness.");

  return { suggestions, motionAnalysis };
}

export async function POST(req) {
  try {
    const body = await req.json();
    const template = body?.template || {};
    const mode = body?.mode || "rules";
    const prompt = body?.prompt || "";

    // For now, hybrid = rules + optional AI stub; AI generation can be added later.
    const { suggestions, motionAnalysis } = ruleBasedSuggestions(template);

    // If higher-level prompt requested, include a placeholder for AI extension.
    if (mode === "ai" && prompt) {
      suggestions.push("AI: This endpoint can be extended to call LLM for advanced suggestions.");
    }

    return Response.json({ suggestions, motionAnalysis });
  } catch (err) {
    console.error("Suggestion engine failed", err);
    return Response.json({ error: "Failed to build suggestions" }, { status: 500 });
  }
}
