"use client";

export default function Ruler() {
  const ticks = Array.from({ length: 200 }, (_, i) => i * 100);

  return (
    <div className="h-6 w-full flex border-b border-neutral-800 bg-[#222]">
      {ticks.map((t) => (
        <div
          key={t}
          className="w-[100px] border-r border-neutral-700 text-[10px] text-neutral-400 flex items-center justify-center"
        >
          {t}ms
        </div>
      ))}
    </div>
  );
}
