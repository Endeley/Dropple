"use client";

import { useMemo } from "react";
import { exportLayerToJSX } from "@/lib/exportToCode";
import { exportMotionComponent } from "@/lib/exportMotionToCode";
import { buildStarterPack, validateMotionPack } from "@/lib/motionPack";
import { exportThemeToCSS } from "@/lib/exportThemeToCSS";
import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";

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
        </div>
      </div>
    </div>
  );
}
