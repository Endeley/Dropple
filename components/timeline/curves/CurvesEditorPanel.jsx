"use client";

import CurvesGraph from "./CurvesGraph";
import CurvePresetSelector from "./CurvePresetSelector";
import { useTimelineStore } from "@/zustand/useTimelineStore";

export default function CurvesEditorPanel() {
  const { curveEditor, closeCurveEditor } = useTimelineStore((state) => ({
    curveEditor: state.curveEditor,
    closeCurveEditor: state.closeCurveEditor,
  }));

  if (!curveEditor?.open) return null;

  return (
    <div className="absolute right-3 top-3 z-[999] h-[320px] w-[420px] rounded-md border border-neutral-700 bg-neutral-900 p-4 shadow-2xl">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">
          Curve Editor — {curveEditor.selectedKeyframe?.ease?.type || "linear"}
        </h3>
        <button
          onClick={closeCurveEditor}
          className="rounded bg-neutral-800 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-700"
        >
          ✖
        </button>
      </div>

      <CurvesGraph />
      <CurvePresetSelector />
    </div>
  );
}
