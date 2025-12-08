"use server";

import OpenAI from "openai";

const client =
  process.env.OPENAI_API_KEY || process.env.OPENAI_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY })
    : null;

export async function POST(req) {
  if (!client) {
    return Response.json({ error: "OpenAI key missing" }, { status: 500 });
  }

  const { prompt } = await req.json();
  if (!prompt || typeof prompt !== "string") {
    return Response.json({ error: "Prompt is required" }, { status: 400 });
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are Dropple's Component Generator AI.
Respond ONLY with valid JSON matching this schema (CE-1 compatible, motion-ready):
{
  "name": "Component Name",
  "metadata": { "description": "...", "category": "interaction|layout|nav|form", "tags": [] },
  "tokens": { "color": "brand.primary", "radius": "md", "spacing": "md", "font": "body.bold" },
  "slots": [ { "id": "label", "type": "text", "default": "Label" }, { "id": "icon", "type": "icon", "optional": true } ],
  "nodes": [
    { "id": "node1", "type": "frame|rect|text|image|icon", "x": 0, "y": 0, "width": 100, "height": 40, "layout": { "direction": "row", "padding": 12, "gap": 8, "align": "center", "justify": "center" }, "style": { "fill": "{color}", "radius": "{radius}" }, "props": {}, "children": [], "slotId": "label|icon", "animations": [] }
  ],
  "animations": [
    {
      "id": "anim_node1",
      "nodeId": "node1",
      "variants": {
        "initial": { "opacity": 1, "scale": 1 },
        "animate": { "opacity": 1, "scale": 1, "transition": { "duration": 0.3, "ease": "easeOut" } },
        "hover": { "scale": 1.03 },
        "tap": { "scale": 0.97 }
      },
      "triggers": ["onHover", "onClick"]
    }
  ],
  "variants": [
    {
      "id": "default",
      "name": "default",
      "layers": [],
      "animations": []
    }
  ]
}
Rules:
- Return ONLY valid JSON (no prose/backticks).
- Provide numeric x,y,width,height for every node.
- Include default + hover/tap variants/animations for interactive components when appropriate.
- Animations: use variants (initial/animate/hover/tap/exit/inView), triggers, optional scroll {inputRange,outputRange}, optional tracks [{property,keyframes[{time,value,easing?,duration?}]}] for looping/float.
- Keep layout compact and balanced; nested children allowed.
- Do not include comments or prose.
`,
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const message = completion.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(message);

    return Response.json({ component: parsed });
  } catch (err) {
    console.error("Component AI generation failed", err);
    return Response.json({ error: "Generation failed" }, { status: 500 });
  }
}
