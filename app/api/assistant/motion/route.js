"use server";

import OpenAI from "openai";

const client =
  process.env.OPENAI_API_KEY || process.env.OPENAI_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY })
    : null;

const SYSTEM_PROMPT = `You are Dropple's Motion Variant Generator. Return ONLY valid JSON, no prose.
Generate motion variants for a component (hover/tap/active/disabled/scroll) compatible with Framer Motion style variants.
Schema:
{
  "variants": {
    "default": { "opacity": 1, "y": 0 },
    "hover": { "scale": 1.03, "transition": { "duration": 0.25, "ease": "easeOut" } },
    "pressed": { "scale": 0.96, "transition": { "duration": 0.15, "ease": "easeIn" } },
    "active": { "opacity": 1, "y": -4 },
    "disabled": { "opacity": 0.4 }
  },
  "triggers": ["onHover", "onClick"],
  "scroll": {
    "inputRange": [0, 300],
    "outputRange": { "y": [0, -20], "opacity": [1, 0.8] }
  },
  "physics": { "type": "spring", "stiffness": 240, "damping": 20, "mass": 1 },
  "gesture": { "drag": "x", "dragConstraints": { "left": -40, "right": 40 } }
}
Rules:
- Include variants for default + hover + pressed when interactive.
- Use transitions with duration/ease or spring (stiffness/damping/mass).
- If style asks for 3d, include rotateX/rotateY and optional perspective.
- If scroll is requested, include scroll block.
- Return JSON only.`;

export async function POST(req) {
  if (!client) {
    return Response.json({ error: "Missing OpenAI API key" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { prompt = "Generate hover/tap motion for a primary button, smooth and soft", style = "smooth" } = body || {};

    const userPrompt = `Component motion request: ${prompt}. Style: ${style}.`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.45,
      max_tokens: 1000,
    });

    const json = completion.choices?.[0]?.message?.content || "{}";
    const payload = JSON.parse(json);
    return Response.json({ motion: payload });
  } catch (err) {
    console.error("Motion generation failed", err);
    return Response.json({ error: "Motion generation failed" }, { status: 500 });
  }
}
