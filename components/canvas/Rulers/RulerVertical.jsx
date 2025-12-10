"use client";

export default function RulerVertical({ pan, zoom }) {
  const ticks = [];
  const step = Math.max(20, 100 * (zoom || 1));
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 0;
  const start = ((-pan.y % step) + step) % step;

  for (let y = start; y < viewportHeight; y += step) {
    const worldValue = Math.round((y - pan.y) / (zoom || 1));
    ticks.push({ y, label: worldValue });
  }

  return (
    <div className="pointer-events-none select-none absolute top-0 bottom-0 left-0 w-6 bg-[#fafafa] border-r border-[#e5e6e8] text-[10px] text-neutral-600">
      {ticks.map((t, i) => (
        <div
          key={i}
          className="absolute border-b border-[#d8dadd]"
          style={{ top: t.y, width: "100%" }}
        >
          <span className="absolute left-1">{t.label}</span>
        </div>
      ))}
    </div>
  );
}
