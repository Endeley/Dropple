"use client";

import { useState } from "react";
import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";

export default function ExportCodePanel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const pages = useTemplateBuilderStore((s) => s.pages);
  const themes = useTemplateBuilderStore((s) => s.themes);
  const activeThemeId = useTemplateBuilderStore((s) => s.activeThemeId);
  const currentTemplate = useTemplateBuilderStore((s) => s.currentTemplate);

  async function exportCode() {
    setLoading(true);
    setError(null);
    try {
      const activeTheme =
        themes.find((t) => t._id === activeThemeId) || themes[0] || null;

      const workspace = {
        pages,
        brand: activeTheme
          ? { tokens: activeTheme.tokens, colors: activeTheme.tokens?.colors, typography: {} }
          : {},
        assets: [],
        prototype: {},
        animations: [],
        structure: {
          name: currentTemplate?.name,
        },
      };

      const res = await fetch("/api/export-code", {
        method: "POST",
        body: JSON.stringify({ workspace }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Export failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "dropple-export.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-3 border rounded space-y-2 bg-white shadow-sm">
      <div>
        <h3 className="font-semibold text-base">Export Code (Next + Tailwind)</h3>
        <p className="text-xs text-gray-500">Generate a Next.js project from this workspace.</p>
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <button
        className="w-full bg-blue-600 text-white rounded p-2 text-sm hover:bg-blue-700 disabled:bg-gray-300"
        onClick={exportCode}
        disabled={loading}
      >
        {loading ? "Exporting…" : "Export Code"}
      </button>
    </div>
  );
}
