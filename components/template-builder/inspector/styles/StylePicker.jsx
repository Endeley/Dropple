"use client";

import { useEffect, useState } from "react";
import { useTemplateBuilderStore } from "@/runtime/stores/useTemplateBuilderStore";

export default function StylePicker({ layer }) {
  const { applyStyleToLayer, detachStyle, setStyles, styles } =
    useTemplateBuilderStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadStyles() {
      setLoading(true);
      try {
        const res = await fetch("/api/styles/list", { method: "GET" });
        const data = await res.json();
        if (mounted) {
          setStyles(data.styles || []);
        }
      } catch (e) {
        console.error("Failed to load styles", e);
      } finally {
        mounted && setLoading(false);
      }
    }
    loadStyles();
    return () => {
      mounted = false;
    };
  }, [setStyles]);

  const colorStyles = styles?.filter((s) => s.type === "color") || [];
  const textStyles = styles?.filter((s) => s.type === "text") || [];

  return (
    <div className="space-y-3 border-b pb-4">
      <h3 className="font-medium">Styles</h3>

      {loading && <p className="text-xs text-gray-500">Loading styles…</p>}

      <div className="space-y-2">
        {colorStyles.length > 0 && (
          <div>
            <div className="text-xs uppercase mb-1 text-gray-500">Colors</div>
            <div className="flex gap-2 flex-wrap">
              {colorStyles.map((s) => (
                <div
                  key={s._id}
                  className="w-6 h-6 rounded cursor-pointer border"
                  style={{ backgroundColor: s.value?.color || s.value?.fill }}
                  title={s.name}
                  onClick={() => applyStyleToLayer(layer.id, s)}
                />
              ))}
            </div>
          </div>
        )}

        {textStyles.length > 0 && (
          <div>
            <div className="text-xs uppercase mb-1 text-gray-500">Text</div>
            <div className="flex flex-col gap-1">
              {textStyles.map((s) => (
                <button
                  key={s._id}
                  className="text-left text-sm hover:text-blue-600"
                  onClick={() => applyStyleToLayer(layer.id, s)}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {layer.styleId && (
        <button
          className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => detachStyle(layer.id)}
        >
          Detach Style
        </button>
      )}
    </div>
  );
}
