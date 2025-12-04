"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const CATEGORY_OPTIONS = [
  { value: "", label: "All" },
  { value: "image", label: "Images" },
  { value: "icon", label: "Icons" },
  { value: "svg", label: "SVG" },
  { value: "illustration", label: "Illustrations" },
  { value: "3d", label: "3D Models" },
  { value: "texture", label: "Textures" },
  { value: "lottie", label: "Lottie" },
];

export default function AssetMarketplacePage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const params = new URLSearchParams();
      if (type) params.set("type", type);
      if (search) params.set("q", search);
      const res = await fetch(`/api/asset-library/all?${params.toString()}`);
      const data = await res.json();
      setAssets(Array.isArray(data) ? data : []);
      setLoading(false);
    }
    load();
  }, [search, type]);

  const categories = useMemo(() => CATEGORY_OPTIONS, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-between px-6 py-6 border-b bg-white">
        <div>
          <h1 className="text-2xl font-semibold">Asset Marketplace</h1>
          <p className="text-sm text-gray-500">
            Icons, photos, illustrations, 3D and more — ready to drag into Dropple.
          </p>
        </div>
        <Link
          href="/creator/assets/upload"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Upload Asset
        </Link>
      </div>

      <div className="border-b bg-white px-6 py-4 flex flex-col md:flex-row gap-3 md:items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search assets..."
          className="flex-1 border p-2 rounded"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border p-2 rounded w-full md:w-64"
        >
          {categories.map((opt) => (
            <option key={opt.value || "all"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {loading ? (
          <SkeletonList />
        ) : assets.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-16">
            No assets found.
          </div>
        ) : (
          assets.map((asset) => (
            <Link
              key={asset._id}
              href={`/asset-marketplace/${asset._id}`}
              className="block rounded-lg overflow-hidden bg-white border hover:shadow"
            >
              <div className="h-36 bg-gray-100">
                {asset.previewUrl ? (
                  <img
                    src={asset.previewUrl}
                    alt={asset.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>
              <div className="p-3">
                <p className="font-medium text-sm line-clamp-2">{asset.title}</p>
                <p className="text-xs text-gray-500 mt-1 uppercase">{asset.type}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

function SkeletonList() {
  return (
    <>
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="w-full border rounded-lg overflow-hidden bg-white shadow animate-pulse">
          <div className="h-36 bg-gray-200" />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </>
  );
}
