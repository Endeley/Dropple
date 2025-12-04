import OpenAI from "openai";

const client =
  process.env.OPENAI_API_KEY || process.env.OPENAI_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY })
    : null;

export async function runAnimationAI(ui) {
  if (!client) {
    return { animations: [] };
  }

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
Generate animation suggestions for the UI.
Return JSON:
{
  "animations": []
}
Only JSON.`,
      },
      { role: "user", content: JSON.stringify(ui || {}) },
    ],
    response_format: { type: "json_object" },
    temperature: 0.5,
  });

  return JSON.parse(res.choices?.[0]?.message?.content || "{}");
}
