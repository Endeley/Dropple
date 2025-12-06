"use client";

export default function FilterChip({ label, type, active, onClick }) {
  return (
    <button
      onClick={() => onClick?.(type)}
      className={`px-3 py-1 rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-700 ${
        active ? "ring-2 ring-blue-400" : ""
      }`}
    >
      {label}
    </button>
  );
}
