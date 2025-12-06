"use client";

import { useTimelineStore } from "@/zustand/useTimelineStore";

const presets = {
  linear: { in: { x: 0, y: 0 }, out: { x: 1, y: 1 } },
  easeIn: { in: { x: 0.42, y: 0 }, out: { x: 1, y: 1 } },
  easeOut: { in: { x: 0, y: 0 }, out: { x: 0.2, y: 1 } },
  easeInOut: { in: { x: 0.42, y: 0 }, out: { x: 0.2, y: 1 } },
  fastInSlowOut: { in: { x: 0.1, y: 0.2 }, out: { x: 0.1, y: 1 } },
  bounce: { in: { x: 0.6, y: 1.5 }, out: { x: 0.4, y: -0.5 } },
};

export default function CurvePresetSelector() {
  const { updateKeyframeEase, curveEditor } = useTimelineStore((s) => ({
    updateKeyframeEase: s.updateKeyframeEase,
    curveEditor: s.curveEditor,
  }));

  if (!curveEditor?.open) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {Object.entries(presets).map(([name, def]) => (
        <button
          key={name}
          className="rounded bg-neutral-800 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-700"
          onClick={() => {
            updateKeyframeEase(curveEditor.trackId, curveEditor.keyframeId, "in", def.in);
            updateKeyframeEase(curveEditor.trackId, curveEditor.keyframeId, "out", def.out);
          }}
        >
          {name}
        </button>
      ))}
    </div>
  );
}
