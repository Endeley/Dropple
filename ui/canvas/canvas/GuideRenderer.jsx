"use client";

import { useSnappingStore } from "@/runtime/stores/snappingStore";

export default function GuideRenderer() {
  const guides = useSnappingStore((s) => s.guides);

  if (!guides?.length) return null;

  return (
    <>
      {guides.map((g, i) =>
        g.type === "vertical" ? (
          <div
            key={i}
            className="absolute w-px bg-fuchsia-400"
            style={{ left: g.x, top: 0, bottom: 0 }}
          />
        ) : (
          <div
            key={i}
            className="absolute h-px bg-fuchsia-400"
            style={{ top: g.y, left: 0, right: 0 }}
          />
        ),
      )}
    </>
  );
}
