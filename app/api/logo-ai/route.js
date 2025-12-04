"use server";

import OpenAI from "openai";
import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

const client =
  process.env.OPENAI_API_KEY || process.env.OPENAI_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY })
    : null;

export async function POST(req) {
  if (!client) {
    return Response.json({ error: "Missing OpenAI API key" }, { status: 500 });
  }

  const { concept, name } = await req.json();
  if (!concept || !name) {
    return Response.json({ error: "Missing concept or name" }, { status: 400 });
  }

  const prompt = `
Logo for brand "${name}".
Style: ${concept.style || "minimal"}.
Details: ${concept.description || ""}.
Flat vector, clean, transparent background, high contrast.
`;

  try {
    const result = await client.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
      response_format: "b64_json",
    });

    const base64 = result.data?.[0]?.b64_json;
    if (!base64) throw new Error("No image returned");

    const buffer = Buffer.from(base64, "base64");
    const uploadRes = await convexClient.action(api.assets.uploadImage, {
      file: {
        name: `logo-${Date.now()}.png`,
        type: "image/png",
        size: buffer.length,
        data: buffer,
      },
    });

    return Response.json({ url: uploadRes.url, assetId: uploadRes.assetId });
  } catch (err) {
    console.error("Logo generation failed", err);
    return Response.json({ error: "Generation failed" }, { status: 500 });
  }
}
