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

  const { designMap } = await req.json();
  if (!designMap) {
    return Response.json({ error: "designMap is required" }, { status: 400 });
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are Dropple's Design Critic AI.
Analyze the numeric layout metadata and return JSON ONLY.

Schema:
{
  "issues": [
    {
      "id": "layer123",
      "problem": "misaligned|inconsistent_spacing|color_issue|typography_issue|radius_inconsistent|hierarchy",
      "details": "description",
      "suggestion": "actionable suggestion",
      "fix": { "x": 120, "y": 80, "width": 320, "height": 120, "props": { "fontSize": 20, "color": "#111" } }
    }
  ],
  "scores": {
    "layout": 80,
    "spacing": 75,
    "contrast": 82,
    "hierarchy": 78,
    "aesthetic": 80
  }
}
        `,
        },
        { role: "user", content: JSON.stringify(designMap) },
      ],
      response_format: { type: "json_object" },
      temperature: 0,
    });

    const message = completion.choices?.[0]?.message?.content || "{}";
    const result = JSON.parse(message);
    return Response.json(result);
  } catch (err) {
    console.error("Design critic failed", err);
    return Response.json({ error: "Analysis failed" }, { status: 500 });
  }
}
