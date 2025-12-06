"use client";

import { useTimelineStore } from "@/zustand/useTimelineStore";
import { bezierPath } from "@/utils/timeline/bezierPath";
import BezierHandle from "./BezierHandle";

export default function CurvesGraph() {
  const { curveEditor } = useTimelineStore((s) => ({ curveEditor: s.curveEditor }));
  const keyframe = curveEditor.selectedKeyframe;
  if (!keyframe) return null;
  const ease = keyframe.ease || {};
  const inHandle = ease.in || { x: 0.25, y: 0.1 };
  const outHandle = ease.out || { x: 0.25, y: 1 };
  const path = bezierPath(inHandle, outHandle);

  return (
    <div className="w-full rounded bg-neutral-800 p-2">
      <svg className="h-48 w-full" viewBox="-0.05 -0.05 1.1 1.1" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="0.1" height="0.1" patternUnits="userSpaceOnUse">
            <path d="M 0.1 0 L 0 0 0 0.1" fill="none" stroke="#2f2f2f" strokeWidth="0.002" />
          </pattern>
        </defs>
        <rect x="-0.05" y="-0.05" width="1.1" height="1.1" fill="url(#grid)" />
        <path d={path} stroke="#4ade80" strokeWidth="0.02" fill="none" />
        <BezierHandle type="in" />
        <BezierHandle type="out" />
      </svg>
    </div>
  );
}
