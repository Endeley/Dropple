"use client";

export default function CanvasGrid({ size = 24 }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-60"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(124,58,237,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(124,58,237,0.18) 1px, transparent 1px)",
        backgroundSize: `${size}px ${size}px`,
      }}
    />
  );
}
