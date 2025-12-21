import OpenAI from "openai";
import { buildBrandKit } from "@/lib/buildBrandKit";

const client =
  process.env.OPENAI_API_KEY || process.env.OPENAI_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY })
    : null;

export async function runBrandKitAI(prompt) {
  if (!client) {
    // fallback minimal brand kit if no API key
    return buildBrandKit(
      {
        name: prompt?.slice(0, 32) || "Brand",
        tagline: "",
        colorPalette: {
          primary: ["#2563eb", "#1d4ed8"],
          secondary: ["#9333ea", "#7e22ce"],
          neutral: ["#f8fafc", "#0f172a"],
          semantic: {
            success: "#22c55e",
            warning: "#f59e0b",
            danger: "#ef4444",
          },
        },
        typography: {
          headingFont: "Inter",
          bodyFont: "Inter",
          accentFont: "Inter",
        },
        brandPersonality: ["modern", "clean"],
        logoConcepts: [],
        patterns: [],
        uiComponents: ["button", "card", "navbar"],
      },
      [],
      [],
    );
  }

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
Generate a BRAND IDENTITY BLUEPRINT in JSON:
{
  "name": "Brand",
  "tagline": "short",
  "brandPersonality": [],
  "colorPalette": {
    "primary": ["#...", "#..."],
    "secondary": ["#...", "#..."],
    "neutral": ["#...", "#..."],
    "semantic": { "success": "#", "warning": "#", "danger": "#" }
  },
  "typography": {
    "headingFont": "Inter",
    "bodyFont": "General Sans",
    "accentFont": "Poppins"
  },
  "logoConcepts": [],
  "patterns": [],
  "uiComponents": []
}
Only JSON.`,
      },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.5,
  });

  const blueprint = JSON.parse(res.choices?.[0]?.message?.content || "{}");
  return buildBrandKit(blueprint, [], blueprint.patterns || []);
}
