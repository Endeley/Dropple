"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TemplateDetailPage({ params }) {
  const router = useRouter();
  const { id } = params;
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/templates/${id}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to load template");
        } else {
          setTemplate(data.template);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load template");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleUseTemplate = async () => {
    if (!template) return;

    try {
      localStorage.setItem("LOADED_TEMPLATE", JSON.stringify(template));
      await fetch("/api/templates/install", {
        method: "POST",
        body: JSON.stringify({ id: template._id }),
      });
    } catch (err) {
      console.error("Failed to record install", err);
    }

    router.push("/editor/templates/create");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading template...
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        {error || "Template not found"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">Category: {template.category || "General"}</p>
            <h1 className="text-3xl font-bold mt-1">{template.name}</h1>
            {template.description && (
              <p className="text-gray-600 mt-2 max-w-2xl">{template.description}</p>
            )}
            {template.tags?.length ? (
              <div className="flex flex-wrap gap-2 mt-3">
                {template.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-right">
              <p className="text-xs uppercase text-gray-500">Pricing</p>
              <p className="text-lg font-semibold">
                {template.price && Number(template.price) > 0
                  ? `$${Number(template.price).toFixed(2)}`
                  : "Free"}
              </p>
            </div>
            <button
              onClick={handleUseTemplate}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Use this Template
            </button>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
            >
              Back
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {template.thumbnail ? (
            <img
              src={template.thumbnail}
              alt={template.name}
              className="w-full max-h-[720px] object-contain bg-gray-100"
            />
          ) : (
            <div className="w-full h-96 bg-gray-100 flex items-center justify-center text-gray-500">
              No preview available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
