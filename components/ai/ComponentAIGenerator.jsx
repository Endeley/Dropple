"use client";

import { useState } from "react";
import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";
import { convertAIToComponent } from "@/lib/convertAIToComponent";

export default function ComponentAIGenerator() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { components, setComponents, addComponentInstance } = useTemplateBuilderStore();

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/component-ai", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Generation failed");
      }

      const aiObj = data.component || data;
      const component = convertAIToComponent(aiObj);

      // add to component library
      const nextComponents = [...(components || []), component];
      setComponents(nextComponents);

      // drop an instance on canvas for immediate use
      addComponentInstance(component, component.variants?.[0]?.id || null);

      setPrompt("");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 border rounded space-y-3 bg-white shadow-sm">
      <div>
        <h2 className="font-semibold text-lg">AI Component Generator</h2>
        <p className="text-sm text-gray-500">Describe the component you want. We’ll build it.</p>
      </div>

      <textarea
        className="w-full border rounded p-2 h-28"
        placeholder="Create a modern rounded primary button with icon and hover variant..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        className="w-full bg-blue-600 text-white rounded p-2 hover:bg-blue-700 disabled:bg-gray-300"
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
      >
        {loading ? "Generating..." : "Generate & Add"}
      </button>
    </div>
  );
}
