"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import TemplatePreviewCard from "@/components/template-builder/TemplatePreviewCard";

export default function MarketplacePage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (search) params.set("q", search);

      const res = await fetch(`/api/templates/marketplace?${params.toString()}`);
      const data = await res.json();
      setTemplates(data.templates || []);
      setLoading(false);
    }

    load();
  }, [category, search]);

  const categories = useMemo(
    () => ["", "UI/UX", "Branding", "Poster", "Website", "Mobile App", "Social Media"],
    [],
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-between px-6 py-6 border-b bg-white">
        <div>
          <h1 className="text-2xl font-semibold">Template Marketplace</h1>
          <p className="text-sm text-gray-500">
            Browse published templates and drop them straight into the editor.
          </p>
        </div>
        <Link
          href="/editor/templates/create"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Template
        </Link>
      </div>

      <div className="border-b bg-white px-6 py-4 flex flex-col md:flex-row gap-3 md:items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search templates..."
          className="flex-1 border p-2 rounded"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2 rounded w-full md:w-64"
        >
          {categories.map((cat) => (
            <option key={cat || "all"} value={cat}>
              {cat ? cat : "All Categories"}
            </option>
          ))}
        </select>
      </div>

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <SkeletonList />
        ) : templates.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-16">
            No templates found for this filter.
          </div>
        ) : (
          templates.map((template) => (
            <Link key={template._id} href={`/marketplace/${template._id}`}>
              <TemplatePreviewCard template={template} />
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
