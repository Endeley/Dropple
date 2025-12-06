"use client";

import { useGlobalStore } from "@/zustand/globalModeStore";

const MODES = [
  { id: "graphic", label: "Graphic Design" },
  { id: "uiux", label: "UI/UX" },
  { id: "podcast", label: "Podcast" },
  { id: "video", label: "Video" },
  { id: "ai", label: "AI Suite" },
  { id: "cartoon", label: "Cartoon/Animation" },
  { id: "material", label: "Material UI" },
  { id: "dev", label: "Dev Mode" },
  { id: "branding", label: "Branding Kit" },
  { id: "documents", label: "Documents" },
  { id: "education", label: "Education" },
];

export default function ModeSwitcher() {
  const { mode, setMode } = useGlobalStore();
  return (
    <div className="flex gap-4 px-4 text-sm overflow-x-auto">
      {MODES.map((m) => (
        <button
          key={m.id}
          onClick={() => setMode(m.id)}
          className={
            mode === m.id
              ? "text-blue-400 font-semibold whitespace-nowrap"
              : "text-neutral-400 hover:text-white transition whitespace-nowrap"
          }
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
