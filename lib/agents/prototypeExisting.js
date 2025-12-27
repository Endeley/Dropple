import OpenAI from "openai";

const client =
  process.env.OPENAI_API_KEY || process.env.OPENAI_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY })
    : null;

export async function runPrototypeAI(ui) {
  if (!client) {
    return { flows: [], microInteractions: [], flowMap: [] };
  }

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
Infer prototype flows from UI pages.
Return JSON:
{
  "flows": [],
  "microInteractions": [],
  "flowMap": []
}
Only JSON.`,
      },
      { role: "user", content: JSON.stringify(ui || {}) },
    ],
    response_format: { type: "json_object" },
    temperature: 0.4,
  });

  return JSON.parse(res.choices?.[0]?.message?.content || "{}");
}
