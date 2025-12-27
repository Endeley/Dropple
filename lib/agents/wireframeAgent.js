import OpenAI from "openai";

const client =
  process.env.OPENAI_API_KEY || process.env.OPENAI_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY })
    : null;

export async function runWireframeAI(structure) {
  if (!client) {
    return {
      wireframes: (structure.pages || []).map((p) => ({
        pageId: p.id,
        sections: [{ type: "navbar" }, { type: "hero" }, { type: "cards", count: 3 }],
      })),
    };
  }

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
For each page, produce low-fidelity wireframe layout JSON:
{
  "wireframes": [
    {
      "pageId": "dashboard",
      "sections": [ {"type": "navbar"}, {"type": "hero"}, {"type": "cards", "count": 3}, {"type": "cta"} ]
    }
  ]
}
Only JSON.`,
      },
      { role: "user", content: JSON.stringify(structure || {}) },
    ],
    response_format: { type: "json_object" },
    temperature: 0.5,
  });

  return JSON.parse(res.choices?.[0]?.message?.content || "{}");
}
