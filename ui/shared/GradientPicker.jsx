"use client";

import { useMemo } from "react";

const presets = [
  { name: "Sunset", value: "linear-gradient(90deg, #ff8a00, #e52e71)" },
  { name: "Ocean", value: "linear-gradient(135deg, #36d1dc, #5b86e5)" },
  { name: "Purple", value: "linear-gradient(90deg, #7f5af0, #2cb1ff)" },
  { name: "Lime", value: "linear-gradient(120deg, #a8ff78, #78ffd6)" },
  { name: "Steel", value: "linear-gradient(135deg, #4b6cb7, #182848)" },
];

export default function GradientPicker({ value, onChange }) {
  const current = value || "";
  const activePreset = useMemo(() => presets.find((p) => p.value === current)?.name, [current]);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        {presets.map((p) => (
          <button
            key={p.name}
            className={`h-10 rounded-md border ${activePreset === p.name ? "border-violet-500 ring-2 ring-violet-200" : "border-neutral-200"}`}
            style={{ backgroundImage: p.value }}
            onClick={(e) => {
              e.preventDefault();
              onChange?.(p.value);
            }}
            title={p.name}
          />
        ))}
      </div>
      <input
        className="w-full bg-white border border-neutral-200 rounded-md px-3 py-2 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-500 transition"
        placeholder="linear-gradient(90deg, #ff00cc, #3333ff)"
        value={current}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
}
