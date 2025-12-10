"use client";

import { useState, useMemo } from "react";
import { useSelectionStore } from "@/zustand/selectionStore";
import { useNodeTreeStore } from "@/zustand/nodeTreeStore";
import { exportTemplate, generateTemplateThumbnail } from "@/lib/templates/exportTemplate";
import html2canvas from "html2canvas";

const inputClass =
  "w-full bg-white border border-neutral-200 rounded-md px-3 py-2 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-500 transition";

export function TemplateSaveModal({ open, onClose, mode = "save" }) {
  const selectedIds = useSelectionStore((s) => s.selectedIds);
  const nodes = useNodeTreeStore((s) => s.nodes);
  const rootIds = useNodeTreeStore((s) => s.rootIds);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("UI/UX");
  const [tags, setTags] = useState("hero,landing");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState(mode === "publish" ? "public" : "private");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const targetRootId = useMemo(() => {
    const selected = nodes[selectedIds[0]];
    if (selected?.type === "frame") return selected.id;
    const frame = rootIds
      .map((id) => nodes[id])
      .find((n) => n?.type === "frame");
    return frame?.id;
  }, [selectedIds, nodes, rootIds]);

  if (!open) return null;

  const handleSave = async () => {
    if (!targetRootId) {
      setMessage("Select a frame to save as template.");
      return;
    }
    setBusy(true);
    try {
      const meta = {
        name: name || nodes[targetRootId]?.name || "Template",
        category,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        description,
        visibility,
      };
      const template = exportTemplate(targetRootId, nodes, meta);
      const thumbBlob = (await captureDomThumbnail()) || (await generateTemplateThumbnail(template));
      const form = new FormData();
      form.append("metadata", JSON.stringify(meta));
      form.append("template", new Blob([JSON.stringify(template)], { type: "application/json" }), `${template.id}.json`);
      if (thumbBlob) form.append("thumbnail", thumbBlob, `${template.id}.png`);
      form.append("visibility", visibility);
      const endpoint = mode === "publish" ? "/api/templates/publish" : "/api/templates/save";
      await fetch(endpoint, { method: "POST", body: form });
      setMessage(mode === "publish" ? "Template published." : "Template saved.");
    } catch (err) {
      console.error("Failed to save template", err);
      setMessage("Save failed. Check console.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-[520px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-neutral-900">
              {mode === "publish" ? "Publish Template" : "Save as Template"}
            </div>
            <div className="text-xs text-neutral-500">Export current frame with metadata and thumbnail.</div>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 px-2 py-1 rounded-md hover:bg-neutral-100"
          >
            Close
          </button>
        </div>

        <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500 mb-1">Name</div>
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Landing Hero" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500 mb-1">Category</div>
              <input className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500 mb-1">Tags (comma)</div>
              <input className={inputClass} value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500 mb-1">Description</div>
            <textarea
              className={`${inputClass} min-h-[80px]`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short summary"
            />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500 mb-1">Visibility</div>
            <select className={inputClass} value={visibility} onChange={(e) => setVisibility(e.target.value)}>
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
          </div>
          {message ? <div className="text-xs text-neutral-600">{message}</div> : null}
        </div>

        <div className="px-4 py-3 border-t border-neutral-200 flex items-center justify-end gap-2 bg-neutral-50/70">
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-md border border-neutral-200 bg-white text-sm text-neutral-700 hover:border-neutral-300"
            disabled={busy}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-2 rounded-md bg-violet-500 text-white text-sm font-semibold shadow-sm hover:bg-violet-600 disabled:opacity-60"
            disabled={busy}
          >
            {busy ? "Saving..." : mode === "publish" ? "Publish" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

async function blobToUint8(blob) {
  const buf = await blob.arrayBuffer();
  return Array.from(new Uint8Array(buf));
}

async function captureDomThumbnail() {
  try {
    const target = document.getElementById("uiux-canvas-area");
    if (!target) return null;
    const canvas = await html2canvas(target, {
      backgroundColor: "#ffffff",
      scale: 1,
      useCORS: true,
      allowTaint: true,
      logging: false,
    });
    return await new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/png"));
  } catch (err) {
    console.warn("DOM thumbnail capture failed, falling back", err);
    return null;
  }
}
