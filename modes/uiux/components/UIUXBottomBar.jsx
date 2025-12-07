"use client";

import { useCanvasState } from "@/lib/canvas-core/canvasState";
import { useToolStore } from "@/zustand/toolStore";

const clampZoom = (value) => Math.min(8, Math.max(0.1, value));

export default function UIUXBottomBar() {
  const zoom = useCanvasState((s) => s.zoom);
  const setZoom = useCanvasState((s) => s.setZoom);
  const setPan = useCanvasState((s) => s.setPan);
  const showGrid = useCanvasState((s) => s.gridVisible);
  const toggleGrid = useCanvasState((s) => s.toggleGrid);
  const showRulers = useCanvasState((s) => s.rulersVisible);
  const toggleRulers = useCanvasState((s) => s.toggleRulers);
  const snapToGrid = useToolStore((s) => s.snapToGrid);
  const setSnapToGrid = useToolStore((s) => s.setSnapToGrid);

  const handleZoomIn = () => setZoom(clampZoom(zoom * 1.1));
  const handleZoomOut = () => setZoom(clampZoom(zoom / 1.1));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const buttonBase =
    "h-9 px-3 rounded-md border text-sm font-medium flex items-center gap-2 transition";
  const toggleClass = (active) =>
    `${buttonBase} ${
      active
        ? "border-violet-200 bg-violet-50 text-violet-700"
        : "border-neutral-200 bg-white text-neutral-700 hover:border-violet-200 hover:bg-violet-50/60"
    }`;

  return (
    <div className="h-full w-full flex items-center justify-between px-4 bg-white">
      <div className="flex items-center gap-2">
        <button className={toggleClass(false)} onClick={handleZoomOut}>
          −
        </button>
        <div className="min-w-[72px] text-center text-sm font-semibold text-neutral-800">
          {Math.round(zoom * 100)}%
        </div>
        <button className={toggleClass(false)} onClick={handleZoomIn}>
          +
        </button>
        <div className="h-6 w-px bg-neutral-200 mx-1" />
        <button className={toggleClass(false)} onClick={handleResetView}>
          Fit / Reset
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button className={toggleClass(showGrid)} onClick={toggleGrid}>
          Grid
        </button>
        <button className={toggleClass(showRulers)} onClick={toggleRulers}>
          Rulers
        </button>
        <button className={toggleClass(snapToGrid)} onClick={() => setSnapToGrid(!snapToGrid)}>
          Snap
        </button>
      </div>
    </div>
  );
}
