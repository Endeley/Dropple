"use server";

import { chromium } from "playwright";
import { validateDroppleTemplate } from "@/lib/droppleTemplateSpec";

/**
 * Render a template to a short WebM/MP4 (WebM by default).
 * Body: { template, durationMs?, width?, height?, format? }
 */
export async function POST(req) {
  try {
    const { template, durationMs = 4000, width = 1080, height = 1080, format = "webm" } = await req.json();
    const { valid, errors } = validateDroppleTemplate(template || {});
    if (!valid) {
      return Response.json({ error: "Invalid template", details: errors }, { status: 400 });
    }

    const base = process.env.DROPPLE_BASE_URL || "http://localhost:3000";
    const tplParam = encodeURIComponent(JSON.stringify(template));
    const url = `${base}/render?tpl=${tplParam}`;

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto(url);

    const stream = await page.evaluateHandle(
      ({ durationMs, format }) => {
        const target = document.body;
        const mediaStream = target.captureStream(30);
        const chunks = [];
        return new Promise((resolve) => {
          const recorder = new MediaRecorder(mediaStream, { mimeType: format === "mp4" ? "video/webm;codecs=vp9" : "video/webm" });
          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
          };
          recorder.onstop = () => {
            const blob = new Blob(chunks, { type: "video/webm" });
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsArrayBuffer(blob);
          };
          recorder.start();
          setTimeout(() => recorder.stop(), durationMs);
        });
      },
      { durationMs, format },
    );

    const buffer = Buffer.from(await stream.jsonValue());
    await browser.close();

    return new Response(buffer, {
      headers: {
        "Content-Type": "video/webm",
        "Content-Disposition": `attachment; filename=template.${format === "mp4" ? "mp4" : "webm"}`,
      },
    });
  } catch (err) {
    console.error("Animated export failed", err);
    return Response.json({ error: "Animated export failed" }, { status: 500 });
  }
}
