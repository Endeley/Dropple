"use client";

import { useState } from "react";

export function Section({ title, icon = null, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-neutral-200 last:border-b-0">
      <div
        className="flex items-center justify-between py-2 cursor-pointer select-none"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-semibold text-neutral-800">{title}</span>
        </div>
        <span className="text-xs text-neutral-500">{open ? "▾" : "▸"}</span>
      </div>
      {open && <div className="pb-3 space-y-3">{children}</div>}
    </div>
  );
}
