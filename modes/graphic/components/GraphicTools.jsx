"use client";

export default function GraphicTools() {
  const tools = [
    { id: "select", label: "Select" },
    { id: "shape", label: "Shapes" },
    { id: "text", label: "Text" },
    { id: "image", label: "Image" },
    { id: "crop", label: "Crop" },
    { id: "eyedropper", label: "Color Picker" },
  ];

  return (
    <div className="p-4 space-y-2">
      <div className="text-sm font-semibold text-neutral-300">Tools</div>
      {tools.map((t) => (
        <button
          key={t.id}
          className="w-full px-3 py-2 text-left rounded hover:bg-neutral-800 transition text-neutral-200"
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
