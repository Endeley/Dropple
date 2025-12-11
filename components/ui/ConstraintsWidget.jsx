"use client";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function ConstraintsWidget({ node, updateNode }) {
  if (!node || !updateNode) return null;
  const c = node.constraints || {};

  const setHorizontal = (value) =>
    updateNode(node.id, {
      constraints: { ...c, horizontal: value },
    });

  const setVertical = (value) =>
    updateNode(node.id, {
      constraints: { ...c, vertical: value },
    });

  return (
    <div className="flex flex-col gap-3 p-2 rounded-md border border-neutral-300 bg-white w-[110px]">
      {/* Horizontal */}
      <div>
        <div className="text-[10px] text-neutral-500 mb-1">Horizontal</div>
        <div className="grid grid-cols-5 gap-1">
          {[
            { value: "left", label: "L" },
            { value: "center", label: "C" },
            { value: "right", label: "R" },
            { value: "left-right", label: "←→" },
            { value: "stretch", label: "S" },
          ].map((item) => (
            <button
              key={item.value}
              className={cn(
                "h-6 text-xs border rounded flex items-center justify-center",
                c.horizontal === item.value
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-neutral-100 hover:bg-neutral-200",
              )}
              onClick={() => setHorizontal(item.value)}
              title={item.value}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vertical */}
      <div>
        <div className="text-[10px] text-neutral-500 mb-1">Vertical</div>
        <div className="grid grid-cols-5 gap-1">
          {[
            { value: "top", label: "T" },
            { value: "center", label: "C" },
            { value: "bottom", label: "B" },
            { value: "top-bottom", label: "↑↓" },
            { value: "stretch", label: "S" },
          ].map((item) => (
            <button
              key={item.value}
              className={cn(
                "h-6 text-xs border rounded flex items-center justify-center",
                c.vertical === item.value
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-neutral-100 hover:bg-neutral-200",
              )}
              onClick={() => setVertical(item.value)}
              title={item.value}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
