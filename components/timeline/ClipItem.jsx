"use client";

export default function ClipItem({ clip }) {
  return (
    <div
      className="absolute bg-blue-600/30 border border-blue-500 rounded"
      style={{
        left: clip.start,
        width: clip.duration,
        top: "6px",
        height: "24px",
      }}
    >
      {/* Waveform or thumbnails can be rendered inside based on track type */}
    </div>
  );
}
