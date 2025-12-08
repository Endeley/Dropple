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
    const { brandVoice = "professional", context = "", maxTokens = 120 } = body || {};
    if (!context || typeof context !== "string") {
      return Response.json({ error: "context is required" }, { status: 400 });
    }

    const prompt = `You are a UI/UX copywriter. Brand voice: ${brandVoice}. Write concise, clear copy for this section:
Context: ${context}
Return 2-3 short options. Keep CTA lines punchy. No markdown, just plain text blocks separated by \n---\n.`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Return concise UI copy only." },
        { role: "user", content: prompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    });

    const text = completion.choices?.[0]?.message?.content || "";
    return Response.json({ copy: text });
  } catch (err) {
    console.error("Copy generation failed", err);
    return Response.json({ error: "Failed to generate copy" }, { status: 500 });
  }
}
