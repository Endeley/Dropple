"use client";
import { useState } from "react";
import AssetLibrary from "./AssetLibrary";
import ComponentLibrary from "./ComponentLibrary";
import LayerTree from "./layers/LayerTree";
import ThemeSwitcher from "./ThemeSwitcher";
import ThemeEditor from "./ThemeEditor";
import AssetManager from "./AssetManager";
import ComponentAIGenerator from "@/components/ai/ComponentAIGenerator";
import AssetAIGenerator from "@/components/ai/AssetAIGenerator";
import TemplateAIGenerator from "@/components/ai/TemplateAIGenerator";
import AnimationAIGenerator from "@/components/ai/AnimationAIGenerator";
import BrandKitGenerator from "@/components/ai/BrandKitGenerator";
import DesignCriticPanel from "@/components/ai/DesignCriticPanel";
import PrototypeAIGenerator from "@/components/ai/PrototypeAIGenerator";
import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";

export default function BuilderSidebar() {
  const [tab, setTab] = useState("layers");
  const addImageLayer = useTemplateBuilderStore((s) => s.addImageLayer);

  return (
    <div className="w-72 h-full border-r border-slate-200 bg-white shadow-sm flex flex-col text-gray-900">
      <div className="flex">
        {["layers", "assets", "components", "themes"].map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2 border-b border-slate-200 text-center capitalize ${
              tab === key
                ? "bg-slate-100 font-semibold text-slate-900"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {tab === "assets" && (
          <div className="p-3 space-y-3">
            <AssetAIGenerator
              onGenerated={(url) => {
                if (!url) return;
                addImageLayer(url);
              }}
            />
            <label className="block">
              <span className="px-3 py-2 bg-blue-600 text-white rounded cursor-pointer">
                Upload Image
              </span>
              <input
                type="file"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const formData = new FormData();
                  formData.append("file", file);

                  await fetch("/api/assets/upload", {
                    method: "POST",
                    body: formData,
                  });
                }}
              />
            </label>
            <AssetManager />
          </div>
        )}

        {tab === "components" && (
          <div className="p-3 space-y-4">
            <ComponentAIGenerator />
            <ComponentLibrary />
          </div>
        )}

        {tab === "themes" && (
          <div className="flex-1 overflow-auto space-y-3 p-3">
            <BrandKitGenerator />
            <ThemeSwitcher />
            <ThemeEditor />
          </div>
        )}

        {tab === "layers" && (
          <div className="p-3 space-y-3">
            <DesignCriticPanel />
            <PrototypeAIGenerator />
            <AnimationAIGenerator />
            <TemplateAIGenerator />
            <LayerTree />
          </div>
        )}
      </div>
    </div>
  );
}
