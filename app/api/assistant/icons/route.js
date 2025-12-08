"use server";

import OpenAI from "openai";

const client =
  process.env.OPENAI_API_KEY || process.env.OPENAI_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY })
    : null;

const ICON_SYSTEM_PROMPT = `
You are Dropple's Icon Generator AI. Return ONLY valid JSON, no prose or backticks.
Generate SVG-like path data for icons in a consistent viewBox (default 24 or 48).
Supported styles: outline, solid, duotone, bold, glyph, 3d, pixel, animated.
For animated icons, include motion definitions compatible with Framer Motion variants.

Schema for single icon:
{
  "id": "icon_id",
  "name": "Search",
  "style": "outline|solid|duotone|bold|3d|animated",
  "viewBox": "0 0 24 24",
  "paths": [
    { "id": "p1", "d": "...", "stroke": "#000", "strokeWidth": 2, "fill": "none" }
  ],
  "defs": { "gradients": [] },
  "motion": {
    "variants": {
      "initial": { "opacity": 1 },
      "animate": { "opacity": 1, "transition": { "duration": 0.4 } },
      "hover": { "scale": 1.05 },
      "tap": { "scale": 0.95 }
    },
    "triggers": ["onHover", "onClick"]
  }
}

Schema for icon set:
{
  "setId": "set_crypto_outline_50",
  "style": "outline",
  "viewBox": "0 0 24 24",
  "count": 50,
  "icons": [ ... single icons ... ]
}

Rules:
- Always include viewBox.
- paths: use d strings; include stroke/fill/strokeWidth as needed by style.
- For duotone: include multiple paths with different opacity/fill.
- For 3d: include gradients in defs if needed.
- For animated: include motion.variants and triggers.
- Return JSON only.
`;

export async function POST(req) {
  if (!client) {
    return Response.json({ error: "Missing OpenAI API key" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const {
      prompt = "Generate a search icon in outline style",
      style = "outline",
      setCount = 1,
      viewBox = "0 0 24 24",
    } = body || {};

    const userPrompt = `
Request: ${prompt}
Style: ${style}
Count: ${setCount}
ViewBox: ${viewBox}
If count > 1, return a set object; otherwise, return a single icon object.`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: ICON_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 1800,
    });

    const json = completion.choices?.[0]?.message?.content || "{}";
    const payload = JSON.parse(json);
    return Response.json({ icon: payload });
  } catch (err) {
    console.error("Icon generation failed", err);
    return Response.json({ error: "Icon generation failed" }, { status: 500 });
  }
}
