"use client";

import { useEffect, useRef } from "react";
import { useTimelineStore } from "@/zustand/useTimelineStore";

export default function BezierHandle({ type }) {
  const { curveEditor, updateKeyframeEase } = useTimelineStore((state) => ({
    curveEditor: state.curveEditor,
    updateKeyframeEase: state.updateKeyframeEase,
  }));
  const handle = curveEditor.selectedKeyframe?.ease?.[type];
  const svgRef = useRef(null);

  useEffect(() => {
    svgRef.current = document.querySelector("svg");
  }, []);

  if (!handle) return null;

  const onPointerDown = (e) => {
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();

    const move = (ev) => {
      const x = Math.min(Math.max((ev.clientX - rect.left) / rect.width, 0), 1);
      const y = 1 - Math.min(Math.max((ev.clientY - rect.top) / rect.height, 0), 1);
      updateKeyframeEase(curveEditor.trackId, curveEditor.keyframeId, type, { x, y });
    };

    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <circle
      cx={handle.x}
      cy={1 - handle.y}
      r="0.03"
      className="cursor-pointer fill-yellow-300 stroke-yellow-500"
      onPointerDown={onPointerDown}
    />
  );
}
