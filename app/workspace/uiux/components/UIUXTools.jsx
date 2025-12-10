"use client";

import { useToolStore } from "@/zustand/toolStore";
import { useRef, useMemo, useEffect } from "react";
import { useNodeTreeStore } from "@/zustand/nodeTreeStore";
import { useSelectionStore } from "@/zustand/selectionStore";
import { useAssetBrowserStore } from "@/zustand/assetBrowserStore";
import { useComponentStore } from "@/zustand/componentStore";
import { useUndoStore } from "@/zustand/undoStore";
import { usePageStore } from "@/zustand/pageStore";
import ComponentsLibraryPanel from "@/components/workspace/ComponentsLibraryPanel";
import { useMemo } from "react";

export default function UIUXTools() {
  const { tool, setTool } = useToolStore();
  const addNode = useNodeTreeStore((s) => s.addNode);
  const removeNode = useNodeTreeStore((s) => s.removeNode);
  const createComponent = useNodeTreeStore((s) => s.createComponent);
  const createInstance = useNodeTreeStore((s) => s.createInstance);
  const nodes = useNodeTreeStore((s) => s.nodes);
  const rootIds = useNodeTreeStore((s) => s.rootIds);
  const setSelectedManual = useSelectionStore((s) => s.setSelectedManual);
  const deselectAll = useSelectionStore((s) => s.deselectAll);
  const selectedIds = useSelectionStore((s) => s.selectedIds);
  const fileRef = useRef(null);
  const frames = useMemo(() => rootIds.map((id) => nodes[id]).filter((n) => n?.type === "frame"), [nodes, rootIds]);
  const openBrowser = useAssetBrowserStore((s) => s.openBrowser);
  const components = useComponentStore((s) => s.components);
  const pushHistory = useUndoStore((s) => s.push);
  const pages = usePageStore((s) => s.pages);
  const currentPageId = usePageStore((s) => s.currentPageId);
  const addPage = usePageStore((s) => s.addPage);
  const setCurrentPage = usePageStore((s) => s.setCurrentPage);

  const buttonClass = (id) =>
    `w-full px-3 py-2 text-left rounded-md text-sm font-medium transition border ${
      tool === id
        ? "bg-violet-500/10 border-violet-500/70 text-violet-700 shadow-sm"
        : "bg-white border-neutral-200 text-neutral-700 hover:border-violet-300 hover:bg-violet-50"
    }`;

  const sectionLabel = "text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500";

  const framePresets = [
    { id: "desktop", label: "Desktop · 1440×900", width: 1440, height: 900 },
    { id: "tablet", label: "Tablet · 1024×1366", width: 1024, height: 1366 },
    { id: "mobile", label: "Mobile · 390×844", width: 390, height: 844 },
    { id: "square", label: "Square · 800×800", width: 800, height: 800 },
  ];

  const addFrameFromPreset = (preset) => {
    const id = crypto.randomUUID();
    const offset = 80 + frames.length * 40;
    addNode({
      id,
      type: "frame",
      name: preset.label,
      x: offset,
      y: offset,
      width: preset.width,
      height: preset.height,
      rotation: 0,
      children: [],
      parent: null,
      pageId: currentPageId,
      fill: "#ffffff",
      stroke: "#d4d4d8",
      strokeWidth: 1,
    });
    usePageStore.getState().attachFrameToPage(currentPageId, id);
    setSelectedManual([id]);
    setTool("select");
  };

  const handleSelectFrame = (frameId) => {
    setSelectedManual([frameId]);
    setTool("select");
  };

  const handleDeleteFrame = (frameId) => {
    removeNode(frameId);
    if (selectedIds.includes(frameId)) {
      deselectAll();
    }
  };

  const handleCreateComponent = () => {
    if (!selectedIds.length) return;
    const id = selectedIds[0];
    const node = nodes[id];
    if (!node) return;
    createComponent(id);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const id = crypto.randomUUID();
      addNode({
        id,
        type: "image",
        name: file.name,
        x: 100,
        y: 100,
        width: img.width / 2,
        height: img.height / 2,
        src: url,
        rotation: 0,
        parent: null,
        children: [],
      });
      setSelectedManual([id]);
      setTool("select");
    };
    img.src = url;
  };

  return (
    <div className="p-4 space-y-4">
      <div className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">UI/UX Tools</div>

      <div className="space-y-2">
        <div className={sectionLabel}>Pages</div>
        <div className="rounded-lg border border-neutral-200 bg-white shadow-sm divide-y divide-neutral-100">
          {pages.map((page) => (
            <div
              key={page.id}
              className={`flex items-center justify-between px-3 py-2 cursor-pointer ${currentPageId === page.id ? "bg-violet-50 border-l-2 border-l-violet-500" : "hover:bg-neutral-50"}`}
              onClick={() => setCurrentPage(page.id)}
            >
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-neutral-800 truncate">{page.name}</span>
                <span className="text-[11px] text-neutral-500">{page.path || "/"}</span>
              </div>
            </div>
          ))}
          <button
            className="w-full px-3 py-2 text-left text-xs font-semibold text-violet-700 hover:bg-violet-50"
            onClick={() => addPage()}
          >
            + Add Page
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <div className={sectionLabel}>Components</div>
        <div className="space-y-2">
          <button
            className="w-full px-3 py-2 text-left rounded-md text-sm font-medium transition border bg-white border-neutral-200 text-neutral-700 hover:border-violet-300 hover:bg-violet-50"
            onClick={handleCreateComponent}
            disabled={!selectedIds.length}
          >
            Create Component from Selection
          </button>
          <ComponentsLibraryPanel />
        </div>
      </div>

      {/* Core Tools */}
      <div className="space-y-2">
        <div className={sectionLabel}>Core Tools</div>
        <div className="space-y-2">
          <button className={buttonClass("select")} onClick={() => setTool("select")}>
            Select (V)
          </button>
          <button className={buttonClass("hand")} onClick={() => setTool("hand")}>
            Hand / Pan (H)
          </button>
          <button className={buttonClass("zoom")} onClick={() => setTool("zoom")}>
            Zoom (Z)
          </button>
          <button className={buttonClass("measure")} onClick={() => setTool("measure")}>
            Measure (M)
          </button>
        </div>
      </div>

      {/* Shapes & Vector */}
      <div className="space-y-2">
        <div className={sectionLabel}>Shapes & Vector</div>
        <div className="grid grid-cols-2 gap-2">
          <button className={buttonClass("rectangle")} onClick={() => setTool("rectangle")}>
            Rectangle
          </button>
          <button className={buttonClass("ellipse")} onClick={() => setTool("ellipse")}>
            Ellipse
          </button>
          <button className={buttonClass("line")} onClick={() => setTool("line")}>
            Line
          </button>
          <button className={buttonClass("polygon")} onClick={() => setTool("polygon")}>
            Polygon
          </button>
          <button className={buttonClass("pen")} onClick={() => setTool("pen")}>
            Pen
          </button>
          <button className={buttonClass("pencil")} onClick={() => setTool("pencil")}>
            Pencil
          </button>
          <button className={buttonClass("boolean")} onClick={() => setTool("boolean")}>
            Boolean Tools
          </button>
          <button className={buttonClass("vector-edit")} onClick={() => setTool("vector-edit")}>
            Vector Edit
          </button>
        </div>
      </div>

      {/* Insert Tools */}
      <div className="space-y-2">
        <div className={sectionLabel}>Insert</div>
        <div className="grid grid-cols-2 gap-2">
          <button className={buttonClass("text")} onClick={() => setTool("text")}>
            Text
          </button>
          <button className={buttonClass("image")} onClick={() => fileRef.current?.click()}>
            Image
          </button>
          <button className={buttonClass("frame")} onClick={() => setTool("frame")}>
            Frame
          </button>
          <button className={buttonClass("component")} onClick={() => setTool("component")}>
            Component
          </button>
          <button className={buttonClass("template")} onClick={() => openBrowser("templates")}>
            Templates
          </button>
          <button className={buttonClass("icon")} onClick={() => openBrowser("icons")}>
            Icons
          </button>
          <button className={buttonClass("widget")} onClick={() => openBrowser("assets")}>
            Interactive Widgets
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className={sectionLabel}>Pages (Frames)</div>
        <div className="grid grid-cols-2 gap-2">
          {framePresets.map((preset) => (
            <button
              key={preset.id}
              className="w-full rounded-md border border-neutral-200 bg-white px-2 py-2 text-left text-xs font-semibold text-neutral-700 hover:border-violet-200 hover:bg-violet-50 transition"
              onClick={() => addFrameFromPreset(preset)}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white shadow-sm divide-y divide-neutral-100">
          {frames.length === 0 ? (
            <div className="px-3 py-3 text-xs text-neutral-500">Frames you create will appear here.</div>
          ) : (
            frames.map((frame) => {
              const isSelected = selectedIds.includes(frame.id);
              return (
                <div
                  key={frame.id}
                  className={`flex items-center justify-between gap-2 px-3 py-2 cursor-pointer transition ${
                    isSelected ? "bg-violet-50 border-l-2 border-l-violet-500" : "hover:bg-neutral-50"
                  }`}
                  onClick={() => handleSelectFrame(frame.id)}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-neutral-800 truncate">{frame.name || "Frame"}</span>
                    <span className="text-[11px] text-neutral-500">
                      {Math.round(frame.width)} × {Math.round(frame.height)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      className="text-[11px] text-neutral-500 hover:text-violet-600 px-2 py-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedManual([frame.id]);
                        handleCreateComponent();
                      }}
                    >
                      Make Component
                    </button>
                    <button
                      className="text-[11px] text-neutral-500 hover:text-red-500 px-2 py-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFrame(frame.id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className={sectionLabel}>Structure & Layout</div>
        <div className="grid grid-cols-2 gap-2">
          <button className={buttonClass("autoLayout")} onClick={() => setTool("autoLayout")}>
            Auto Layout
          </button>
          <button className={buttonClass("constraints")} onClick={() => setTool("constraints")}>
            Constraints
          </button>
          <button className={buttonClass("grid")} onClick={() => setTool("grid")}>
            Grid
          </button>
          <button className={buttonClass("section")} onClick={() => setTool("section")}>
            Section
          </button>
          <button className={buttonClass("align")} onClick={() => setTool("align")}>
            Alignment
          </button>
          <button className={buttonClass("distribute")} onClick={() => setTool("distribute")}>
            Distribution
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className={sectionLabel}>UX / Prototype</div>
        <div className="grid grid-cols-2 gap-2">
          <button className={buttonClass("interaction")} onClick={() => setTool("interaction")}>
            Interaction Tool
          </button>
          <button className={buttonClass("flow")} onClick={() => setTool("flow")}>
            Flow Arrows
          </button>
          <button className={buttonClass("prototype")} onClick={() => setTool("prototype")}>
            Prototype Preview
          </button>
          <button className={buttonClass("inspect")} onClick={() => setTool("inspect")}>
            Inspect Mode
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className={sectionLabel}>AI Power</div>
        <div className="grid grid-cols-2 gap-2">
          <button className={buttonClass("magicInsert")} onClick={() => setTool("magicInsert")}>
            Magic Insert
          </button>
          <button className={buttonClass("magicReplace")} onClick={() => setTool("magicReplace")}>
            Magic Replace
          </button>
          <button className={buttonClass("autoResponsive")} onClick={() => setTool("autoResponsive")}>
            Auto Responsive
          </button>
          <button className={buttonClass("styleTransfer")} onClick={() => setTool("styleTransfer")}>
            AI Style Transfer
          </button>
          <button className={buttonClass("contentFill")} onClick={() => setTool("contentFill")}>
            AI Content Fill
          </button>
          <button className={buttonClass("layoutFixer")} onClick={() => setTool("layoutFixer")}>
            AI Layout Fixer
          </button>
          <button className={buttonClass("instantComponent")} onClick={() => setTool("instantComponent")}>
            Instant Components
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className={sectionLabel}>Layers</div>
        <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
          <div className="px-3 py-2 text-xs text-neutral-500">
            {selectedIds.length ? "Select nodes to see layers." : "Select a frame to see its layers."}
          </div>
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
    </div>
  );
}
