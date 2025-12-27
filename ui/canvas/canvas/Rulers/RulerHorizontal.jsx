"use client";

export default function RulerHorizontal({ pan, zoom }) {
  const ticks = [];
  const step = Math.max(20, 100 * (zoom || 1));
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 0;
  const start = ((-pan.x % step) + step) % step;

  for (let x = start; x < viewportWidth; x += step) {
    const worldValue = Math.round((x - pan.x) / (zoom || 1));
    ticks.push({ x, label: worldValue });
  }

  return (
    <div className="pointer-events-none select-none absolute top-0 left-0 right-0 h-6 bg-[#fafafa] border-b border-[#e5e6e8] text-[10px] text-neutral-600">
      {ticks.map((t, i) => (
        <div
          key={i}
          className="absolute border-r border-[#d8dadd]"
          style={{ left: t.x, height: "100%" }}
        >
          <span className="absolute top-0 left-1">{t.label}</span>
        </div>
      ))}
    </div>
  );
}
