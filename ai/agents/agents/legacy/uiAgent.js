import OpenAI from "openai";

const client =
  process.env.OPENAI_API_KEY || process.env.OPENAI_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY })
    : null;

export async function runUIAI(wireframes, brand) {
  if (!client) {
    return {
      pages: (wireframes.wireframes || []).map((wf) => ({
        id: wf.pageId,
        name: wf.pageId,
        layers: [],
      })),
    };
  }

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
Convert wireframes to UI using the brand kit.
Return JSON:
{
  "pages": [
    { "id": "dashboard", "name": "Dashboard", "layers": [] }
  ]
}
Only JSON.`,
      },
      {
        role: "user",
        content: JSON.stringify({ wireframes, brand }),
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.6,
  });

  return JSON.parse(res.choices?.[0]?.message?.content || "{}");
}
