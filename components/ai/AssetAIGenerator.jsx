"use client";

import { useState } from "react";

export default function AssetAIGenerator({ onGenerated }) {
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState("icon");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/asset-ai", {
        method: "POST",
        body: JSON.stringify({ prompt, type }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Generation failed");
      }
      onGenerated?.(data.url, data);
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
        <h3 className="font-semibold text-base">AI Asset Generator</h3>
        <p className="text-xs text-gray-500">Icons, photos, illustrations, textures.</p>
      </div>

      <select
        className="w-full border rounded p-2 text-sm"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option value="icon">Icon</option>
        <option value="illustration">Illustration</option>
        <option value="photo">Photo</option>
        <option value="background">Background / Texture</option>
        <option value="texture">Pattern / Texture</option>
        <option value="3d">3D Render</option>
      </select>

      <textarea
        className="w-full border rounded p-2 text-sm h-24"
        placeholder="e.g. modern minimal shopping cart icon, outline style"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      <button
        className="w-full bg-blue-600 text-white rounded p-2 text-sm hover:bg-blue-700 disabled:bg-gray-300"
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
      >
        {loading ? "Generating…" : "Generate Asset"}
      </button>
    </div>
  );
}
