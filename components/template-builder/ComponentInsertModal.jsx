"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTemplateBuilderStore } from "@/runtime/stores/useTemplateBuilderStore";

export default function ComponentInsertModal({ open, onClose }) {
  const components = useTemplateBuilderStore((s) => s.components || []);
  const createInstanceFromComponent = useTemplateBuilderStore((s) => s.createInstanceFromComponent);
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [variantChoice, setVariantChoice] = useState({});

  if (!open) return null;

  const filtered = components.filter((c) => {
    if (!search.trim()) return true;
    const haystack = `${c.name || ""} ${(c.metadata?.category || "")} ${(c.metadata?.tags || []).join(" ")}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Insert Component</h3>
          <button
            onClick={onClose}
            className="text-sm px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search components, categories, tags..."
            className="w-full rounded border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button
            className="px-3 py-2 rounded border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
            onClick={() => {
              router.push("/workspace/create?source=ai-component");
              onClose?.();
            }}
          >
            🚀 Generate new component (AI)
          </button>
          <button
            className="px-3 py-2 rounded border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
            onClick={() => {
              router.push("/templates");
              onClose?.();
            }}
          >
            📦 Insert from pack
          </button>
        </div>
        {components.length === 0 ? (
          <div className="text-sm text-slate-500">No components available. Generate or install a pack first.</div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-auto">
            {filtered.length === 0 && (
              <div className="text-xs text-slate-500 px-1">No results match “{search}”.</div>
            )}
            {filtered.map((c) => {
              const variants = c.variants || [];
              const selectedVariant = variantChoice[c._id] ?? (variants[0]?.id || null);
              return (
                <div
                  key={c._id}
                  className="flex items-center justify-between border border-slate-200 rounded-md px-3 py-2 hover:bg-slate-50 gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-800 truncate">{c.name || c._id}</div>
                    <div className="text-xs text-slate-500 flex flex-wrap gap-1">
                      <span>{c.metadata?.category || "component"}</span>
                      {!!(c.metadata?.tags?.length) && (
                        <span className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">
                          {c.metadata.tags.slice(0, 3).join(", ")}
                          {c.metadata.tags.length > 3 ? "…" : ""}
                        </span>
                      )}
                      {variants.length > 0 && (
                        <span className="text-[11px] text-purple-600">{variants.length} variants</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {variants.length > 0 && (
                      <select
                        value={selectedVariant || ""}
                        onChange={(e) =>
                          setVariantChoice((prev) => ({ ...prev, [c._id]: e.target.value || null }))
                        }
                        className="text-xs border border-slate-200 rounded px-2 py-1 bg-white"
                      >
                        {variants.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name || v.id}
                          </option>
                        ))}
                        <option value="">(Default)</option>
                      </select>
                    )}
                    <button
                      onClick={() => {
                        createInstanceFromComponent(c._id, selectedVariant || null);
                        onClose?.();
                      }}
                      className="text-xs px-3 py-1 rounded bg-purple-600 text-white hover:bg-purple-700"
                    >
                      Insert
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
