"use client";

import { useEffect } from "react";
import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";

export default function ThemeSwitcher() {
  const { themes, activeThemeId, setActiveTheme, loadThemes } = useTemplateBuilderStore();

  useEffect(() => {
    loadThemes().catch(() => {});
  }, [loadThemes]);

  return (
    <div className="p-4 border-b border-slate-200 bg-white/80">
      <h3 className="font-medium text-sm text-slate-700">Theme</h3>

      <select
        className="border border-slate-200 p-2 rounded w-full mt-2 text-sm"
        value={activeThemeId || ""}
        onChange={(e) => setActiveTheme(e.target.value || null)}
      >
        <option value="">No theme</option>
        {themes.map((t) => (
          <option key={t._id} value={t._id}>
            {t.name}
          </option>
        ))}
      </select>
    </div>
  );
}
