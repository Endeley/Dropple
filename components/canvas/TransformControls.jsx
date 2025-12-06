"use client";

export default function TransformControls({ bounds }) {
  if (!bounds) return null;
  return (
    <div
      id="transform-overlay"
      className="absolute border border-blue-500 pointer-events-none"
      style={{
        left: bounds.x,
        top: bounds.y,
        width: bounds.width,
        height: bounds.height,
      }}
    >
      {[
        "top-left",
        "top",
        "top-right",
        "right",
        "bottom-right",
        "bottom",
        "bottom-left",
        "left",
      ].map((h) => (
        <div
          key={h}
          data-handle={h}
          className="absolute w-3 h-3 bg-white rounded-sm border border-blue-500 pointer-events-auto"
          style={handleStyle(h, bounds)}
        />
      ))}
      <div
        data-handle="rotate"
        className="absolute w-4 h-4 bg-yellow-300 rounded-full border border-yellow-500 pointer-events-auto"
        style={{
          left: bounds.width / 2 - 8,
          top: -24,
        }}
      />
    </div>
  );
}

function handleStyle(handle, bounds) {
  const map = {
    "top-left": { left: -4, top: -4 },
    top: { left: bounds.width / 2 - 4, top: -4 },
    "top-right": { left: bounds.width - 4, top: -4 },
    right: { left: bounds.width - 4, top: bounds.height / 2 - 4 },
    "bottom-right": { left: bounds.width - 4, top: bounds.height - 4 },
    bottom: { left: bounds.width / 2 - 4, top: bounds.height - 4 },
    "bottom-left": { left: -4, top: bounds.height - 4 },
    left: { left: -4, top: bounds.height / 2 - 4 },
  };
  return map[handle];
}
