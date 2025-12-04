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

  const { name, description, industry } = await req.json();

  if (!name || !description) {
    return Response.json({ error: "Name and description are required" }, { status: 400 });
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are Dropple's Brand Identity AI.

Generate a full BRAND IDENTITY BLUEPRINT in JSON format.

Schema:
{
  "name": "Brand Name",
  "tagline": "Short tagline",
  "brandPersonality": ["modern", "friendly"],
  "colorPalette": {
    "primary": ["#...", "#..."],
    "secondary": ["#...", "#..."],
    "neutral": ["#...", "#..."],
    "semantic": {
      "success": "#22c55e",
      "warning": "#f59e0b",
      "danger": "#ef4444"
    }
  },
  "typography": {
    "headingFont": "Inter",
    "bodyFont": "General Sans",
    "accentFont": "Poppins"
  },
  "logoConcepts": [
    { "style": "minimal", "description": "Clean geometric lettermark" },
    { "style": "symbolic", "description": "Abstract symbol representing the business" }
  ],
  "patterns": ["geometric", "wave", "dot-grid"],
  "uiComponents": ["button", "navbar", "card", "hero", "footer", "pricing"]
}

Only output valid JSON.
          `,
        },
        {
          role: "user",
          content: `Brand name: ${name}\nDescription: ${description}\nIndustry: ${industry || "general"}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
    });

    const message = completion.choices?.[0]?.message?.content || "{}";
    const blueprint = JSON.parse(message);

    return Response.json({ blueprint });
  } catch (err) {
    console.error("Brandkit AI generation failed", err);
    return Response.json({ error: "Generation failed" }, { status: 500 });
  }
}
