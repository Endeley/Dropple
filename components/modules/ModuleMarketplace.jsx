"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function ModuleMarketplace({ type }) {
  const modules =
    useQuery(api.modules.list, { type: type || undefined }) || [];

  return (
    <div className="bg-white border rounded p-4 h-96 overflow-auto space-y-3">
      <p className="font-semibold text-lg">Module Marketplace</p>
      {modules.map((m) => (
        <div key={m._id} className="border rounded p-3">
          <p className="font-semibold text-sm">{m.name}</p>
          <p className="text-xs text-gray-500">Version: {m.version}</p>
          <p className="text-xs text-gray-500">Type: {m.type}</p>
          <p className="text-[11px] text-gray-600 mt-1">
            Downloads: {m.downloads ?? 0} • Rating: {m.rating ?? 0}
          </p>
        </div>
      ))}
      {modules.length === 0 && (
        <p className="text-sm text-gray-500">No modules found.</p>
      )}
    </div>
  );
}
