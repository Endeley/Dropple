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
You are the Dropple Template AI.
Convert user prompts into a structured TEMPLATE BLUEPRINT using only JSON.
Follow this schema strictly:
{
  "name": "Template Name",
  "description": "Short summary",
  "sections": [
    {
      "name": "Hero Section",
      "type": "frame",
      "layout": { "direction": "vertical", "gap": 20, "padding": 40, "alignment": "center" },
      "components": [
        { "type": "text", "role": "heading", "content": "Amazing Product" },
        { "type": "text", "role": "subheading", "content": "The easiest way to do X." },
        { "type": "button", "variant": "primary", "props": { "text": "Get Started" } }
      ]
    }
  ]
}
Do NOT output anything except valid JSON.
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
    console.error("Template AI generation failed", err);
    return Response.json({ error: "Generation failed" }, { status: 500 });
  }
}
