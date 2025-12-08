"use client";

import { useState } from "react";
import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";

export default function TypographyPanel({ layer }) {
  const { writeNodePatch } = useTemplateBuilderStore();
  const props = layer.props || {};
  const [loadingCopy, setLoadingCopy] = useState(false);

  const rewriteCopy = async () => {
    if (layer.type !== "text") return;
    setLoadingCopy(true);
    try {
      const res = await fetch("/api/assistant/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandVoice: "professional",
          context: layer.content || props.text || "CTA text",
        }),
      });
      const data = await res.json();
      if (data?.copy) {
        const option = String(data.copy).split("---")[0].trim();
        writeNodePatch(layer.id, { content: option });
      }
    } catch (err) {
      console.error("Rewrite copy failed", err);
    } finally {
      setLoadingCopy(false);
    }
  };

  return (
    <div className="space-y-3 border-b pb-4">
      <h3 className="font-medium">Typography</h3>

      <label className="block text-sm">
        <span className="block text-xs text-gray-600">Font Size</span>
        <input
          type="number"
          className="border p-1 rounded w-full"
          value={props.fontSize || 16}
          onChange={(e) =>
            writeNodePatch(layer.id, { props: { ...props, fontSize: Number(e.target.value) } })
          }
        />
      </label>

      <label className="block text-sm">
        <span className="block text-xs text-gray-600">Font Weight</span>
        <select
          className="border p-1 rounded w-full"
          value={props.fontWeight || 400}
          onChange={(e) =>
            writeNodePatch(layer.id, { props: { ...props, fontWeight: Number(e.target.value) } })
          }
        >
          <option value={300}>Light</option>
          <option value={400}>Regular</option>
          <option value={500}>Medium</option>
          <option value={600}>Semi-bold</option>
          <option value={700}>Bold</option>
        </select>
      </label>

      <label className="block text-sm">
        <span className="block text-xs text-gray-600">Line Height</span>
        <input
          type="number"
          className="border p-1 rounded w-full"
          value={props.lineHeight || 1.4}
          onChange={(e) =>
            writeNodePatch(layer.id, { props: { ...props, lineHeight: Number(e.target.value) } })
          }
        />
      </label>

      {layer.type === "text" ? (
        <button
          type="button"
          onClick={rewriteCopy}
          className="px-3 py-1.5 rounded border border-neutral-200 text-xs text-slate-700 hover:bg-slate-50"
          disabled={loadingCopy}
        >
          {loadingCopy ? "Rewriting..." : "Rewrite with AI"}
        </button>
      ) : null}
    </div>
  );
}
