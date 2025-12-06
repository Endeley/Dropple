"use client";

export default function ClipItem({ clip }) {
  return (
    <div
      className="absolute bg-blue-600/30 border border-blue-500 rounded text-[11px] text-white px-2 flex items-center truncate"
      style={{
        left: clip.start,
        width: clip.duration,
        top: "6px",
        height: "24px",
      }}
    >
      <span className="truncate">{clip.name || clip.type || "Clip"}</span>
    </div>
  );
}
