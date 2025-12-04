"use client";

import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";

export default function PrototypeConnections({ layers }) {
  const { activePageId, pages } = useTemplateBuilderStore();
  const page = pages.find((p) => p.id === activePageId);
  if (!page) return null;

  const connections = layers
    .filter((l) => l.interactions?.length)
    .flatMap((l) =>
      l.interactions
        .filter((i) => i.action === "navigate" && i.target)
        .map((i) => ({
          from: l,
          to: layers.find((x) => x.id === i.target),
        })),
    );

  if (!connections.length) return null;

  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ width: "100%", height: "100%" }}>
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#3B82F6" />
        </marker>
      </defs>
      {connections.map((conn, idx) => {
        if (!conn.to) return null;
        const x1 = (conn.from.x || 0) + (conn.from.width || 0);
        const y1 = (conn.from.y || 0) + (conn.from.height || 0) / 2;
        const x2 = conn.to.x || 0;
        const y2 = (conn.to.y || 0) + (conn.to.height || 0) / 2;
        return (
          <line
            key={idx}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#3B82F6"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
            opacity={0.8}
          />
        );
      })}
    </svg>
  );
}
