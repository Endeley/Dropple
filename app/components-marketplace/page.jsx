"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import TemplatePreviewCard from "@/components/template-builder/TemplatePreviewCard";

export default function ComponentMarketplacePage() {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (search) params.set("q", search);

      const res = await fetch(`/api/components/all?${params.toString()}`);
      const data = await res.json();
      setComponents(Array.isArray(data) ? data : []);
      setLoading(false);
    }
    load();
  }, [category, search]);

  const categories = useMemo(
    () => ["", "Buttons", "Cards", "Navigation", "Forms", "UI Kits", "Dashboards", "Mobile"],
    [],
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-between px-6 py-6 border-b bg-white">
        <div>
          <h1 className="text-2xl font-semibold">Component Marketplace</h1>
          <p className="text-sm text-gray-500">Reusable UI kits and components ready to drop.</p>
        </div>
        <Link
          href="/creator/components/upload"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Upload Component
        </Link>
      </div>

      <div className="border-b bg-white px-6 py-4 flex flex-col md:flex-row gap-3 md:items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search components..."
          className="flex-1 border p-2 rounded"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2 rounded w-full md:w-64"
        >
          {categories.map((cat) => (
            <option key={cat || "all"} value={cat}>
              {cat || "All Categories"}
            </option>
          ))}
        </select>
      </div>

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <SkeletonList />
        ) : components.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-16">
            No components found.
          </div>
        ) : (
          components.map((component) => (
            <Link key={component._id} href={`/components-marketplace/${component._id}`}>
              <TemplatePreviewCard
                template={{
                  ...component,
                  name: component.name || component.title,
                  thumbnail: component.previewImage,
                  mode: component.category,
                  price: component.price ?? 0,
                }}
              />
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
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="w-full border rounded-lg overflow-hidden bg-white shadow animate-pulse"
        >
          <div className="h-40 bg-gray-200" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </>
  );
}
