"use client";

import { useState, useMemo } from "react";
import { convertBlueprintToDroppleTemplate } from "@/lib/convertBlueprintToDroppleTemplate";

const categories = [
  "SaaS dashboard",
  "Landing page hero",
  "Mobile app UI",
  "Poster",
  "Social post",
  "Graphic design",
  "CV / Resume",
  "Receipt / Invoice",
  "E-commerce product",
  "Portfolio",
];

const styles = ["Modern minimal", "Bold colorful", "Dark mode", "Pastel", "Luxury premium"];

const placeholderThumbData =
  "data:image/svg+xml;base64," +
  btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" fill="none">
      <rect width="800" height="600" rx="24" fill="#f8fafc" />
      <rect x="40" y="40" width="720" height="520" rx="20" fill="#e2e8f0" />
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#475569" font-size="24" font-family="Inter, sans-serif">AI Template</text>
    </svg>`,
  );

export default function BulkGenerateTemplatesPage() {
  const [status, setStatus] = useState([]);
  const [running, setRunning] = useState(false);

  const combos = useMemo(() => {
    const pairs = [];
    for (const cat of categories) {
      for (const style of styles) {
        pairs.push({ cat, style });
        if (pairs.length >= 20) break;
      }
      if (pairs.length >= 20) break;
    }
    return pairs;
  }, []);

  const makeThumbBlob = async () => {
    const res = await fetch(placeholderThumbData);
    return await res.blob();
  };

  const log = (msg) => setStatus((prev) => [...prev, msg]);

  const runBulk = async () => {
    if (running) return;
    setStatus([]);
    setRunning(true);
    for (const { cat, style } of combos) {
      const label = `${cat} · ${style}`;
      try {
        log(`Generating: ${label}`);
        const prompt = [
          "You are an AI Template Designer inside Dropple.",
          "Generate a complete template structure following these rules:",
          `### TEMPLATE GOAL: ${cat}`,
          `### DESIGN STYLE: ${style}`,
          "Return JSON only per the universal schema (width/height/background/colors/fonts/nodes/images).",
        ].join("\n");
        const aiRes = await fetch("/api/template-ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });
        const aiJson = await aiRes.json();
        if (!aiRes.ok || aiJson.error) throw new Error(aiJson.error || "AI generation failed");

        const tpl = convertBlueprintToDroppleTemplate(aiJson.blueprint || {});
        const form = new FormData();
        form.append(
          "metadata",
          JSON.stringify({
            name: tpl.name || `Template - ${cat}`,
            category: cat,
            tags: [style, cat, "ai-generated"].filter(Boolean),
            visibility: "public",
          }),
        );
        form.append("template", new Blob([JSON.stringify(tpl)], { type: "application/json" }), `${tpl.id || "ai-template"}.json`);
        const imgBlob = await makeThumbBlob();
        form.append("thumbnail", imgBlob, `${tpl.id || "ai-template"}.jpg`);
        const saveRes = await fetch("/api/templates/save", { method: "POST", body: form });
        const saveText = await saveRes.text();
        let saveJson = {};
        try {
          saveJson = JSON.parse(saveText || "{}");
        } catch (_) {
          saveJson = {};
        }
        if (!saveRes.ok || saveJson.error) {
          const msg = saveJson.error || saveText || "Save failed";
          throw new Error(msg);
        }
        log(`✅ Saved: ${label} (id: ${saveJson.id || saveJson.localId || "n/a"})`);
      } catch (err) {
        log(`❌ Failed: ${label} — ${err?.message || err}`);
      }
    }
    setRunning(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
      <h1 className="text-2xl font-semibold text-neutral-900">Bulk Generate AI Templates</h1>
      <p className="text-sm text-neutral-600">
        Generates ~20 AI templates across categories/styles and publishes them (requires being signed in). Uses a placeholder thumbnail.
      </p>
      <button
        onClick={runBulk}
        disabled={running}
        className="px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-semibold shadow-sm hover:bg-emerald-700 disabled:opacity-60"
      >
        {running ? "Generating…" : "Generate & Publish (20)"}
      </button>
      <div className="border border-neutral-200 rounded-lg p-3 bg-white h-64 overflow-auto text-sm text-neutral-800">
        {status.length === 0 ? <div className="text-neutral-500">No runs yet.</div> : status.map((s, i) => <div key={i}>{s}</div>)}
      </div>
      <div className="text-xs text-neutral-500">
        Notes: Uses `/api/template-ai` then `/api/templates/save` with visibility public. If not signed in, saves may fail. Thumbnails use a placeholder image.
      </div>
    </div>
  );
}
