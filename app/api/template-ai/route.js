"use server";

import OpenAI from "openai";

const client =
  process.env.OPENAI_API_KEY || process.env.OPENAI_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY })
    : null;

export async function POST(req) {
  if (!client) {
    return Response.json({ error: "Missing OpenAI API key" }, { status: 500 });
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
You are an AI Template Designer inside Dropple.
Generate a complete template JSON, editable in Dropple, following this exact shape:
{
  "name": "Template Name",
  "description": "Short summary",
  "width": 1080,
  "height": 1350,
  "background": "#ffffff",
  "colors": ["#000000", "#ffffff", "#FF6B00"],
  "fonts": ["Inter", "Poppins"],
  "nodes": [
    { "id": "text1", "type": "text", "content": "Heading", "x": 120, "y": 140, "width": 840, "height": 120, "fontSize": 72, "fontWeight": 700, "color": "#000000" },
    { "id": "image1", "type": "image", "imageId": "img1", "x": 0, "y": 0, "width": 1080, "height": 600, "fit": "cover" },
    { "id": "shape1", "type": "shape", "shape": "rectangle", "x": 120, "y": 920, "width": 840, "height": 240, "fill": "#FF6B00", "radius": 24 }
  ],
  "images": [
    { "id": "img1", "prompt": "background photo of..." }
  ]
}
Rules:
- Return JSON only (no backticks, no text).
- Make layout balanced and editable: positions (x,y), sizes (width,height) required for every node.
- Use colors and fonts that match the requested style.
- Provide 1-3 image prompts in the images array.
- Types allowed: text (with content/fontSize/fontWeight/color), image (with imageId/fit), shape (rectangle/ellipse/line with fill/radius).
Respond with a single JSON object only.
          `,
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
    });

    const message = completion.choices?.[0]?.message?.content || "{}";
    const blueprint = JSON.parse(message);

    return Response.json({ blueprint });
  } catch (err) {
    const status = err?.status || err?.code === "insufficient_quota" ? 429 : 500;
    const msg =
      err?.code === "insufficient_quota"
        ? "AI quota exceeded. Please check your plan/billing."
        : "Generation failed";
    console.error("Template AI generation failed", err);
    return Response.json({ error: msg }, { status });
  }
}
