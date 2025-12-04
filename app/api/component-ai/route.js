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
Respond ONLY with valid JSON matching this schema:
{
  "name": "Component Name",
  "props": { "propName": "value" },
  "layers": [ { "type": "frame|rect|text|image|icon", "x": 0, "y": 0, "width": 100, "height": 40, "style": {}, "children": [] } ],
  "variants": [
    { "name": "hover", "layers": [ ... ], "props": { ... } }
  ]
}
Keep layout numeric values, avoid undefined. Use nested children for hierarchy. Do not include comments or prose.
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
