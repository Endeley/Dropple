"use server";

import OpenAI from "openai";

const client =
  process.env.OPENAI_API_KEY || process.env.OPENAI_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY })
    : null;

export async function POST(req) {
  if (!client) {
    return Response.json({ error: "Missing OpenAI API key" }, { status: 500 });
  }

  const { prompt } = await req.json();
  if (!prompt || typeof prompt !== "string") {
    return Response.json({ error: "Prompt is required" }, { status: 400 });
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are an AI Template Designer inside Dropple. Output a FULLY EDITABLE, MOTION-READY template JSON that the Dropple editor can hydrate without changes.

Follow EXACTLY this structure:
{
  "name": "Template Name",
  "description": "Short summary",
  "width": 1440,
  "height": 1024,
  "background": "#ffffff",
  "colors": ["#000000", "#ffffff", "#FF6B00"],
  "fonts": ["Inter", "Poppins", "Roboto"],
  "pageTransitions": {
    "default": { "type": "slide", "direction": "right", "duration": 0.6, "ease": "easeOut" }
  },
  "nodes": [
    { "id": "text1", "type": "text", "content": "Heading", "x": 120, "y": 140, "width": 840, "height": 120, "fontSize": 64, "fontWeight": 700, "color": "#0f172a" },
    { "id": "image1", "type": "image", "imageId": "img1", "x": 0, "y": 0, "width": 1440, "height": 560, "fit": "cover" },
    { "id": "shape1", "type": "shape", "shape": "rectangle", "x": 120, "y": 760, "width": 1200, "height": 220, "fill": "#FF6B00", "radius": 24 }
  ],
  "images": [
    { "id": "img1", "prompt": "high-detail photo or illustration that matches the category/style" }
  ],
  "animations": [
    {
      "id": "anim_text1",
      "nodeId": "text1",
      "variants": {
        "initial": { "opacity": 0, "y": 32 },
        "animate": { "opacity": 1, "y": 0, "transition": { "duration": 0.6, "ease": "easeOut" } },
        "hover": { "scale": 1.03 },
        "tap": { "scale": 0.97 },
        "exit": { "opacity": 0, "y": -12 },
        "inView": { "opacity": 1, "y": 0 }
      },
      "triggers": ["onLoad", "onHover", "onClick", "onView"]
    },
    {
      "id": "anim_image1",
      "nodeId": "image1",
      "variants": {
        "initial": { "opacity": 0.85, "scale": 1.02 },
        "animate": { "opacity": 1, "scale": 1, "transition": { "duration": 0.8 } },
        "hover": { "scale": 1.02 },
        "tap": { "scale": 0.98 }
      },
      "scroll": {
        "inputRange": [0, 400],
        "outputRange": { "y": [0, -40], "opacity": [1, 0.92] }
      },
      "triggers": ["onLoad", "onHover", "onScroll"],
      "tracks": [
        { "property": "y", "keyframes": [ { "time": 0, "value": 0 }, { "time": 1200, "value": -6, "easing": "easeInOut" } ] }
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
- Use node types: "text" (content/fontSize/fontWeight/color/font optional), "image" (imageId/fit), "shape" (rectangle/ellipse/line with fill/radius).
- animations: array where each item targets a nodeId and includes "variants" (initial/animate/hover/tap/exit/inView as needed) plus "triggers". Include scroll effects when relevant. Optional "tracks" for looping/float effects (property, keyframes[{time,value,easing?,duration?}]). Use playTimelineOnLoad + timelineLoop when you include tracks.
- pageTransitions (optional): { "default": { "type": "slide|fade|scale|flip|push|overlay|timeline", "direction": "left|right|up|down", "duration": 0.6, "ease": "easeOut" } }
- animations: array where each item targets a nodeId and includes "variants" (initial/animate/hover/tap/exit/inView as needed) plus "triggers". Include scroll effects when relevant. Optional "tracks" for looping/float effects (property, keyframes[{time,value,easing?,duration?}]). Use playTimelineOnLoad + timelineLoop when you include tracks.
- Use colors/fonts that fit the requested style; keep spacing/hierarchy professional.
- images: 1-3 prompts, varied and specific to the category/style (avoid generic/duplicate prompts).
- If the user asks for staggered elements, add small transition delays per element in animate.
- Keep output compact but complete; avoid nulls/undefined.
          `,
        },
        { role: "user", content: prompt },
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
