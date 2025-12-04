"use client";

import { useEffect, useState } from "react";
import TemplatePreviewCard from "@/components/template-builder/TemplatePreviewCard";
import Link from "next/link";

export default function TemplateRecommendations() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch("/api/recommendations/templates")
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]));
  }, []);

  if (!items.length) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Recommended for you</h2>
        <Link href="/marketplace" className="text-sm text-blue-600 hover:underline">
          View all
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((tpl) => (
          <Link key={tpl._id} href={`/marketplace/${tpl._id}`}>
            <TemplatePreviewCard template={tpl} />
          </Link>
        ))}
      </div>
    </div>
  );
}
