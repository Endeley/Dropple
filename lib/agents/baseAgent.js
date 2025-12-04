import OpenAI from "openai";

const client =
  process.env.OPENAI_API_KEY || process.env.OPENAI_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY })
    : null;

export async function runAgent({ name, rolePrompt, input, bus }) {
  bus?.send?.(name, "Starting analysis…");

  if (!client) {
    bus?.send?.(name, "Skipped: Missing OpenAI API key.");
    return {};
  }

  const ai = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: rolePrompt,
      },
      {
        role: "user",
        content: JSON.stringify(input ?? {}),
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.4,
  });

  const result = JSON.parse(ai.choices?.[0]?.message?.content || "{}");

  bus?.send?.(name, "Completed tasks successfully.");

  return result;
}
