"use client";

import { useState } from "react";
import { useTemplateBuilderStore } from "@/runtime/stores/useTemplateBuilderStore";

export default function PageSwitcher() {
  const {
    pages,
    activePageId,
    setActivePage,
    createPage,
    renamePage,
    deletePage,
  } = useTemplateBuilderStore();
  const [editing, setEditing] = useState(null);

  return (
    <div className="w-full border-b border-slate-200 flex items-center px-3 py-2 gap-2 overflow-x-auto bg-white/90 backdrop-blur">
      {pages.map((page) => (
        <div
          key={page.id}
          className={`px-3 py-1 rounded cursor-pointer whitespace-nowrap transition ${
            activePageId === page.id
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
          onClick={() => setActivePage(page.id)}
          onDoubleClick={() => setEditing(page.id)}
        >
          {editing === page.id ? (
            <input
              className="bg-white text-slate-900 px-1 rounded"
              value={page.name}
              onChange={(e) => renamePage(page.id, e.target.value)}
              onBlur={() => setEditing(null)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setEditing(null);
              }}
              autoFocus
            />
          ) : (
            page.name
          )}
        </div>
      ))}

      <button
        onClick={() => createPage()}
        className="px-3 py-1 bg-emerald-600 text-white rounded shadow-sm hover:bg-emerald-700"
      >
        + Page
      </button>

      {pages.length > 1 && (
        <button
          onClick={() => deletePage(activePageId)}
          className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded hover:bg-slate-200"
        >
          Delete
        </button>
      )}
    </div>
  );
}
