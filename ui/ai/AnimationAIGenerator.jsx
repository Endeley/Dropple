"use client";

import { useState } from "react";
import { convertBlueprintToAnimation } from "@/lib/convertBlueprintToAnimation";
import { useTemplateBuilderStore } from "@/runtime/stores/useTemplateBuilderStore";

export default function AnimationAIGenerator() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const selectedLayers = useTemplateBuilderStore((s) => s.selectedLayers);
  const addAnimation = useTemplateBuilderStore((s) => s.addAnimation);

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/animation-ai", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Generation failed");

      const anim = convertBlueprintToAnimation(data.blueprint || {}, selectedLayers);
      addAnimation(anim, selectedLayers);
      setPrompt("");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-3 border rounded space-y-3 bg-white shadow-sm">
      <div>
        <h3 className="font-semibold text-base">AI Animation Generator</h3>
        <p className="text-xs text-gray-500">
          Describe the motion; we’ll build keyframes for the selected layers.
        </p>
      </div>
      <textarea
        className="w-full border rounded p-2 text-sm h-24"
        placeholder="Fade in then slide up softly..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <button
        className="w-full bg-blue-600 text-white rounded p-2 text-sm hover:bg-blue-700 disabled:bg-gray-300"
        onClick={handleGenerate}
        disabled={loading || !prompt.trim() || !selectedLayers?.length}
      >
        {loading ? "Generating…" : "Generate Animation"}
      </button>
      {!selectedLayers?.length && (
        <p className="text-[11px] text-amber-600">
          Select one or more layers to attach the animation.
        </p>
      )}
    </div>
  );
}
