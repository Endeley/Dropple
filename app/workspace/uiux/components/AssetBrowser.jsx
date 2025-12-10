"use client";

import { ASSET_CATALOG, useAssetBrowserStore } from "@/zustand/assetBrowserStore";
import { useNodeTreeStore } from "@/zustand/nodeTreeStore";
import { useSelectionStore } from "@/zustand/selectionStore";
import { useCanvasState } from "@/lib/canvas-core/canvasState";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { logTemplateEvent, toggleFavorite } from "@/utils/logTemplateEvent.js";
import { useComponentStore } from "@/zustand/componentStore";
import { useAssetStore } from "@/zustand/assetStore";
import TemplateDetailModal from "./TemplateDetailModal.jsx";
import TemplateAIAdvancedModal from "./TemplateAIAdvancedModal.jsx";

const FALLBACK_TEMPLATES = [
  {
    id: "tpl-hero-minimal",
    type: "template",
    name: "Minimal Hero",
    category: "Website",
    tags: ["hero", "minimal", "light"],
    width: 1440,
    height: 900,
    previewUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    isLocal: true,
    insertCount: 0,
    viewCount: 0,
    favoriteCount: 0,
  },
  {
    id: "tpl-dashboard",
    type: "template",
    name: "Dashboard Overview",
    category: "Dashboard",
    tags: ["dashboard", "dark", "data"],
    width: 1440,
    height: 1024,
    previewUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
    isLocal: true,
    insertCount: 0,
    viewCount: 0,
    favoriteCount: 0,
  },
  {
    id: "tpl-mobile-app",
    type: "template",
    name: "Mobile App UI",
    category: "Mobile",
    tags: ["mobile", "app", "light"],
    width: 390,
    height: 844,
    previewUrl: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=80",
    isLocal: true,
    insertCount: 0,
    viewCount: 0,
    favoriteCount: 0,
  },
  {
    id: "tpl-portfolio",
    type: "template",
    name: "Portfolio Grid",
    category: "Portfolio",
    tags: ["portfolio", "grid", "gallery"],
    width: 1440,
    height: 900,
    previewUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    isLocal: true,
    insertCount: 0,
    viewCount: 0,
    favoriteCount: 0,
  },
];

const TEMPLATE_PLACEHOLDER =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80";

const tabs = [
  { id: "templates", label: "Templates" },
  { id: "my-templates", label: "My Templates" },
  { id: "assets", label: "Assets" },
  { id: "icons", label: "Icons" },
  { id: "components", label: "Components" },
  { id: "cloud", label: "Cloud Assets" },
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
  const sort = useAssetBrowserStore((s) => s.sort);
  const setSort = useAssetBrowserStore((s) => s.setSort);
  const close = useAssetBrowserStore((s) => s.closeBrowser);

  const addNode = useNodeTreeStore((s) => s.addNode);
  const rootIds = useNodeTreeStore((s) => s.rootIds);
  const setSelectedManual = useSelectionStore((s) => s.setSelectedManual);
  const pan = useCanvasState((s) => s.pan);
  const zoom = useCanvasState((s) => s.zoom);
  const components = useComponentStore((s) => s.components);
  const assets = useAssetStore((s) => s.assets);
  const setDraggingComponent = useComponentStore((s) => s.setDraggingComponent);
  const clearDraggingComponent = useComponentStore((s) => s.clearDraggingComponent);

  const [templates, setTemplates] = useState([]);
  const [myTemplates, setMyTemplates] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [recent, setRecent] = useState([]);
  const [collections, setCollections] = useState([]);
  const [packs, setPacks] = useState([]);
  const [stats, setStats] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [layoutFilter, setLayoutFilter] = useState("All");
  const [styleFilter, setStyleFilter] = useState("All");
  const [colorFilter, setColorFilter] = useState("All");
  const [aiTargetTemplate, setAiTargetTemplate] = useState(null);

  useEffect(() => {
    if (!open || tab !== "templates") return;
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category && category !== "All") params.set("category", category);
        if (sort) params.set("sort", sort);
        if (search) params.set("q", search);
        const res = await fetch(`/api/templates/marketplace?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        const incoming = data.templates || [];
        setTemplates(incoming.length ? incoming : FALLBACK_TEMPLATES);
      } catch (err) {
        if (err.name !== "AbortError") console.error("Failed to load templates", err);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [open, tab, category, search, sort]);

  useEffect(() => {
    if (!open || tab !== "templates") return;
    const controller = new AbortController();
    const load = async () => {
      try {
        const res = await fetch("/api/templates/recommended", { signal: controller.signal });
        const data = await res.json();
        const list = data.templates || [];
        setRecommended(list.length ? list : FALLBACK_TEMPLATES.slice(0, 2));
      } catch (err) {
        if (err.name !== "AbortError") console.error("Failed to load recommended", err);
      }
    };
    load();
    return () => controller.abort();
  }, [open, tab]);

  useEffect(() => {
    if (!open || tab !== "templates") return;
    const controller = new AbortController();
    const load = async () => {
      try {
        const [tRes, pRes, rRes] = await Promise.all([
          fetch("/api/templates/trending", { signal: controller.signal }),
          fetch("/api/templates/popular", { signal: controller.signal }),
          fetch("/api/templates/recent", { signal: controller.signal }),
        ]);
        const [tData, pData, rData] = await Promise.all([tRes.json(), pRes.json(), rRes.json()]);
        const t = tData.templates || [];
        const p = pData.templates || [];
        const r = rData.templates || [];
        setTrending(t.length ? t : FALLBACK_TEMPLATES.slice(0, 2));
        setPopular(p.length ? p : FALLBACK_TEMPLATES.slice(0, 2));
        setRecent(r.length ? r : FALLBACK_TEMPLATES.slice(0, 2));
      } catch (err) {
        if (err.name !== "AbortError") console.error("Failed to load template lists", err);
      }
    };
    load();
    return () => controller.abort();
  }, [open, tab]);

  useEffect(() => {
    const loadDetailData = async () => {
      if (!selectedTemplate?.id || selectedTemplate.type !== "template" || selectedTemplate.isLocal) {
        setStats(null);
        setRelated([]);
        return;
      }
      try {
        const [sRes, recRes] = await Promise.all([
          fetch(`/api/templates/stats?id=${selectedTemplate.id}`),
          fetch("/api/templates/recommended"),
        ]);
        const sData = await sRes.json();
        setStats(sData.stats || null);
        const recData = await recRes.json();
        const rel = (recData.templates || []).filter((t) => t.id !== selectedTemplate.id).slice(0, 4);
        setRelated(rel);
      } catch (err) {
        console.error("Failed to load detail metadata", err);
      }
    };
    loadDetailData();
  }, [selectedTemplate]);

  useEffect(() => {
    if (!open || tab !== "templates") return;
    const controller = new AbortController();
    const load = async () => {
      try {
        const [tRes, pRes, rRes, colRes, pkRes] = await Promise.all([
          fetch("/api/templates/trending", { signal: controller.signal }),
          fetch("/api/templates/popular", { signal: controller.signal }),
          fetch("/api/templates/recent", { signal: controller.signal }),
          fetch("/api/templates/collections", { signal: controller.signal }),
          fetch("/api/templates/packs", { signal: controller.signal }),
        ]);
        const tData = await tRes.json();
        const pData = await pRes.json();
        const rData = await rRes.json();
        const colData = await colRes.json();
        const pkData = await pkRes.json();
        setTrending(tData.templates || []);
        setPopular(pData.templates || []);
        setRecent(rData.templates || []);
        setCollections(colData.collections || []);
        setPacks(pkData.packs || []);
      } catch (err) {
        if (err.name !== "AbortError") console.error("Failed to load sections", err);
      }
    };
    load();
    return () => controller.abort();
  }, [open, tab]);

  useEffect(() => {
    if (!open || tab !== "my-templates") return;
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/templates/list", { signal: controller.signal });
        const data = await res.json();
        setMyTemplates(data.templates || []);
      } catch (err) {
        if (err.name !== "AbortError") console.error("Failed to load my templates", err);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [open, tab]);

  const catalogForTab = useMemo(() => {
    if (tab === "templates") return templates;
    if (tab === "my-templates") return (myTemplates || []).map((t) => ({
      id: t.id || t._id,
      type: "template",
      name: t.name,
      category: t.category || "General",
      creator: t.authorId || t.userId || "",
      width: t.width,
      height: t.height,
      previewUrl: t.previewUrl || t.thumbnailUrl || t.thumbnail || TEMPLATE_PLACEHOLDER,
    }));
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
    if (tab === "cloud") {
      return Object.values(assets || {}).map((a) => ({
        id: a.id,
        type: a.type || "asset",
        name: a.name || a.id,
        category: a.type === "component" ? "Component" : "Asset",
        width: a.size?.width || 400,
        height: a.size?.height || 300,
        previewUrl: a.variants?.thumbnail || a.url,
      }));
    }
    return ASSET_CATALOG.filter((item) => {
      const matchTab =
        (tab === "assets" && item.type === "asset") ||
        (tab === "icons" && item.type === "icon") ||
        (tab === "components" && item.type === "component") ||
        (tab === "cloud" && item.type === "asset");
      return matchTab;
    });
  }, [tab, templates, components, assets, myTemplates]);

  const defaultCategories = [
    "All",
    "Website",
    "Mobile",
    "Hero Sections",
    "Dashboard",
    "E-commerce",
    "Portfolio",
    "Marketing",
    "Wireframes",
    "Presentations",
    "Branding",
    "Social Media",
  ];
  const categories = [...new Set([...defaultCategories, ...catalogForTab.map((i) => i.category || "Uncategorized")])];
  const layoutOptions = ["All", "Hero", "Dashboard", "Card", "Footer", "Pricing", "Nav", "Form", "Gallery"];
  const styleOptions = ["All", "Minimal", "Dark", "Gradient", "Playful", "Glass", "Brutalist"];
  const colorOptions = ["All", "Light", "Dark", "Colorful", "Pastel", "Neon"];

  const tagMatches = (value, tags = []) => {
    if (!value || value === "All") return true;
    const lower = value.toLowerCase();
    return tags.some((t) => t?.toLowerCase().includes(lower));
  };

  const filtered = catalogForTab.filter((item) => {
    const tags = item.tags || [];
    const matchSearch = item.name?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "All" || item.category === category || (!item.category && category === "Uncategorized");
    const matchLayout = tagMatches(layoutFilter, tags);
    const matchStyle = tagMatches(styleFilter, tags);
    const matchColor = tagMatches(colorFilter, tags);
    return matchSearch && matchCategory && matchLayout && matchStyle && matchColor;
  });
  const hasActiveFilters =
    (search && search.trim().length > 0) ||
    category !== "All" ||
    layoutFilter !== "All" ||
    styleFilter !== "All" ||
    colorFilter !== "All";

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setLayoutFilter("All");
    setStyleFilter("All");
    setColorFilter("All");
    setSort("recent");
  };

  const insertItem = async (item) => {
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

    if (item.type === "template" && item.isLocal) {
      // Local fallback template: insert a simple frame
      addNode({
        ...baseNode,
        type: "frame",
        background: "#ffffff",
      });
      setSelectedManual([id]);
      close();
      return;
    }

    if (item.type === "template") {
      const hasPremium = false; // TODO: replace with real subscription check
      const allowMarketplace = false;
      if (item.license === "pro" && !hasPremium) {
        alert("This template is Pro. Upgrade to use it.");
        return;
      }
      if (item.license === "marketplace" && !allowMarketplace) {
        alert("This template is Marketplace-locked.");
        return;
      }
      try {
        const res = await fetch(`/api/templates/${item.id}`);
        const template = await res.json();
        if (item.type === "template") logTemplateEvent(item.id, "insert");
        hydrateTemplate(template, baseNode);
      } catch (err) {
        console.error("Failed to insert template", err);
      }
    } else if (item.type === "asset" || item.type === "icon") {
      addNode({
        ...baseNode,
        type: "image",
        src: item.previewUrl || item.preview,
      });
      setSelectedManual([id]);
      close();
    } else if (item.type === "component") {
      addNode({
        ...baseNode,
        type: "component-instance",
        componentId: item.id,
        variantId: null,
        propOverrides: {},
        nodeOverrides: {},
      });
      setSelectedManual([id]);
      close();
    } else {
      addNode({ ...baseNode, type: "frame" });
      setSelectedManual([id]);
      close();
    }
  };

  const hydrateTemplate = (template, baseFrame) => {
    if (!template) return;
    const nodes = template.nodes || [];
    const animations = template.animations || [];
    const idMap = {};
    nodes.forEach((n) => {
      idMap[n.id] = crypto.randomUUID();
    });

    const cloned = {};
    nodes.forEach((n) => {
      const children = (n.children || []).map((cid) => idMap[cid]);
      const props = n.props || {};
      const mapped = {
        id: idMap[n.id],
        type: n.type || "frame",
        name: n.name || template.name || "Template",
        children,
        parent: null,
        ...props,
      };
      cloned[mapped.id] = mapped;
    });

    // Set parents based on children
    Object.values(cloned).forEach((node) => {
      (node.children || []).forEach((cid) => {
        if (cloned[cid]) cloned[cid].parent = node.id;
      });
    });

    // Find top-level nodes (no parent)
    const topLevelIds = Object.values(cloned)
      .filter((n) => !n.parent)
      .map((n) => n.id);

    // Attach animations to remapped nodes
    animations.forEach((anim) => {
      const targetId = anim.nodeId && idMap[anim.nodeId] ? idMap[anim.nodeId] : anim.nodeId;
      if (!targetId || !cloned[targetId]) return;
      const normalized = { ...anim, nodeId: targetId, id: anim.id || `anim_${crypto.randomUUID()}` };
      cloned[targetId].animations = [...(cloned[targetId].animations || []), normalized];
    });

    // Create root frame if needed
    const rootFrameId = baseFrame.id;
    const frameWidth = template.frame?.width || baseFrame.width;
    const frameHeight = template.frame?.height || baseFrame.height;
    const rootFrame = {
      ...baseFrame,
      type: "frame",
      width: frameWidth,
      height: frameHeight,
      children: topLevelIds,
      background: template.frame?.background || "#ffffff",
      parent: null,
    };

    // Attach top-level nodes to root frame
    topLevelIds.forEach((tid) => {
      if (cloned[tid]) cloned[tid].parent = rootFrameId;
    });

    const mapToInsert = { ...cloned, [rootFrameId]: rootFrame };

    // Center the frame on canvas
    mapToInsert[rootFrameId] = {
      ...mapToInsert[rootFrameId],
      x: baseFrame.x - frameWidth / 2,
      y: baseFrame.y - frameHeight / 2,
    };

    useNodeTreeStore.getState().insertSubtree(mapToInsert, [rootFrameId]);
    setSelectedManual([rootFrameId]);
    close();
  };

  const templateCard = (item) => (
    <div
      key={item.id}
      className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden flex flex-col group cursor-pointer"
      onClick={() => setSelectedTemplate(item)}
      draggable={item.type === "component"}
      onDragStart={(e) => {
        if (item.type === "component") {
          e.dataTransfer.setData("application/x-component-id", item.id);
          setDraggingComponent(item.id);
        }
      }}
      onDragEnd={() => clearDraggingComponent()}
    >
      <div className="relative h-40 w-full bg-neutral-100">
        {item.previewUrl || item.thumbnail || item.thumbnailUrl ? (
          <Image
            src={item.previewUrl || item.thumbnail || item.thumbnailUrl || TEMPLATE_PLACEHOLDER}
            alt={item.name}
            fill
            className="object-cover"
            sizes="320px"
          />
        ) : (
          <Image src={TEMPLATE_PLACEHOLDER} alt={item.name} fill className="object-cover" sizes="320px" />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
        <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
          <button
            className="flex-1 px-2 py-1 rounded-md bg-white text-xs font-semibold shadow"
            onClick={(e) => {
              e.stopPropagation();
              if (item.type === "template" && !item.isLocal) logTemplateEvent(item.id, "preview");
              insertItem(item);
            }}
          >
            Insert
          </button>
          <button
            className="px-2 py-1 rounded-md bg-white/90 text-xs font-semibold shadow"
            onClick={(e) => {
              e.stopPropagation();
              if (item.type === "template" && !item.isLocal) logTemplateEvent(item.id, "view");
              setSelectedTemplate(item);
            }}
          >
            Preview
          </button>
        </div>
      </div>
      <div className="p-3 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold text-neutral-900 truncate">{item.name}</div>
          <Tag label={item.category || "General"} />
        </div>
          <div className="text-xs text-neutral-500 flex items-center justify-between">
            <span>{item.width && item.height ? `${Math.round(item.width)}×${Math.round(item.height)}` : "Template"}</span>
            {item.creator ? <span className="text-[11px] text-neutral-500 truncate max-w-[120px]">by {item.creator}</span> : null}
          </div>
        {item.license && item.license !== "free" ? (
          <div className="text-[11px] text-amber-600 font-semibold">
            🔒 {item.license === "pro" ? "Pro" : "Marketplace"} {item.price ? `· $${item.price}` : ""}
          </div>
        ) : null}
        {(item.insertCount || item.viewCount || item.favoriteCount) ? (
          <div className="text-[11px] text-neutral-500 flex items-center gap-3">
            {item.insertCount ? <span>⬇ {item.insertCount}</span> : null}
            {item.viewCount ? <span>👁 {item.viewCount}</span> : null}
            {item.favoriteCount ? <span>❤ {item.favoriteCount}</span> : null}
            {item.type === "template" ? (
              <button
                className="text-[11px] text-violet-600 font-semibold"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(item.id);
                  logTemplateEvent(item.id, "favorite");
                }}
              >
                ❤ Favorite
              </button>
            ) : null}
          </div>
        ) : item.type === "template" ? (
          <button
            className="text-[11px] text-violet-600 font-semibold"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(item.id);
              logTemplateEvent(item.id, "favorite");
            }}
          >
            ❤ Favorite
          </button>
        ) : null}
        {item.tags?.length ? (
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((t) => (
              <span key={t} className="text-[10px] px-2 py-[2px] rounded-full bg-neutral-100 text-neutral-600">
                #{t}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );

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
            {tab === "templates" ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-[0.08em] text-neutral-500 font-semibold">Sort</span>
                <select
                  className="border border-neutral-200 rounded-md px-2 py-1 text-xs text-neutral-700 bg-white"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="recent">Recent</option>
                  <option value="trending">Trending</option>
                </select>
              </div>
            ) : null}
            {tab === "templates" ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1.5 rounded-md border border-neutral-200 text-xs text-neutral-700 hover:bg-neutral-100"
                    onClick={clearFilters}
                  >
                    Clear filters
                  </button>
                  {hasActiveFilters ? (
                    <span className="text-[11px] text-neutral-500">Filters active</span>
                  ) : null}
                </div>
                <div className="flex items-center gap-2 overflow-x-auto">
                  <span className="text-[11px] uppercase tracking-[0.08em] text-neutral-500 font-semibold">Layout</span>
                  {layoutOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setLayoutFilter(opt)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
                        layoutFilter === opt
                          ? "bg-violet-500/10 border-violet-500 text-violet-700"
                          : "bg-white border-neutral-200 text-neutral-700 hover:border-violet-200 hover:bg-violet-50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 overflow-x-auto">
                  <span className="text-[11px] uppercase tracking-[0.08em] text-neutral-500 font-semibold">Style</span>
                  {styleOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setStyleFilter(opt)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
                        styleFilter === opt
                          ? "bg-violet-500/10 border-violet-500 text-violet-700"
                          : "bg-white border-neutral-200 text-neutral-700 hover:border-violet-200 hover:bg-violet-50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 overflow-x-auto">
                  <span className="text-[11px] uppercase tracking-[0.08em] text-neutral-500 font-semibold">Color</span>
                  {colorOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setColorFilter(opt)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
                        colorFilter === opt
                          ? "bg-violet-500/10 border-violet-500 text-violet-700"
                          : "bg-white border-neutral-200 text-neutral-700 hover:border-violet-200 hover:bg-violet-50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
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
            <div className="h-48 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 flex flex-col items-center justify-center text-neutral-500 text-sm gap-2">
              <span>No results. Try a different search or tab.</span>
              {hasActiveFilters ? (
                <button
                  className="px-3 py-1.5 rounded-md border border-neutral-200 text-xs text-neutral-700 hover:bg-neutral-100"
                  onClick={clearFilters}
                >
                  Clear filters
                </button>
              ) : null}
            </div>
          ) : (
            <div className="space-y-4">
              {recommended.length ? (
                <div className="mb-2">
                  <div className="text-sm font-semibold text-neutral-800 mb-2">Recommended for you</div>
                  <div className="grid grid-cols-2 gap-3">
                    {recommended.slice(0, 4).map((item) => templateCard(item))}
                  </div>
                </div>
              ) : null}
              {trending.length ? (
                <div className="mb-2">
                  <div className="text-sm font-semibold text-neutral-800 mb-2">Trending</div>
                  <div className="grid grid-cols-2 gap-3">
                    {trending.slice(0, 4).map((item) => templateCard(item))}
                  </div>
                </div>
              ) : null}
              {popular.length ? (
                <div className="mb-2">
                  <div className="text-sm font-semibold text-neutral-800 mb-2">Popular</div>
                  <div className="grid grid-cols-2 gap-3">
                    {popular.slice(0, 4).map((item) => templateCard(item))}
                  </div>
                </div>
              ) : null}
              {recent.length ? (
                <div className="mb-2">
                  <div className="text-sm font-semibold text-neutral-800 mb-2">Recent</div>
                  <div className="grid grid-cols-2 gap-3">
                    {recent.slice(0, 4).map((item) => templateCard(item))}
                  </div>
                </div>
              ) : null}
              <div className="grid grid-cols-2 gap-4">
                {filtered.map((item) => templateCard(item))}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedTemplate ? (
        <TemplateDetailModal
          template={selectedTemplate}
          stats={stats}
          related={related}
          onClose={() => setSelectedTemplate(null)}
          onInsert={() => {
            if (selectedTemplate.type === "template" && !selectedTemplate.isLocal)
              logTemplateEvent(selectedTemplate.id, "insert");
            insertItem(selectedTemplate);
            setSelectedTemplate(null);
          }}
          onFavorite={() => {
            if (!selectedTemplate.isLocal) {
              logTemplateEvent(selectedTemplate.id, "favorite");
              toggleFavorite(selectedTemplate.id);
            }
          }}
          onRemix={() => {
            if (!selectedTemplate.isLocal) {
              logTemplateEvent(selectedTemplate.id, "remix");
              setAiTargetTemplate(selectedTemplate);
            } else {
              alert("AI Remix is available for published templates.");
            }
          }}
          onDetail={() => {
            if (!selectedTemplate.isLocal) {
              logTemplateEvent(selectedTemplate.id, "view");
              window.open(`/templates/${selectedTemplate.id}`, "_blank");
            }
          }}
          onSelectRelated={(item) => setSelectedTemplate(item)}
        />
      ) : null}
      {aiTargetTemplate ? (
        <TemplateAIAdvancedModal
          template={aiTargetTemplate}
          onClose={() => setAiTargetTemplate(null)}
          onDone={() => setAiTargetTemplate(null)}
        />
      ) : null}
    </div>
  );
}
