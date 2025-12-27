"use server";

import { refineMotion, analyzeMotion } from "@/engine/motion/motionRefiner";

export async function POST(req) {
  try {
    const body = await req.json();
    const template = body?.template || {};
    const mode = body?.mode || "analyze";
    const opts = body?.options || {};

    if (!template || typeof template !== "object") {
      return Response.json({ error: "template object required" }, { status: 400 });
    }

    if (mode === "refine") {
      const result = refineMotion(template, opts);
      return Response.json(result);
    }

    const analysis = analyzeMotion(template);
    return Response.json({ analysis });
  } catch (err) {
    console.error("Motion refine failed", err);
    return Response.json({ error: "Motion refine failed" }, { status: 500 });
  }
}
