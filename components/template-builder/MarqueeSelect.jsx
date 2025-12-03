"use client";

import { useEffect, useState } from "react";
import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";

export default function MarqueeSelect({ containerRef, layers }) {
  const { setSelectedLayers } = useTemplateBuilderStore();
  const [box, setBox] = useState(null);

  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;

    function onMouseDown(e) {
      if (e.target.id !== "dropple-canvas") return;
      const rect = el.getBoundingClientRect();
      const startX = e.clientX;
      const startY = e.clientY;

      function onMove(ev) {
        const x = Math.min(startX, ev.clientX);
        const y = Math.min(startY, ev.clientY);
        const w = Math.abs(ev.clientX - startX);
        const h = Math.abs(ev.clientY - startY);
        setBox({ x, y, w, h, rect });
      }

      function onUp(ev) {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);

        if (box) {
          const map = new Map(layers.map((l) => [l.id, l]));
          const getAbs = (l) => {
            let ax = l.x;
            let ay = l.y;
            let p = l.parentId;
            while (p) {
              const parent = map.get(p);
              if (!parent) break;
              ax += parent.x;
              ay += parent.y;
              p = parent.parentId;
            }
            return { x: ax, y: ay };
          };

          const selected = layers
            .filter((l) => {
              const abs = getAbs(l);
              return (
                abs.x >= box.x &&
                abs.y >= box.y &&
                abs.x + l.width <= box.x + box.w &&
                abs.y + l.height <= box.y + box.h
              );
            })
            .map((l) => l.id);

          setSelectedLayers(selected);
        }

        setBox(null);
      }

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    }

    el.addEventListener("mousedown", onMouseDown);
    return () => {
      el.removeEventListener("mousedown", onMouseDown);
    };
  }, [containerRef, layers, setSelectedLayers, box]);

  if (!box) return null;

  const { rect } = box;
  return (
    <div
      className="pointer-events-none absolute border-2 border-blue-500/60 bg-blue-500/10"
      style={{
        left: box.x - rect.left,
        top: box.y - rect.top,
        width: box.w,
        height: box.h,
      }}
    />
  );
}
