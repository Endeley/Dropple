"use client";

import { useTemplateBuilderStore } from "@/runtime/stores/useTemplateBuilderStore";
import { useMemo } from "react";

export default function ThemeEditor() {
  const { themes, activeThemeId, setThemes, loadThemes } = useTemplateBuilderStore();
  const theme = useMemo(
    () => themes.find((t) => t._id === activeThemeId),
    [activeThemeId, themes],
  );

  if (!theme) return (
    <div className="p-4 text-sm text-slate-500">
      Select a theme to edit its tokens.
    </div>
  );

  async function updateToken(key, value) {
    try {
      await fetch("/api/themes/update", {
        method: "POST",
        body: JSON.stringify({
          themeId: theme._id,
          tokens: {
            ...theme.tokens,
            colors: {
              ...theme.tokens.colors,
              [key]: value,
            },
          },
        }),
      });
      const updated = themes.map((t) =>
        t._id === theme._id
          ? {
              ...t,
              tokens: {
                ...t.tokens,
                colors: { ...t.tokens.colors, [key]: value },
              },
            }
          : t,
      );
      setThemes(updated);
    } catch (err) {
      console.error("Failed to update theme token", err);
      // fallback to reload stored themes if server declined
      loadThemes().catch(() => {});
    }
  }

  const colors = theme.tokens.colors || {};

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Theme Colors</h3>
        <span className="text-xs text-slate-500">{theme.name}</span>
      </div>

      {Object.entries(colors).map(([key, value]) => (
        <div key={key} className="flex items-center justify-between gap-3">
          <label className="text-sm capitalize w-24 text-slate-600">{key}</label>
          <input
            type="color"
            className="w-12 h-10 border border-slate-200 rounded"
            value={value}
            onChange={(e) => updateToken(key, e.target.value)}
          />
          <input
            className="flex-1 border border-slate-200 rounded px-2 py-1 text-sm"
            value={value}
            onChange={(e) => updateToken(key, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}
