"use client";

export default function KeyframeDot({ keyframe }) {
  return (
    <div
      className="w-3 h-3 rounded-full bg-yellow-400 absolute"
      style={{ left: keyframe.time - 2, top: "12px" }}
      title={`${keyframe.time}ms`}
    />
  );
}
