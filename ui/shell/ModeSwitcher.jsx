"use client";

import { useRouter } from "next/navigation";
import { useGlobalStore } from "@/runtime/stores/globalModeStore";

// Centralized mode list: modeKey -> route path + label.
const MODES = [
  { id: "graphic", path: "/workspace/graphic-design", label: "Graphic Design" },
  { id: "uiux", path: "/workspace/uiux", label: "UI/UX" },
  { id: "podcast", path: "/workspace/podcast", label: "Podcast" },
  { id: "video", path: "/workspace/video", label: "Video" },
  { id: "ai", path: "/workspace/ai-suite", label: "AI Suite" },
  { id: "cartoon", path: "/workspace/cartoon-animation", label: "Cartoon / Animation" },
  { id: "material", path: "/workspace/material-ui", label: "Material UI" },
  { id: "dev", path: "/workspace/dev", label: "Dev Mode" },
  { id: "branding", path: "/workspace/branding-kit", label: "Branding Kit" },
  { id: "documents", path: "/workspace/documents", label: "Documents" },
  { id: "education", path: "/workspace/education", label: "Education" },
  { id: "icon", path: "/workspace/icon", label: "Icon" },
];

export default function ModeSwitcher() {
  const { mode, setMode } = useGlobalStore();
  const router = useRouter();

  const handleSelect = (e) => {
    const id = e.target.value;
    const selected = MODES.find((m) => m.id === id);
    if (!selected) return;
    setMode(id);
    router.push(selected.path);
  };

  return (
    <div className="flex items-center gap-2 px-4 text-sm">
      <span className="text-xs uppercase tracking-wide text-neutral-500">Mode</span>
      <select
        className="bg-white border border-neutral-200 rounded-md px-3 py-2 text-sm text-neutral-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-500"
        value={mode}
        onChange={handleSelect}
      >
        {MODES.map((m) => (
          <option key={m.id} value={m.id}>
            {m.label}
          </option>
        ))}
      </select>
    </div>
  );
}
