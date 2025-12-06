"use client";

import BuilderHeader from "@/components/template-builder/BuilderHeader";
import TemplateToolbar from "@/components/template-builder/TemplateToolbar";
import BuilderSidebar from "@/components/template-builder/BuilderSidebar";
import BuilderCanvas from "@/components/template-builder/BuilderCanvas";
import BuilderRightPanel from "@/components/template-builder/BuilderRightPanel";
import TimelineDock from "@/components/template-builder/TimelineDock";
import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";
import { useEffect } from "react";

export default function CreateTemplatePage() {
  const {
    currentTemplate,
    setEditingMode,
    setComponents,
    components,
    addImageLayer,
  } = useTemplateBuilderStore();

  useEffect(() => {
    const storedAI =
      typeof window !== "undefined" ? localStorage.getItem("AI_TEMPLATE") : null;
    const stored = typeof window !== "undefined" ? localStorage.getItem("LOADED_TEMPLATE") : null;
    const storedComponent =
      typeof window !== "undefined" ? localStorage.getItem("ADD_COMPONENT") : null;
    const storedAsset =
      typeof window !== "undefined" ? localStorage.getItem("USE_ASSET") : null;

    if (storedAI) {
      try {
        const tpl = JSON.parse(storedAI);
        const page = {
          id: "page_1",
          name: tpl.name || "Generated Page",
          artboards: [],
          layers: tpl.layers || [],
        };
        const newId = tpl.id || crypto.randomUUID();

        useTemplateBuilderStore.setState({
          currentTemplate: {
            ...currentTemplate,
            id: newId,
            name: tpl.name || "AI Template",
            description: tpl.description || "",
            mode: tpl.mode || "uiux",
            width: tpl.width || currentTemplate.width || 1440,
            height: tpl.height || currentTemplate.height || 1024,
            layers: tpl.layers || [],
            tags: tpl.tags || [],
            thumbnail: tpl.thumbnail || "",
          },
          pages: [page],
          activePageId: page.id,
        });
      } catch (err) {
        console.error("Failed to import AI template", err);
      } finally {
        localStorage.removeItem("AI_TEMPLATE");
      }
    } else if (stored) {
      try {
        const tpl = JSON.parse(stored);
        const newId = crypto.randomUUID();
        const layers = tpl.layers || [];
        const page = {
          id: "page_1",
          name: tpl.name || "Page 1",
          artboards: [],
          layers,
        };

        useTemplateBuilderStore.setState({
          currentTemplate: {
            ...currentTemplate,
            id: newId,
            name: tpl.name || "Imported Template",
            description: tpl.description || "",
            mode: tpl.mode || "uiux",
            width: tpl.width || currentTemplate.width || 1440,
            height: tpl.height || currentTemplate.height || 1024,
            layers,
            tags: tpl.tags || [],
            thumbnail: tpl.thumbnail || "",
          },
          pages: [page],
          activePageId: page.id,
        });
      } catch (err) {
        console.error("Failed to import template from marketplace", err);
      } finally {
        localStorage.removeItem("LOADED_TEMPLATE");
      }
    } else if (!currentTemplate.id) {
      const newId = crypto.randomUUID();
      useTemplateBuilderStore.setState({
        currentTemplate: { ...currentTemplate, id: newId },
      });
    }

    if (storedComponent) {
      try {
        const comp = JSON.parse(storedComponent);
        const existing = components || [];
        const id = comp._id || comp.id || "comp_" + crypto.randomUUID();
        let parsedNodes = comp.nodes || [];
        if ((!parsedNodes || parsedNodes.length === 0) && typeof comp.componentJSON === "string") {
          try {
            const parsed = JSON.parse(comp.componentJSON);
            parsedNodes = parsed.nodes || parsed;
          } catch (e) {
            console.warn("Failed to parse component JSON, using fallback nodes");
          }
        }

        const normalized = {
          _id: id,
          name: comp.name || comp.title || "Imported Component",
          description: comp.description || "",
          category: comp.category || "UI Kit",
          tags: comp.tags || [],
          previewImage: comp.previewImage || "",
          nodes: parsedNodes || [],
          variants: comp.variants || [],
          componentJSON: comp.componentJSON,
          price: comp.price ?? 0,
        };
        const next = existing.find((c) => c._id === id)
          ? existing
          : [...existing, normalized];
        setComponents(next);
      } catch (err) {
        console.error("Failed to import component from marketplace", err);
      } finally {
        localStorage.removeItem("ADD_COMPONENT");
      }
    }

    if (storedAsset) {
      try {
        const asset = JSON.parse(storedAsset);
        const url = asset.url || asset.fileUrl || asset.previewUrl;
        if (url) {
          addImageLayer(url);
        }
      } catch (err) {
        console.error("Failed to import asset into editor", err);
      } finally {
        localStorage.removeItem("USE_ASSET");
      }
    }
    setEditingMode(false);
  }, [addImageLayer, components, currentTemplate, setComponents, setEditingMode]);

  return (
    <div className="w-full min-h-screen flex flex-col bg-slate-50 text-gray-900">
      {/* Header */}
      <BuilderHeader />

      {/* Toolbar */}
      <TemplateToolbar />

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar (Layers / Assets) */}
        <BuilderSidebar />

        {/* Canvas */}
        <BuilderCanvas />

        {/* Right Panel (Inspector / Properties) */}
        <BuilderRightPanel />
      </div>

      {/* Timeline */}
      <TimelineDock />
    </div>
  );
}
