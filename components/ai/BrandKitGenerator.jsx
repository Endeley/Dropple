/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { buildBrandKit } from "@/lib/buildBrandKit";
import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";

export default function BrandKitGenerator() {
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [description, setDescription] = useState("");
  const [brandKit, setBrandKit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const setThemes = useTemplateBuilderStore((s) => s.setThemes);
  const setActiveTheme = useTemplateBuilderStore((s) => s.setActiveTheme);

  async function generate() {
    if (!name || !description) return;
    setLoading(true);
    setError(null);
    try {
      const blueprintRes = await fetch("/api/brandkit-ai", {
        method: "POST",
        body: JSON.stringify({ name, industry, description }),
      });
      const blueprintData = await blueprintRes.json();
      if (!blueprintRes.ok || blueprintData.error) {
        throw new Error(blueprintData.error || "Failed to generate blueprint");
      }
      const blueprint = blueprintData.blueprint || blueprintData;

      const logoUrls = [];
      for (const concept of blueprint.logoConcepts || []) {
        try {
          const res = await fetch("/api/logo-ai", {
            method: "POST",
            body: JSON.stringify({ concept, name: blueprint.name }),
          });
          const data = await res.json();
          if (res.ok && data.url) {
            logoUrls.push(data.url);
            // save to asset library for reuse
            await fetch("/api/asset-library/create", {
              method: "POST",
              body: JSON.stringify({
                type: "icon",
                title: `${blueprint.name} Logo`,
                description: concept.description || "",
                tags: ["logo", "brand"],
                fileUrl: data.url,
                previewUrl: data.url,
                fileType: "image/png",
                size: 0,
                isPremium: false,
                price: 0,
              }),
            });
          }
        } catch (err) {
          console.error("Logo generation failed", err);
        }
      }

      const kit = buildBrandKit(blueprint, logoUrls, blueprint.patterns || []);
      setBrandKit(kit);

      // Apply theme immediately
      if (kit.theme) {
        setThemes([kit.theme]);
        setActiveTheme(kit.theme._id);
      }
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
        <h3 className="font-semibold text-base">Brand Kit AI Generator</h3>
        <p className="text-xs text-gray-500">From name + description → logo, colors, fonts.</p>
      </div>

      <input
        className="w-full border rounded p-2 text-sm"
        placeholder="Brand name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="w-full border rounded p-2 text-sm"
        placeholder="Industry"
        value={industry}
        onChange={(e) => setIndustry(e.target.value)}
      />
      <textarea
        className="w-full border rounded p-2 text-sm h-20"
        placeholder="Describe your brand..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      <button
        className="w-full bg-blue-600 text-white rounded p-2 text-sm hover:bg-blue-700 disabled:bg-gray-300"
        onClick={generate}
        disabled={loading || !name || !description}
      >
        {loading ? "Generating…" : "Generate Brand Kit"}
      </button>

      {brandKit && (
        <div className="space-y-2 border-t pt-3">
          <p className="text-sm font-semibold">{brandKit.name}</p>
          <div className="flex gap-2">
            {(brandKit.colors?.primary || []).slice(0, 4).map((c) => (
              <span
                key={c}
                className="w-6 h-6 rounded border"
                style={{ background: c }}
                title={c}
              />
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {(brandKit.logos || []).slice(0, 3).map((url) => (
              <img
                key={url}
                src={url}
                alt={brandKit.name ? `${brandKit.name} logo` : "logo"}
                className="w-16 h-16 object-contain border rounded bg-white"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
