"use server";

import OpenAI from "openai";

const client =
  process.env.OPENAI_API_KEY || process.env.OPENAI_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY })
    : null;

const SYSTEM_PROMPT = `You are Dropple's Material UI Generator. Return ONLY valid JSON. No prose, no backticks.
Generate a Material Design 3 design system with tokens, motion, and a small component library (buttons/cards/nav) in CE-1 compatible shape.

Schema:
{
  "tokens": {
    "colors": {
      "primary": "#6750A4",
      "onPrimary": "#FFFFFF",
      "primaryContainer": "#EADDFF",
      "onPrimaryContainer": "#21005D",
      "secondary": "#625B71",
      "onSecondary": "#FFFFFF",
      "background": "#FFFBFE",
      "onBackground": "#1C1B1F",
      "surface": "#FFFBFE",
      "onSurface": "#1C1B1F",
      "surfaceVariant": "#E7E0EC",
      "onSurfaceVariant": "#49454F"
    },
    "typography": {
      "displayLarge": { "fontSize": 57, "lineHeight": 64, "weight": 400 },
      "headlineLarge": { "fontSize": 32, "lineHeight": 40, "weight": 700 },
      "titleMedium": { "fontSize": 16, "lineHeight": 24, "weight": 600 },
      "labelLarge": { "fontSize": 14, "lineHeight": 20, "weight": 600 },
      "bodyMedium": { "fontSize": 14, "lineHeight": 20, "weight": 400 }
    },
    "spacing": { "xs": 4, "sm": 8, "md": 16, "lg": 24, "xl": 32 },
    "radius": { "none": 0, "xs": 4, "sm": 8, "md": 12, "lg": 16, "xl": 28 },
    "elevation": {
      "level0": "none",
      "level1": "rgba(0,0,0,0.05)",
      "level2": "rgba(0,0,0,0.08)",
      "level3": "rgba(0,0,0,0.11)",
      "level4": "rgba(0,0,0,0.14)"
    },
    "motion": {
      "easing": {
        "standard": "cubic-bezier(0.2, 0, 0, 1)",
        "accelerate": "cubic-bezier(0.3, 0, 1, 1)",
        "decelerate": "cubic-bezier(0, 0, 0, 1)"
      },
      "durations": { "fast": 120, "base": 240, "slow": 400 }
    }
  },
  "components": [
    // CE-1 component objects (buttons/cards/nav) with tokens and motion variants
  ],
  "icons": [
    // optional icon objects matching CE-3 shape (paths + viewBox)
  ],
  "pageTransitions": { "default": { "type": "fade", "duration": 0.6, "ease": "easeOut" } }
}

Rules:
- Use Material 3 semantics (filled/tonal/outlined buttons, elevation, radius scale).
- Components must include layout, style, tokens, variants, and motion (hover/tap).
- Keep output concise but complete; JSON only.`;

export async function POST(req) {
  if (!client) {
    return Response.json({ error: "Missing OpenAI API key" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { prompt = "Generate a Material 3 UI kit based on #6750A4" } = body || {};

    const userPrompt = `Material UI request: ${prompt}`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 2200,
    });

    const json = completion.choices?.[0]?.message?.content || "{}";
    const payload = JSON.parse(json);
    return Response.json({ material: payload });
  } catch (err) {
    console.error("Material generation failed", err);
    return Response.json({ error: "Material generation failed" }, { status: 500 });
  }
}
