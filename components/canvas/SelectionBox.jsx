"use client";

export default function SelectionBox({ box }) {
  if (!box) return null;
  return (
    <div
      className="absolute border border-blue-400 bg-blue-400/10 pointer-events-none"
      style={{
        left: box.x,
        top: box.y,
        width: box.width,
        height: box.height,
      }}
    />
  );
}
