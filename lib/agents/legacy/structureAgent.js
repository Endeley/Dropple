import OpenAI from "openai";

const client =
  process.env.OPENAI_API_KEY || process.env.OPENAI_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY })
    : null;

export async function runStructureAI(prompt) {
  if (!client) {
    return {
      pages: [
        { id: "home", name: "Home", children: ["login", "signup"] },
        { id: "login", name: "Login", children: [] },
        { id: "dashboard", name: "Dashboard", children: ["analytics", "settings"] },
      ],
    };
  }

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
Create the UX structure for an entire product.
Output JSON:
{
  "pages": [
    { "id": "home", "name": "Home", "children": ["login", "signup"] }
  ]
}
Only JSON.`,
      },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.4,
  });

  return JSON.parse(res.choices?.[0]?.message?.content || "{}");
}
