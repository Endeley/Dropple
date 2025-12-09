"use server";

import OpenAI from "openai";
import { buildStylePrompt, templateStyleMap } from "@/lib/templateStyles";
import { buildComponentPrompt, templateComponentPresetMap } from "@/lib/templateComponents";
import { assembleTemplate } from "@/lib/templateAssembler";

const client =
  process.env.OPENAI_API_KEY || process.env.OPENAI_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY })
    : null;

export async function POST(req) {
  if (!client) {
    return Response.json({ error: "Missing OpenAI API key" }, { status: 500 });
  }

  const { prompt, styleId, componentId, assembly = false, brand = null, imageUrl = null } = await req.json();
  if (!prompt || typeof prompt !== "string") {
    return Response.json({ error: "Prompt is required" }, { status: 400 });
  }
  const styleHint = styleId && templateStyleMap[styleId] ? buildStylePrompt(styleId) : "";
  const layoutHint = componentId && templateComponentPresetMap[componentId] ? buildComponentPrompt(componentId) : "";

  if (assembly) {
    try {
      const blueprint = await assembleTemplate({ prompt, styleId, componentId, brand, imageUrl });
      return Response.json({ blueprint });
    } catch (err) {
      console.error("Assembly failed", err);
      // fallback to AI path below
    }
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are an AI Template Designer inside Dropple. Output a FULLY EDITABLE, MOTION-READY template JSON that the Dropple editor can hydrate without changes. Design it like a Framer Motion template: hero image with gradient/overlay, strong typography, CTA chips, and layered motion.

Follow EXACTLY this structure:
{
  "name": "Template Name",
  "description": "Short summary",
  "width": 1440,
  "height": 1024,
  "background": "linear-gradient(135deg, #0f172a, #111827)",
  "colors": ["#0f172a", "#ffffff", "#FF6B00", "#8B5CF6"],
  "fonts": ["Sora", "Inter", "Poppins"],
  "pageTransitions": {
    "default": { "type": "slide", "direction": "right", "duration": 0.6, "ease": "easeOut" }
  },
  "nodes": [
    { "id": "hero_image", "type": "image", "imageId": "img1", "x": 0, "y": 0, "width": 1440, "height": 780, "fit": "cover" },
    { "id": "overlay", "type": "shape", "shape": "rectangle", "x": 0, "y": 0, "width": 1440, "height": 780, "fill": "linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0.1))" },
    { "id": "badge", "type": "shape", "shape": "rectangle", "x": 120, "y": 140, "width": 156, "height": 42, "radius": 999, "fill": "rgba(255,255,255,0.18)" },
    { "id": "badge_text", "type": "text", "content": "New Collection", "x": 140, "y": 146, "width": 200, "height": 28, "fontSize": 16, "fontWeight": 600, "color": "#ffffff" },
    { "id": "headline", "type": "text", "content": "Transform your body.", "x": 120, "y": 210, "width": 880, "height": 180, "fontSize": 96, "fontWeight": 800, "color": "#ffffff" },
    { "id": "subhead", "type": "text", "content": "High-energy program with pro coaches and cinematic visuals.", "x": 120, "y": 370, "width": 720, "height": 90, "fontSize": 22, "fontWeight": 500, "color": "rgba(255,255,255,0.9)" },
    { "id": "cta", "type": "shape", "shape": "rectangle", "x": 120, "y": 480, "width": 210, "height": 64, "radius": 16, "fill": "linear-gradient(135deg, #FF6B00, #F97316)" },
    { "id": "cta_label", "type": "text", "content": "Start Now", "x": 146, "y": 500, "width": 160, "height": 30, "fontSize": 18, "fontWeight": 700, "color": "#ffffff" }
  ],
  "images": [
    { "id": "img1", "prompt": "cinematic fitness photography, dramatic lighting, energetic, action shot, vapor glow" }
  ],
  "animations": [
    {
      "id": "anim_parent",
      "nodeId": "overlay",
      "variants": {
        "initial": { "opacity": 0, "y": 24 },
        "animate": { "opacity": 1, "y": 0, "transition": { "duration": 0.7, "ease": "easeOut", "staggerChildren": 0.08 } },
        "exit": { "opacity": 0, "y": -16 }
      },
      "triggers": ["onLoad", "onView"],
      "playTimelineOnLoad": false
    },
    {
      "id": "anim_headline",
      "nodeId": "headline",
      "variants": {
        "initial": { "opacity": 0, "y": 26 },
        "animate": { "opacity": 1, "y": 0, "transition": { "duration": 0.65, "ease": "easeOut", "delay": 0.08 } },
        "hover": { "scale": 1.01 },
        "tap": { "scale": 0.99 }
      },
      "triggers": ["onLoad", "onHover", "onClick", "onView"]
    },
    {
      "id": "anim_image",
      "nodeId": "hero_image",
      "variants": {
        "initial": { "opacity": 0.9, "scale": 1.04 },
        "animate": { "opacity": 1, "scale": 1, "transition": { "duration": 0.9, "ease": "easeOut" } },
        "hover": { "scale": 1.02 },
        "tap": { "scale": 0.985 }
      },
      "scroll": {
        "inputRange": [0, 420],
        "outputRange": { "y": [0, -38], "opacity": [1, 0.92] }
      },
      "triggers": ["onLoad", "onHover", "onScroll"],
      "tracks": [
        { "property": "y", "keyframes": [ { "time": 0, "value": 0 }, { "time": 1200, "value": -8, "easing": "easeInOut" } ] }
      ],
      "playTimelineOnLoad": true,
      "timelineLoop": true,
      "timelineLoopCount": 0
    }
  ]
}

Hard requirements:
- Return VALID JSON ONLY (no prose, no backticks).
- Every node must include numeric x, y, width, height for layout.
- Must include: at least 1 image node + overlay text + CTA + gradient/shape layer for contrast. Use rich palettes and gradients (linear/radial) instead of flat fills.
- Use node types: "text" (content/fontSize/fontWeight/color/font optional), "image" (imageId/url/fit), "shape" (rectangle/ellipse/line with fill/radius).
- animations: array where each item targets a nodeId and includes "variants" (initial/animate/hover/tap/exit/inView as needed) plus "triggers". Include scroll effects when relevant. Optional "tracks" for looping/float effects (property, keyframes[{time,value,easing?,duration?}]). Use playTimelineOnLoad + timelineLoop when you include tracks. Encourage Framer-style staggering via transition.staggerChildren/delay.
- pageTransitions (optional): { "default": { "type": "slide|fade|scale|flip|push|overlay|timeline", "direction": "left|right|up|down", "duration": 0.6, "ease": "easeOut" } }
- Use colors/fonts that fit the requested style; keep spacing/hierarchy professional.
- images: 1-3 prompts, varied and specific to the category/style (avoid generic/duplicate prompts).
- Keep output compact but complete; avoid nulls/undefined.
          `,
        },
        {
          role: "user",
          content: [prompt, styleHint, layoutHint].filter(Boolean).join("\n\n"),
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
    });

    const message = completion.choices?.[0]?.message?.content || "{}";
    let blueprint = {};
    try {
      blueprint = JSON.parse(message);
    } catch (parseErr) {
      console.error("Failed to parse template-ai response", parseErr, message);
      return Response.json({ error: "Invalid AI response" }, { status: 500 });
    }

    return Response.json({ blueprint });
  } catch (err) {
    const status = err?.status || err?.code === "insufficient_quota" ? 429 : 500;
    const msg =
      err?.code === "insufficient_quota"
        ? "AI quota exceeded. Please check your plan/billing."
        : "Generation failed";
    console.error("Template AI generation failed", err);
    return Response.json({ error: msg }, { status });
  }
}
