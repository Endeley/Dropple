"use client";

import CanvasHost from "@/components/canvas/CanvasHost";
import { useNodeTreeStore } from "@/zustand/nodeTreeStore";
import { useSelectionStore } from "@/zustand/selectionStore";
import { usePageStore } from "@/zustand/pageStore";
import { useEffect } from "react";
import DevicePreviewBar from "@/components/template-builder/DevicePreviewBar";
import { usePageStore } from "@/zustand/pageStore";
import { useNodeTreeStore } from "@/zustand/nodeTreeStore";
import { useSelectionStore } from "@/zustand/selectionStore";

export default function UIUXCanvas() {
  const nodes = useNodeTreeStore((s) => s.nodes);
  const rootIds = useNodeTreeStore((s) => s.rootIds);
  const applyResponsiveLayout = useNodeTreeStore((s) => s.applyResponsiveLayout);
  const setSelectedManual = useSelectionStore((s) => s.setSelectedManual);
  const selectedIds = useSelectionStore((s) => s.selectedIds);
  const currentPageId = usePageStore((s) => s.currentPageId);
  const viewportWidth = usePageStore((s) => s.viewportWidth);
  const currentBreakpointId = usePageStore((s) => s.currentBreakpointId);
  const pages = usePageStore((s) => s.pages);
  const currentPage = pages.find((p) => p.id === currentPageId);
  const setCurrentBreakpoint = usePageStore((s) => s.setCurrentBreakpoint);
  const attachFrameToPage = usePageStore((s) => s.attachFrameToPage);
  const addNode = useNodeTreeStore((s) => s.addNode);
  const setSelectedManual = useSelectionStore((s) => s.setSelectedManual);

  const addFramePreset = (presetId) => {
    const presets = {
      mobile: { width: 390, height: 844 },
      tablet: { width: 1024, height: 1366 },
      desktop: { width: 1440, height: 900 },
      large: { width: 1680, height: 1050 },
    };
    const preset = presets[presetId];
    if (!preset) return;
    const id = crypto.randomUUID();
    addNode({
      id,
      type: "frame",
      name: `${presetId} frame`,
      x: 120,
      y: 120,
      width: preset.width,
      height: preset.height,
      children: [],
      pageId: currentPageId,
    });
    attachFrameToPage(currentPageId, id);
    setSelectedManual([id]);
  };

  useEffect(() => {
    applyResponsiveLayout(viewportWidth, currentBreakpointId);
  }, [viewportWidth, currentBreakpointId, applyResponsiveLayout]);

  const frames = rootIds
    .map((id) => nodes[id])
    .filter((n) => n?.type === "frame" && (!currentPageId || n.pageId === currentPageId));

  const handleSelectFrame = (id) => {
    setSelectedManual([id]);
  };

  return (
    <CanvasHost enablePanZoom nodeMap={nodes}>
      <div id="uiux-canvas-area" className="w-full h-full relative">
        <div className="fixed left-4 top-28 z-50">
          <DevicePreviewBar
            onSelect={(bp) => setCurrentBreakpoint(bp)}
            addArtboard={(preset) => addFramePreset(preset)}
          />
        </div>
        {frames.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="pointer-events-none select-none rounded-full border border-neutral-200 bg-white/90 px-4 py-2 text-sm text-neutral-600 shadow-sm">
              No artboards yet. Use the Frame tool or presets to add one. Scroll to zoom, hold space + drag to pan.
            </div>
          </div>
        ) : null}

        {frames.map((frame) => {
          const isSelected = selectedIds.includes(frame.id);
          return (
            <div
              key={frame.id}
              className={`absolute rounded-xl bg-white shadow-[0_18px_45px_-32px_rgba(15,23,42,0.35)] border transition ${
                isSelected ? "border-violet-500 shadow-lg shadow-violet-500/10" : "border-neutral-200"
              }`}
              style={{
                left: frame.x,
                top: frame.y,
                width: frame.width,
                height: frame.height,
              }}
              onMouseDownCapture={() => handleSelectFrame(frame.id)}
            >
              <div className="absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-semibold bg-white/90 border border-neutral-200 text-neutral-700 shadow-sm">
                {frame.name || "Frame"} · {Math.round(frame.width)} × {Math.round(frame.height)} ·{" "}
                {currentPage?.name || "Page"} ({currentBreakpointId})
              </div>
            </div>
          );
        })}
      </div>
    </CanvasHost>
  );
}
