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

  const { screens } = await req.json();
  if (!screens) {
    return Response.json({ error: "screens payload required" }, { status: 400 });
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are Dropple's Interactive Prototype AI.
Given a list of screens and layers, infer navigation flows and interactive elements.
Respond with JSON only matching:
{
  "flows": [
    {
      "triggerLayerId": "btn_login",
      "action": "navigate",
      "targetScreenId": "screen_login",
      "transition": { "type": "fade|slideLeft|slideUp|smart-animate", "duration": 600 }
    }
  ],
  "microInteractions": [
    { "layerId": "btn_login", "interaction": "tapBounce" }
  ],
  "flowMap": [
    { "from": "screen_home", "to": "screen_login" }
  ]
}
          `,
        },
        {
          role: "user",
          content: JSON.stringify(screens),
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const message = completion.choices?.[0]?.message?.content || "{}";
    const blueprint = JSON.parse(message);
    return Response.json({ blueprint });
  } catch (err) {
    console.error("Prototype AI failed", err);
    return Response.json({ error: "Generation failed" }, { status: 500 });
  }
}
