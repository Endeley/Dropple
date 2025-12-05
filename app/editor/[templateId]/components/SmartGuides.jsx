"use client";

import { useEditorStore } from "../hooks/useEditorStore";

export default function SmartGuides() {
  const guides = useEditorStore((s) => s.smartGuides);

  return (
    <>
      {guides.map((g, i) => {
        if (g.type === "vertical") {
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: g.x,
                width: 1,
                background: "#f472b6",
                pointerEvents: "none",
              }}
            />
          );
        }
        if (g.type === "horizontal") {
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: g.y,
                height: 1,
                background: "#f472b6",
                pointerEvents: "none",
              }}
            />
          );
        }
        return null;
      })}
    </>
  );
}
