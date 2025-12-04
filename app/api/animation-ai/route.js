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
You are the Dropple Animation Generator AI.
Convert the user's prompt into a structured ANIMATION BLUEPRINT JSON.
DO NOT output anything but valid JSON.

BLUEPRINT SCHEMA:
{
  "trigger": "onLoad" | "onClick" | "onHover" | "onScroll",
  "duration": number,
  "delay": number,
  "stagger": number,
  "steps": [
    {
      "property": "opacity" | "x" | "y" | "scale" | "rotate" | "color" | "blur",
      "from": number,
      "to": number,
      "timeStart": number,
      "timeEnd": number,
      "easing": "ease-in-out" | "ease-out" | "ease-in" | "linear" | "spring" | "cubic-bezier(...)"
    }
  ]
}
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
    console.error("Animation AI generation failed", err);
    return Response.json({ error: "Generation failed" }, { status: 500 });
  }
}
