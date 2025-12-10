"use client";

import { useState } from "react";
import { blueprintToTemplate } from "@/lib/templates/aiBuilder";
import { generateTemplateThumbnail } from "@/lib/templates/exportTemplate";
import { useNodeTreeStore } from "@/zustand/nodeTreeStore";
import { useSelectionStore } from "@/zustand/selectionStore";
import html2canvas from "html2canvas";

const inputClass =
  "w-full bg-white border border-neutral-200 rounded-md px-3 py-2 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-500 transition";

export function TemplateAIGeneratorModal({ open, onClose }) {
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState("Landing Pages");
  const [size, setSize] = useState("desktop");
  const [style, setStyle] = useState("modern");
  const [themePack, setThemePack] = useState("modern");
  const [responsiveVariants, setResponsiveVariants] = useState(true);
  const [smartFill, setSmartFill] = useState(true);
  const [sections, setSections] = useState("pricing, testimonials, footer");
  const [busy, setBusy] = useState(false);
  const setSelectedManual = useSelectionStore((s) => s.setSelectedManual);
  const insertSubtree = useNodeTreeStore((s) => s.insertSubtree);

  if (!open) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setBusy(true);
    try {
      const aiPrompt = [
        prompt,
        `Category: ${category}`,
        `Style: ${style}`,
        `Theme pack: ${themePack}`,
        `Size: ${size}`,
        responsiveVariants ? "Generate responsive variants (desktop, tablet, mobile)." : "",
        smartFill ? `Add missing sections: ${sections}.` : "",
        "Return only JSON blueprint as per schema.",
      ]
        .filter(Boolean)
        .join("\n");

      const res = await fetch("/api/template-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Generation failed");
      }
      const data = await res.json();
      const blueprint = data.blueprint || {};
      const template = blueprintToTemplate(blueprint, {
        name: blueprint.name,
        width: size === "mobile" ? 390 : size === "tablet" ? 768 : 1440,
        height: 900,
      });
      const thumbBlob = (await captureDom()) || (await generateTemplateThumbnail(template));
      const form = new FormData();
      form.append(
        "metadata",
        JSON.stringify({
          name: template.name,
          category,
          tags: [style, category, themePack, smartFill ? "smart-fill" : "", responsiveVariants ? "responsive" : ""].filter(Boolean),
          visibility: "private",
        })
      );
      form.append("template", new Blob([JSON.stringify(template)], { type: "application/json" }), `${template.id}.json`);
      if (thumbBlob) form.append("thumbnail", thumbBlob, `${template.id}.png`);
      await fetch("/api/templates/save", { method: "POST", body: form });
      hydrateTemplate(template);
      onClose();
    } catch (err) {
      console.error("AI generate failed", err);
      alert(err?.message || "AI generation failed. Please try again later.");
    } finally {
      setBusy(false);
    }
  };

  const hydrateTemplate = (template) => {
    const nodes = template.nodes || [];
    const idMap = {};
    nodes.forEach((n) => {
      idMap[n.id] = crypto.randomUUID();
    });
    const cloned = {};
    nodes.forEach((n) => {
      const children = (n.children || []).map((cid) => idMap[cid]);
      cloned[idMap[n.id]] = { ...n, id: idMap[n.id], children, parent: null };
    });
    Object.values(cloned).forEach((n) => {
      (n.children || []).forEach((cid) => {
        if (cloned[cid]) cloned[cid].parent = n.id;
      });
    });
    const topLevel = Object.values(cloned).filter((n) => !n.parent);
    const rootId = topLevel[0]?.id;
    if (!rootId) return;
    insertSubtree(cloned, [rootId]);
    setSelectedManual([rootId]);
  };

  async function captureDom() {
    try {
      const target = document.getElementById("uiux-canvas-area");
      if (!target) return null;
      const canvas = await html2canvas(target, { backgroundColor: "#ffffff", scale: 1, useCORS: true, allowTaint: true, logging: false });
      return await new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/png"));
    } catch (err) {
      return null;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-[520px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-neutral-900">Generate with AI</div>
            <div className="text-xs text-neutral-500">Describe what you want and Dropple will build a template.</div>
          </div>
          <button onClick={onClose} className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 px-2 py-1 rounded-md hover:bg-neutral-100">
            Close
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500 mb-1">Prompt</div>
            <textarea className={`${inputClass} min-h-[100px]`} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g. Modern SaaS landing hero with gradient background and CTA buttons" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500 mb-1">Category</div>
              <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
                <option>Landing Pages</option>
                <option>Dashboard</option>
                <option>Portfolio</option>
                <option>Mobile App</option>
              </select>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500 mb-1">Size</div>
              <select className={inputClass} value={size} onChange={(e) => setSize(e.target.value)}>
                <option value="desktop">Desktop</option>
                <option value="tablet">Tablet</option>
                <option value="mobile">Mobile</option>
              </select>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500 mb-1">Style</div>
              <select className={inputClass} value={style} onChange={(e) => setStyle(e.target.value)}>
                <option value="modern">Modern</option>
                <option value="minimal">Minimal</option>
                <option value="dark">Dark</option>
                <option value="gradient">Gradient</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500 mb-1">Theme Pack</div>
              <select className={inputClass} value={themePack} onChange={(e) => setThemePack(e.target.value)}>
                <option value="modern">Modern</option>
                <option value="minimal">Minimal</option>
                <option value="dark">Dark</option>
                <option value="gradient">Gradient</option>
                <option value="playful">Playful</option>
                <option value="glassmorphism">Glassmorphism</option>
                <option value="brutalist">Brutalist</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  checked={responsiveVariants}
                  onChange={(e) => setResponsiveVariants(e.target.checked)}
                  className="rounded border-neutral-300 text-violet-600 focus:ring-violet-500"
                />
                Responsive variants (desktop/tablet/mobile)
              </label>
              <label className="flex items-center gap-2 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  checked={smartFill}
                  onChange={(e) => setSmartFill(e.target.checked)}
                  className="rounded border-neutral-300 text-violet-600 focus:ring-violet-500"
                />
                Smart Fill missing sections
              </label>
            </div>
          </div>
          {smartFill ? (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500 mb-1">Sections</div>
              <input
                className={inputClass}
                value={sections}
                onChange={(e) => setSections(e.target.value)}
                placeholder="pricing, testimonials, footer"
              />
            </div>
          ) : null}
        </div>
        <div className="px-4 py-3 border-t border-neutral-200 flex items-center justify-end gap-2 bg-neutral-50/70">
          <button onClick={onClose} className="px-3 py-2 rounded-md border border-neutral-200 bg-white text-sm text-neutral-700 hover:border-neutral-300" disabled={busy}>
            Cancel
          </button>
          <button onClick={handleGenerate} className="px-3 py-2 rounded-md bg-violet-500 text-white text-sm font-semibold shadow-sm hover:bg-violet-600 disabled:opacity-60" disabled={busy}>
            {busy ? "Generating..." : "Generate & Insert"}
          </button>
        </div>
      </div>
    </div>
  );
}
