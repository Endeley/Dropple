"use client";

import CanvasHost from "@/components/canvas/CanvasHost";
import NodeRenderer from "@/components/canvas/NodeRenderer";
import { useNodeTreeStore } from "@/zustand/nodeTreeStore";
import { useSelectionStore } from "@/zustand/selectionStore";
import { usePageStore } from "@/zustand/pageStore";
import { useEffect } from "react";
import DevicePreviewBar from "@/components/template-builder/DevicePreviewBar";

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

  // Find a free slot for a new frame so it doesn't stack on existing ones.
  const findNextFramePosition = (width, height) => {
    const framesOnPage = rootIds
      .map((id) => nodes[id])
      .filter((n) => n?.type === "frame" && (!currentPageId || n.pageId === currentPageId));

    const margin = 120; // space between frames
    const startX = 120;
    const startY = 120;
    const maxWidth = Math.max(width, ...(framesOnPage.map((f) => f.width)));
    const maxHeight = Math.max(height, ...(framesOnPage.map((f) => f.height)));
    const stepX = maxWidth + margin;
    const stepY = maxHeight + margin;

    const overlaps = (candidate) =>
      framesOnPage.some((f) => {
        const expanded = {
          x1: f.x - margin / 2,
          y1: f.y - margin / 2,
          x2: f.x + f.width + margin / 2,
          y2: f.y + f.height + margin / 2,
        };
        return !(
          candidate.x + candidate.width <= expanded.x1 ||
          candidate.x >= expanded.x2 ||
          candidate.y + candidate.height <= expanded.y1 ||
          candidate.y >= expanded.y2
        );
      });

    // Walk a grid until a non-overlapping slot is found.
    for (let row = 0; row < 50; row++) {
      for (let col = 0; col < 50; col++) {
        const candidate = {
          x: startX + col * stepX,
          y: startY + row * stepY,
          width,
          height,
        };
        if (!overlaps(candidate)) return { x: candidate.x, y: candidate.y };
      }
    }
    // Fallback: place at origin if somehow full.
    return { x: startX, y: startY };
  };

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
    const { x, y } = findNextFramePosition(preset.width, preset.height);
    addNode({
      id,
      type: "frame",
      name: `${presetId} frame`,
      x,
      y,
      width: preset.width,
      height: preset.height,
      children: [],
      pageId: currentPageId,
      fill: "#ffffff",
      stroke: "#d4d4d8",
      strokeWidth: 1,
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
        <div className="absolute inset-0">
          {rootIds.map((id) => (
            <NodeRenderer key={id} nodeId={id} />
          ))}
        </div>
      </div>
    </CanvasHost>
  );
}
