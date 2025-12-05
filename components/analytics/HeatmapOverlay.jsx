"use client";

export default function HeatmapOverlay({ heatmap = [] }) {
  if (!heatmap || heatmap.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {heatmap.map((point, i) => (
        <div
          key={i}
          className="absolute bg-red-500 opacity-50 rounded-full"
          style={{
            width: Math.max(8, (point.intensity || 0.4) * 50),
            height: Math.max(8, (point.intensity || 0.4) * 50),
            top: point.y,
            left: point.x,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  );
}
