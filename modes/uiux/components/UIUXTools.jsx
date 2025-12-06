"use client";

export default function UIUXTools() {
  const tools = [
    "Select",
    "Frame",
    "Text",
    "Shape",
    "Component",
    "Interaction",
    "Navigation",
    "Hand",
    "Zoom",
  ];

  return (
    <div className="p-4 space-y-2">
      <div className="text-sm font-semibold text-neutral-300">UI/UX Tools</div>
      {tools.map((tool) => (
        <button
          key={tool}
          className="w-full px-3 py-2 text-left rounded hover:bg-neutral-800 transition text-neutral-200"
        >
          {tool}
        </button>
      ))}
    </div>
  );
}
