"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ComponentDetailPage({ params }) {
  const router = useRouter();
  const { id } = params;
  const [component, setComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/components/${id}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to load component");
        } else {
          setComponent(data);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load component");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleAddToWorkspace = async () => {
    if (!component) return;
    try {
      localStorage.setItem("ADD_COMPONENT", JSON.stringify(component));
      await fetch("/api/components/install", {
        method: "POST",
        body: JSON.stringify({ id: component._id }),
      });
    } catch (err) {
      console.error("Failed to record component install", err);
    }
    router.push("/editor/templates/create");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading component...
      </div>
    );
  }

  if (error || !component) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        {error || "Component not found"}
      </div>
    );
  }

  const priceLabel =
    component.price && Number(component.price) > 0
      ? `$${Number(component.price).toFixed(2)}`
      : "Free";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">{component.category || "Component"}</p>
            <h1 className="text-3xl font-bold mt-1">{component.name || component.title}</h1>
            {component.description && (
              <p className="text-gray-600 mt-2 max-w-2xl">{component.description}</p>
            )}
            {component.tags?.length ? (
              <div className="flex flex-wrap gap-2 mt-3">
                {component.tags.map((tag) => (
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
              <p className="text-lg font-semibold">{priceLabel}</p>
            </div>
            <button
              onClick={handleAddToWorkspace}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add to Workspace
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
          {component.previewImage ? (
            <img
              src={component.previewImage}
              alt={component.name}
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
