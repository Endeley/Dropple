"use client";

import { useEffect, useState } from "react";
import { blueprintToTemplate } from "@/lib/templates/aiBuilder";
import { generateTemplateThumbnail } from "@/lib/templates/exportTemplate";
import { useNodeTreeStore } from "@/runtime/stores/nodeTreeStore";
import { useSelectionStore } from "@/runtime/stores/selectionStore";

const inputClass =
  "w-full bg-white border border-neutral-200 rounded-md px-3 py-2 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-500 transition";

export default function TemplateAIAdvancedModal({ template, onClose, onDone }) {
  const [themePack, setThemePack] = useState("modern");
  const [responsiveVariants, setResponsiveVariants] = useState(true);
  const [smartFill, setSmartFill] = useState(true);
  const [sections, setSections] = useState("pricing, testimonials, footer");
  const [busy, setBusy] = useState(false);
  const insertSubtree = useNodeTreeStore((s) => s.insertSubtree);
  const setSelectedManual = useSelectionStore((s) => s.setSelectedManual);

  useEffect(() => {
    if (!template) onClose?.();
  }, [template, onClose]);

  if (!template) return null;

  const hydrateTemplate = (tpl) => {
    const nodes = tpl.nodes || [];
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

  const handleGenerate = async () => {
    setBusy(true);
    try {
      const tplRes = await fetch(`/api/templates/${template.id}`);
      const tplData = await tplRes.json();
      const base = tplData.template || {};
      const baseSummary = JSON.stringify({
        name: base.name,
        description: base.description,
        category: base.category,
        tags: base.tags,
        frame: base.frame,
      });

      const promptParts = [
        `Restyle/remix template "${base.name || "template"}" with theme pack: ${themePack}.`,
        responsiveVariants ? "Generate responsive variants (desktop, tablet, mobile)." : "",
        smartFill ? `Add missing sections: ${sections}.` : "",
        "Return a JSON blueprint with sections/components like the schema you were given.",
        `Template meta: ${baseSummary}`,
      ].filter(Boolean);

      const res = await fetch("/api/template-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptParts.join("\n") }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Generation failed");
      }
      const data = await res.json();
      const blueprint = data.blueprint || {};
      const width = base?.frame?.width || 1440;
      const height = base?.frame?.height || 900;
      const newTemplate = blueprintToTemplate(blueprint, {
        name: `${template.name || "Template"} (AI Remix)`,
        width,
        height,
      });

      const thumbBlob = await generateTemplateThumbnail(newTemplate);
      const form = new FormData();
      form.append(
        "metadata",
        JSON.stringify({
          name: newTemplate.name,
          category: template.category || "General",
          tags: [...(template.tags || []), themePack, "ai-remix"].filter(Boolean),
          visibility: "private",
        })
      );
      form.append("template", new Blob([JSON.stringify(newTemplate)], { type: "application/json" }), `${newTemplate.id}.json`);
      if (thumbBlob) form.append("thumbnail", thumbBlob, `${newTemplate.id}.png`);
      await fetch("/api/templates/save", { method: "POST", body: form });

      hydrateTemplate(newTemplate);
      onDone?.();
      onClose?.();
    } catch (err) {
      console.error("AI restyle failed", err);
      alert(err?.message || "AI restyle failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-[540px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-neutral-900">AI Restyle / Remix</div>
            <div className="text-xs text-neutral-500">Apply a theme, add missing sections, and generate variants.</div>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 px-2 py-1 rounded-md hover:bg-neutral-100"
          >
            Close
          </button>
        </div>

        <div className="p-4 space-y-3">
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
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={responsiveVariants}
                onChange={(e) => setResponsiveVariants(e.target.checked)}
                className="rounded border-neutral-300 text-violet-600 focus:ring-violet-500"
              />
              Generate responsive variants (desktop/tablet/mobile)
            </label>
          </div>
          <div className="flex items-center gap-2">
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
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-md border border-neutral-200 bg-white text-sm text-neutral-700 hover:border-neutral-300"
            disabled={busy}
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            className="px-3 py-2 rounded-md bg-violet-500 text-white text-sm font-semibold shadow-sm hover:bg-violet-600 disabled:opacity-60"
            disabled={busy}
          >
            {busy ? "Generating..." : "Generate Remix"}
          </button>
        </div>
      </div>
    </div>
  );
}
