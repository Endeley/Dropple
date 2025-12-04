"use client";

import { useState } from "react";
import { convertBlueprintToDroppleTemplate } from "@/lib/convertBlueprintToDroppleTemplate";

export default function TemplateAIGenerator() {
  const [prompt, setPrompt] = useState("");
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        <button
          className="w-full border border-blue-200 text-blue-700 rounded p-2 text-sm hover:bg-blue-50"
          onClick={addToEditor}
        >
          Add to Editor
        </button>
      )}
    </div>
  );
}
