"use client";

import { useState } from "react";
import { extractScreens } from "@/lib/extractScreens";
import { applyPrototypeBlueprint } from "@/lib/applyPrototypeBlueprint";
import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";

export default function PrototypeAIGenerator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const store = useTemplateBuilderStore();

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const screens = extractScreens(store.pages || []);
      const res = await fetch("/api/prototype-ai", {
        method: "POST",
        body: JSON.stringify({ screens }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Generation failed");
      const blueprint = data.blueprint || data;
      applyPrototypeBlueprint(blueprint, store);
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
        <h3 className="font-semibold text-base">Interactive Prototype AI</h3>
        <p className="text-xs text-gray-500">Auto-link screens, add transitions and micro-interactions.</p>
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <button
        className="w-full bg-blue-600 text-white rounded p-2 text-sm hover:bg-blue-700 disabled:bg-gray-300"
        onClick={generate}
        disabled={loading}
      >
        {loading ? "Generating…" : "Generate Prototype"}
      </button>
    </div>
  );
}
