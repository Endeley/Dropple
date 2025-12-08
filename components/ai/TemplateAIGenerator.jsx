"use client";

import { useState } from "react";
import { convertBlueprintToDroppleTemplate } from "@/lib/convertBlueprintToDroppleTemplate";
import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";
import { generateTemplateThumbnail } from "@/lib/templates/exportTemplate";

export default function TemplateAIGenerator() {
  const [prompt, setPrompt] = useState("");
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [saveError, setSaveError] = useState(null);
  const applyTemplateToCanvas = (tpl) => {
    if (!tpl) return;
    const page = {
      id: "page_1",
      name: tpl.name || "Generated Page",
      artboards: [],
      layers: tpl.layers || [],
    };
    const prev = useTemplateBuilderStore.getState().currentTemplate || {};
    useTemplateBuilderStore.setState({
      currentTemplate: {
        ...prev,
        id: tpl.id || crypto.randomUUID(),
        name: tpl.name || "AI Template",
        description: tpl.description || "",
        mode: tpl.mode || "uiux",
        width: tpl.width || prev.width || 1440,
        height: tpl.height || prev.height || 1024,
        layers: tpl.layers || [],
        tags: tpl.tags || [],
        thumbnail: tpl.thumbnail || "",
      },
      pages: [page],
      activePageId: page.id,
    });
  };

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/template-ai", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Generation failed");
      }
      const tpl = convertBlueprintToDroppleTemplate(data.blueprint || {});
      setTemplate(tpl);
      applyTemplateToCanvas(tpl);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function addToEditor() {
    if (!template) return;
    localStorage.setItem("AI_TEMPLATE", JSON.stringify(template));
    window.location.href = "/editor/templates/create";
  }

  async function saveToMarketplace() {
    if (!template) return;
    setSaveStatus("saving");
    setSaveError(null);
    try {
      const thumbBlob = await generateTemplateThumbnail(template);
      const form = new FormData();
      form.append(
        "metadata",
        JSON.stringify({
          name: template.name || "AI Template",
          category: template.category || "AI Generated",
          tags: template.tags || ["ai-generated"],
          visibility: "public",
        }),
      );
      form.append("template", new Blob([JSON.stringify(template)], { type: "application/json" }), `${template.id || "ai-template"}.json`);
      if (thumbBlob) form.append("thumbnail", thumbBlob, `${template.id || "ai-template"}.png`);
      const res = await fetch("/api/templates/save", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 401) throw new Error("Sign in to publish to the marketplace.");
        throw new Error(data?.error || "Save failed");
      }
      setSaveStatus("saved");
    } catch (err) {
      setSaveStatus("error");
      setSaveError(err?.message || "Save failed");
    }
  }

  return (
    <div className="p-3 border rounded space-y-3 bg-white shadow-sm">
      <div>
        <h3 className="font-semibold text-base">AI Template Generator</h3>
        <p className="text-xs text-gray-500">Describe a screen. We’ll build the layout.</p>
      </div>

      <textarea
        className="w-full border rounded p-2 text-sm h-24"
        placeholder="Generate a modern SaaS dashboard with sidebar, charts, and top navbar..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      <button
        className="w-full bg-blue-600 text-white rounded p-2 text-sm hover:bg-blue-700 disabled:bg-gray-300"
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
      >
        {loading ? "Generating…" : "Generate Template"}
      </button>

      {template && (
        <div className="space-y-2">
          <button
            className="w-full border border-blue-200 text-blue-700 rounded p-2 text-sm hover:bg-blue-50"
            onClick={addToEditor}
          >
            Add to Editor
          </button>
          <button
            className="w-full bg-emerald-600 text-white rounded p-2 text-sm hover:bg-emerald-700 disabled:opacity-60"
            onClick={saveToMarketplace}
            disabled={saveStatus === "saving"}
          >
            {saveStatus === "saving"
              ? "Saving to Marketplace…"
              : saveStatus === "saved"
                ? "Saved to Marketplace"
                : "Save to Marketplace"}
          </button>
          {saveError ? <p className="text-xs text-red-600">{saveError}</p> : null}
          {saveStatus === "saved" && !saveError ? (
            <p className="text-xs text-emerald-600">Published (requires sign-in).</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
