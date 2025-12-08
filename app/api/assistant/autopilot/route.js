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

  try {
    const body = await req.json();
    const { goal = "SaaS homepage", style = "modern minimal", motion = "smooth", width = 1440, height = 1024 } = body || {};
    const prompt = `You are an AI Template Designer inside Dropple. Build a complete page for: ${goal}.
Style: ${style}. Motion style: ${motion}. Include nodes, images, and animations. Include pageTransitions default.
Return JSON only matching Dropple template schema (name, description, width, height, background, colors, fonts, nodes, images, animations, pageTransitions).`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Return only valid JSON template object." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
      max_tokens: 1200,
    });

    const json = completion.choices?.[0]?.message?.content || "{}";
    const template = JSON.parse(json);
    // Ensure dimensions fallback
    template.width = template.width || width;
    template.height = template.height || height;

    return Response.json({ template });
  } catch (err) {
    console.error("Autopilot generation failed", err);
    return Response.json({ error: "Autopilot failed" }, { status: 500 });
  }
}
