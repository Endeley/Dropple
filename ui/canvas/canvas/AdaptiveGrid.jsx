"use client";

// Adaptive grid lines (Figma-like).
export default function AdaptiveGrid({ zoom }) {
  const base = 20;
  const size = base * (zoom || 1) * 4;
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(to right, #e5e6e8 1px, transparent 1px),
          linear-gradient(to bottom, #e5e6e8 1px, transparent 1px)
        `,
        backgroundSize: `${size}px ${size}px`,
      }}
    />
  );
}
