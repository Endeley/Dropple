"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import TemplatePreviewCard from "@/components/template-builder/TemplatePreviewCard";
import TemplateCategoryFilter from "@/components/template-builder/TemplateCategoryFilter";

export default function TemplatesDashboard() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Temporary mock data (replace with Convex query soon)
  useEffect(() => {
    setTimeout(() => {
      setTemplates([
        {
          id: "example1",
          name: "Modern Dashboard",
          mode: "uiux",
          thumbnail: "",
        },
        {
          id: "example2",
          name: "Mobile App UI",
          mode: "uiux",
          thumbnail: "",
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-6 border-b bg-white">
        <h1 className="text-2xl font-semibold">Templates</h1>

        <Link
          href="/editor/templates/create"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Create Template
        </Link>
      </div>

      {/* Filters + Search */}
      <TemplateCategoryFilter />

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 p-6">
        {loading ? (
          <>
            {/* Skeleton loaders */}
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : templates.length === 0 ? (
          <EmptyState />
        ) : (
          templates.map((template) => (
            <Link
              key={template.id}
              href={`/editor/templates/edit/${template.id}`}
            >
              <TemplatePreviewCard template={template} />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

/* Skeleton loader */
function SkeletonCard() {
  return (
    <div className="w-full border rounded-lg bg-white shadow animate-pulse">
      <div className="h-40 bg-gray-200"></div>
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  );
}

/* Empty state */
function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center py-20 opacity-60">
      <div className="w-20 h-20 rounded-full bg-gray-200 mb-4"></div>
      <h2 className="text-xl font-semibold">No templates yet</h2>
      <p className="text-gray-500 mt-2">Start by creating your first template.</p>
    </div>
  );
}
