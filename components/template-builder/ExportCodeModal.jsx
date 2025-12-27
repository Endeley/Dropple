"use client";

import { useMemo } from "react";
import { exportLayerToJSX } from "@/engine/export/exportToCode";
import { exportMotionComponent } from "@/engine/export/exportMotionToCode";
import { buildStarterPack, validateMotionPack } from "@/engine/motion/motionPack";
import { exportThemeToCSS } from "@/engine/export/exportThemeToCSS";
import { useTemplateBuilderStore } from "@/runtime/stores/useTemplateBuilderStore";
import { generateTemplateThumbnail } from "@/lib/templates/exportTemplate";

export default function ExportCodeModal() {
  const {
    exportModalOpen,
    setExportModalOpen,
    selectedLayers,
    currentTemplate,
    components,
    isEditingComponent,
    editingComponentId,
    editingVariantId,
    themes,
    activeThemeId,
    pages,
    timeline,
  } = useTemplateBuilderStore();

  const contextLayers = useMemo(() => {
    if (isEditingComponent && editingComponentId) {
      const comp = components.find((c) => c._id === editingComponentId);
      if (!comp) return [];
      return editingVariantId
        ? comp.variants?.find((v) => v.id === editingVariantId)?.nodes || []
        : comp.nodes || [];
    }
    return currentTemplate.layers || [];
  }, [components, currentTemplate.layers, editingComponentId, editingVariantId, isEditingComponent]);

  const layer = useMemo(() => {
    const id = selectedLayers?.[0];
    if (!id) return null;
    return contextLayers.find((l) => l.id === id) || null;
  }, [contextLayers, selectedLayers]);

  const code = useMemo(() => {
    if (!layer) return "";
    const hasMotion = layer.animations?.length || contextLayers.some((l) => l.animations?.length);
    return hasMotion
      ? exportMotionComponent(layer, contextLayers)
      : exportLayerToJSX(layer, contextLayers, 0, { components });
  }, [components, contextLayers, layer]);

  const activeTheme = useMemo(() => {
    if (!activeThemeId) return themes?.[0];
    return themes.find((t) => t._id === activeThemeId) || themes?.[0];
  }, [activeThemeId, themes]);

  const themeCss = useMemo(() => exportThemeToCSS(activeTheme), [activeTheme]);

  const motionPackJson = useMemo(() => {
    const pack = buildStarterPack();
    const validation = validateMotionPack(pack);
    return validation.valid ? JSON.stringify(pack, null, 2) : JSON.stringify({ error: validation.errors }, null, 2);
  }, []);

  if (!exportModalOpen || !layer) return null;

  const close = () => setExportModalOpen(false);

  const download = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${layer.name || "Component"}.jsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch (err) {
      console.error("Failed to copy code", err);
    }
  };

  const copyTheme = async () => {
    if (!themeCss) return;
    try {
      await navigator.clipboard.writeText(themeCss);
    } catch (err) {
      console.error("Failed to copy theme CSS", err);
    }
  };

  const copyMotionPack = async () => {
    try {
      await navigator.clipboard.writeText(motionPackJson);
    } catch (err) {
      console.error("Failed to copy motion pack", err);
    }
  };

  const downloadMotionPack = () => {
    const blob = new Blob([motionPackJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${layer.name || "MotionPack"}.dropple-motionpack.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadTheme = () => {
    if (!themeCss) return;
    const blob = new Blob([themeCss], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeTheme?.name || "theme"}.css`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadTemplateJson = () => {
    const tpl = {
      ...currentTemplate,
      layers: pages?.find((p) => p.id === currentTemplate.activePageId)?.layers || currentTemplate.layers || [],
    };
    const blob = new Blob([JSON.stringify(tpl, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tpl.name || "template"}.dropple.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPNG = async () => {
    try {
      const tpl = {
        ...currentTemplate,
        layers: pages?.find((p) => p.id === currentTemplate.activePageId)?.layers || currentTemplate.layers || [],
      };
      const blob = await generateTemplateThumbnail(tpl);
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tpl.name || "template"}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PNG export failed", err);
    }
  };

  const downloadWebM = () => {
    const target = document.querySelector("[data-builder-canvas]");
    const stream = target?.captureStream?.(30) || target?.querySelector("canvas")?.captureStream?.(30);
    if (!stream) {
      console.warn("captureStream not supported on target");
      return;
    }
    const durationMs = (timeline?.duration || 4000);
    const chunks = [];
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentTemplate?.name || "template"}.webm`;
      a.click();
      URL.revokeObjectURL(url);
    };
    recorder.start();
    setTimeout(() => recorder.stop(), durationMs);
  };

  const downloadAnimatedServer = async () => {
    try {
      const tpl = {
        ...currentTemplate,
        layers: pages?.find((p) => p.id === currentTemplate.activePageId)?.layers || currentTemplate.layers || [],
      };
      const durationMs = timeline?.duration || 4000;
      const res = await fetch("/api/export-animated", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template: tpl,
          durationMs,
          width: tpl.width || 1080,
          height: tpl.height || 1080,
          format: "webm",
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Animated export failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tpl.name || "template"}.webm`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Server animated export failed", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[760px] max-w-[92vw] rounded-lg shadow-2xl p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold">Export to Code</h2>
            <p className="text-sm text-slate-500">
              JSX + Tailwind generated from your selection.
            </p>
          </div>
          <button
            onClick={close}
            className="px-3 py-1.5 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            Close
          </button>
        </div>

        <textarea
          className="w-full h-96 border border-slate-200 rounded-md p-3 font-mono text-sm bg-slate-50 text-slate-900"
          readOnly
          value={code}
        />

        {themeCss && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Theme CSS Variables</h3>
            <textarea
              className="w-full h-40 border border-slate-200 rounded-md p-3 font-mono text-sm bg-slate-50 text-slate-900"
              readOnly
              value={themeCss}
            />
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Motion Pack (starter)</h3>
          <textarea
            className="w-full h-40 border border-slate-200 rounded-md p-3 font-mono text-sm bg-slate-50 text-slate-900"
            readOnly
            value={motionPackJson}
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={copy}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
          >
            Copy
          </button>
          <button
            onClick={download}
            className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
          >
            Download JSX
          </button>
          {themeCss && (
            <>
              <button
                onClick={copyTheme}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
              >
                Copy CSS Vars
              </button>
              <button
                onClick={downloadTheme}
                className="px-4 py-2 rounded-md bg-teal-600 text-white hover:bg-teal-700 shadow-sm"
              >
                Download Theme
              </button>
            </>
          )}
          <button
            onClick={copyMotionPack}
            className="px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 shadow-sm"
          >
            Copy Motion Pack
          </button>
          <button
            onClick={downloadMotionPack}
            className="px-4 py-2 rounded-md bg-fuchsia-600 text-white hover:bg-fuchsia-700 shadow-sm"
          >
            Download Motion Pack
          </button>
          <button
            onClick={downloadTemplateJson}
            className="px-4 py-2 rounded-md bg-slate-700 text-white hover:bg-slate-800 shadow-sm"
          >
            Download JSON
          </button>
          <button
            onClick={downloadPNG}
            className="px-4 py-2 rounded-md bg-amber-600 text-white hover:bg-amber-700 shadow-sm"
          >
            Download PNG
          </button>
          <button
            onClick={downloadWebM}
            className="px-4 py-2 rounded-md bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
          >
            Download WebM (beta)
          </button>
          <button
            onClick={downloadAnimatedServer}
            className="px-4 py-2 rounded-md bg-orange-600 text-white hover:bg-orange-700 shadow-sm"
          >
            Download WebM (server)
          </button>
        </div>
      </div>
    </div>
  );
}
