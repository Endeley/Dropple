"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AssetDetailPage({ params }) {
  const router = useRouter();
  const { id } = params;
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/asset-library/${id}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to load asset");
        } else {
          setAsset(data);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load asset");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleUseInEditor = async () => {
    if (!asset) return;
    try {
      localStorage.setItem(
        "USE_ASSET",
        JSON.stringify({ url: asset.fileUrl, width: asset.width, height: asset.height }),
      );
      await fetch("/api/asset-library/install", {
        method: "POST",
        body: JSON.stringify({ id: asset._id }),
      });
    } catch (err) {
      console.error("Failed to record asset usage", err);
    }
    router.push("/editor/templates/create");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading asset...
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        {error || "Asset not found"}
      </div>
    );
  }

  const priceLabel =
    asset.isPremium && asset.price && Number(asset.price) > 0
      ? `$${Number(asset.price).toFixed(2)}`
      : "Free";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500 uppercase">{asset.type}</p>
            <h1 className="text-3xl font-bold mt-1">{asset.title}</h1>
            {asset.description && (
              <p className="text-gray-600 mt-2 max-w-2xl">{asset.description}</p>
            )}
            {asset.tags?.length ? (
              <div className="flex flex-wrap gap-2 mt-3">
                {asset.tags.map((tag) => (
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
              onClick={handleUseInEditor}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Use in Editor
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
          {asset.previewUrl ? (
            <img
              src={asset.previewUrl}
              alt={asset.title}
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
