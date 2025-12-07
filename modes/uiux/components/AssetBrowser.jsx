"use client";

import { ASSET_CATALOG, useAssetBrowserStore } from "@/zustand/assetBrowserStore";
import { useNodeTreeStore } from "@/zustand/nodeTreeStore";
import { useSelectionStore } from "@/zustand/selectionStore";
import { useCanvasState } from "@/lib/canvas-core/canvasState";
import { useEffect, useMemo, useState } from "react";
import { useComponentStore } from "@/zustand/componentStore";

const tabs = [
  { id: "templates", label: "Templates" },
  { id: "assets", label: "Assets" },
  { id: "icons", label: "Icons" },
  { id: "components", label: "Components" },
];

const Tag = ({ label }) => (
  <span className="inline-flex items-center px-2 py-1 text-[11px] font-semibold rounded-full bg-white/80 text-neutral-700 border border-white/70 shadow-sm">
    {label}
  </span>
);

export default function AssetBrowser() {
  const open = useAssetBrowserStore((s) => s.open);
  const tab = useAssetBrowserStore((s) => s.tab);
  const search = useAssetBrowserStore((s) => s.search);
  const setTab = useAssetBrowserStore((s) => s.setTab);
  const setSearch = useAssetBrowserStore((s) => s.setSearch);
  const category = useAssetBrowserStore((s) => s.category);
  const setCategory = useAssetBrowserStore((s) => s.setCategory);
  const close = useAssetBrowserStore((s) => s.closeBrowser);

  const addNode = useNodeTreeStore((s) => s.addNode);
  const rootIds = useNodeTreeStore((s) => s.rootIds);
  const setSelectedManual = useSelectionStore((s) => s.setSelectedManual);
  const pan = useCanvasState((s) => s.pan);
  const zoom = useCanvasState((s) => s.zoom);
  const components = useComponentStore((s) => s.components);
  const setDraggingComponent = useComponentStore((s) => s.setDraggingComponent);
  const clearDraggingComponent = useComponentStore((s) => s.clearDraggingComponent);

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || tab !== "templates") return;
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category && category !== "All") params.set("category", category);
        if (search) params.set("q", search);
        const res = await fetch(`/api/templates/marketplace?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setTemplates(data.templates || []);
      } catch (err) {
        if (err.name !== "AbortError") console.error("Failed to load templates", err);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [open, tab, category, search]);

  const catalogForTab = useMemo(() => {
    if (tab === "templates") return templates;
    if (tab === "components") {
      return Object.values(components || {}).map((c) => ({
        id: c.id,
        type: "component",
        name: c.name || c.id,
        category: "Component",
        width: 400,
        height: 300,
        previewUrl: null,
      }));
    }
    return ASSET_CATALOG.filter((item) => {
      const matchTab =
        (tab === "assets" && item.type === "asset") ||
        (tab === "icons" && item.type === "icon") ||
        (tab === "components" && item.type === "component");
      return matchTab;
    });
  }, [tab, templates, components]);

  const categories = ["All", ...new Set(catalogForTab.map((i) => i.category || "Uncategorized"))];

  const filtered = catalogForTab.filter((item) => {
    const matchSearch = item.name?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "All" || item.category === category || (!item.category && category === "Uncategorized");
    return matchSearch && matchCategory;
  });

  const insertItem = (item) => {
    const id = crypto.randomUUID();
    const viewport = {
      width: typeof window !== "undefined" ? window.innerWidth : 1200,
      height: typeof window !== "undefined" ? window.innerHeight : 800,
    };
    const sidebarLeft = 240;
    const sidebarRight = 280;
    const topBar = 64;
    const bottomBar = 64;
    const canvasCenter = {
      x: (viewport.width - sidebarLeft - sidebarRight) / 2 + sidebarLeft,
      y: (viewport.height - topBar - bottomBar) / 2 + topBar,
    };

    const centerX = (canvasCenter.x - pan.x) / zoom;
    const centerY = (canvasCenter.y - pan.y) / zoom;

    const baseNode = {
      id,
      name: item.name,
      x: Number.isFinite(centerX) ? centerX : 200,
      y: Number.isFinite(centerY) ? centerY : 200,
      width: item.width || 400,
      height: item.height || 400,
      rotation: 0,
      children: [],
      parent: null,
    };

    if (item.type === "template") {
      addNode({ ...baseNode, type: "frame" });
    } else if (item.type === "asset" || item.type === "icon") {
      addNode({
        ...baseNode,
        type: "image",
        src: item.previewUrl || item.preview,
      });
    } else if (item.type === "component") {
      addNode({
        ...baseNode,
        type: "component-instance",
        componentId: item.id,
        variantId: null,
        propOverrides: {},
        nodeOverrides: {},
      });
    } else {
      addNode({ ...baseNode, type: "frame" });
    }
    setSelectedManual([id]);
    close();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-[900px] max-w-[95vw] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-white/90 backdrop-blur">
          <div className="flex items-center gap-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition border ${
                  tab === t.id
                    ? "bg-violet-500/10 border-violet-500 text-violet-700"
                    : "bg-white border-neutral-200 text-neutral-700 hover:border-violet-200 hover:bg-violet-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            onClick={close}
            className="text-sm font-semibold text-neutral-600 hover:text-neutral-900 px-3 py-1 rounded-md hover:bg-neutral-100"
          >
            Close
          </button>
        </div>

        <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50/60">
          <div className="flex flex-col gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates, assets, icons..."
              className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-500 transition"
            />
            <div className="flex items-center gap-2 overflow-x-auto">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
                    category === c
                      ? "bg-violet-500/10 border-violet-500 text-violet-700"
                      : "bg-white border-neutral-200 text-neutral-700 hover:border-violet-200 hover:bg-violet-50"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 overflow-y-auto">
          {loading && tab === "templates" ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                  <div className="h-40 w-full bg-neutral-200 animate-pulse" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-neutral-200 rounded w-2/3 animate-pulse" />
                    <div className="h-3 bg-neutral-200 rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="h-48 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 flex items-center justify-center text-neutral-500 text-sm">
              No results. Try a different search or tab.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden flex flex-col"
                  draggable={item.type === "component"}
                  onDragStart={(e) => {
                    if (item.type === "component") {
                      e.dataTransfer.setData("application/x-component-id", item.id);
                      setDraggingComponent(item.id);
                    }
                  }}
                  onDragEnd={() => clearDraggingComponent()}
                >
                  <div
                    className="h-40 w-full"
                    style={{
                      backgroundImage: item.previewUrl ? `url(${item.previewUrl})` : item.preview,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-neutral-900">{item.name}</div>
                        <div className="text-xs text-neutral-500">{item.category}</div>
                      </div>
                      <Tag label={item.type} />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="flex-1 px-3 py-2 rounded-md bg-violet-500 text-white text-sm font-semibold shadow-sm hover:bg-violet-600 transition"
                        onClick={() => insertItem(item)}
                      >
                        Insert
                      </button>
                      <button className="px-3 py-2 rounded-md border border-neutral-200 bg-white text-sm text-neutral-700 hover:border-violet-200 hover:bg-violet-50 transition">
                        Preview
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
