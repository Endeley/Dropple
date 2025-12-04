"use server";

import OpenAI from "openai";
import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

const openai =
  process.env.OPENAI_API_KEY || process.env.OPENAI_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY })
    : null;

const TYPE_SIZE_MAP = {
  icon: "512x512",
  illustration: "1024x1024",
  photo: "1024x1024",
  background: "1024x1024",
  texture: "1024x1024",
  "3d": "1024x1024",
};

export async function POST(req) {
  if (!openai) {
    return Response.json({ error: "Missing OpenAI API key" }, { status: 500 });
  }

  const { prompt, type = "icon" } = await req.json();
  if (!prompt || typeof prompt !== "string") {
    return Response.json({ error: "Prompt is required" }, { status: 400 });
  }

  const size = TYPE_SIZE_MAP[type] || "1024x1024";

  try {
    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size,
      response_format: "b64_json",
    });

    const base64 = result.data?.[0]?.b64_json;
    if (!base64) throw new Error("No image returned");

    const buffer = Buffer.from(base64, "base64");
    const fileName = `ai-${type}-${Date.now()}.png`;

    // Store via Convex action -> storage
    const uploadRes = await convexClient.action(api.assets.uploadImage, {
      file: {
        name: fileName,
        type: "image/png",
        size: buffer.length,
        data: buffer,
      },
    });

    // Save to asset library for reuse
    try {
      await convexClient.mutation(api.assets.createLibraryAsset, {
        type,
        title: prompt.slice(0, 64),
        description: prompt,
        tags: [],
        fileUrl: uploadRes.url,
        previewUrl: uploadRes.url,
        fileType: "image/png",
        size: buffer.length,
        width: Number(size.split("x")[0]),
        height: Number(size.split("x")[1]),
        isPremium: false,
        price: 0,
      });
    } catch (err) {
      console.error("Failed to save generated asset to library", err);
    }

    return Response.json({
      url: uploadRes.url,
      assetId: uploadRes.assetId,
      type,
      size,
      prompt,
    });
  } catch (err) {
    console.error("Asset AI generation failed", err);
    return Response.json({ error: "Generation failed" }, { status: 500 });
  }
}
