"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import FilterChip from "./FilterChip";

const FILTERS = [
  { label: "Images", type: "image" },
  { label: "Videos", type: "video" },
  { label: "Audio", type: "audio" },
  { label: "AI", type: "ai" },
  { label: "Docs", type: "document" },
];

export default function AssetLibrary({ onSelect }) {
  const [type, setType] = useState(null);
  const assets = useQuery(api.assets.getAssets, {
    type: type || undefined,
  });

  return (
    <div className="w-full h-full p-4 overflow-y-auto bg-[#111] text-white space-y-4">
      <input
        placeholder="Search assets..."
        className="w-full p-2 bg-neutral-800 rounded"
        onChange={() => {}}
      />

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <FilterChip
            key={f.type}
            label={f.label}
            type={f.type}
            active={type === f.type}
            onClick={(t) => setType(t === type ? null : t)}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {(assets || []).map((asset) => (
          <div
            key={asset._id}
            onClick={() => onSelect?.(asset)}
            className="cursor-pointer bg-neutral-900 rounded-lg overflow-hidden hover:ring-2 ring-blue-400"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("asset", JSON.stringify(asset));
            }}
          >
            {asset.type === "image" && (
              <img src={asset.url} className="w-full h-24 object-cover" alt={asset.name} />
            )}
            {asset.type === "video" && (
              <div className="w-full h-24 relative flex overflow-hidden">
                {asset.thumbnails?.length ? (
                  asset.thumbnails.map((thumb, idx) => (
                    <div
                      key={idx}
                      className="flex-1 bg-center bg-cover"
                      style={{ backgroundImage: `url(${thumb})` }}
                    />
                  ))
                ) : (
                  <video src={asset.url} className="absolute inset-0 w-full h-full object-cover" />
                )}
                <div className="absolute bottom-1 right-1 bg-black/60 text-xs px-2 py-0.5 rounded">
                  🎬
                </div>
              </div>
            )}
            {asset.type === "audio" && (
              <div className="h-24 flex items-end gap-[2px] px-2 pb-2 bg-neutral-800">
                {asset.waveform?.length ? (
                  asset.waveform.slice(0, 80).map((v, i) => (
                    <div
                      key={i}
                      className="bg-blue-400/70"
                      style={{ width: "2px", height: `${Math.min(1, Math.max(0, v)) * 100}%` }}
                    />
                  ))
                ) : (
                  <div className="w-full text-center text-neutral-300 flex items-center justify-center">
                    🎵 Audio
                  </div>
                )}
              </div>
            )}
            {asset.type === "ai" && (
              <img
                src={asset.url}
                className="w-full h-24 object-cover border border-purple-400"
                alt={asset.name}
              />
            )}
            <div className="p-2 text-sm truncate">{asset.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
