"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function TemplatesPage() {
  const templates = useQuery(api.templates.listTemplates) || [];

  return (
    <div className="p-8 grid grid-cols-3 gap-6">
      {templates.map((t) => (
        <Link key={t._id} href={`/editor/${t._id}`}>
          <div className="p-4 border rounded hover:shadow-lg transition">
            <img
              src={t.thumbnail ?? "/placeholder.png"}
              className="w-full h-40 object-cover mb-3"
              alt={t.name}
            />
            <h3 className="font-medium">{t.name}</h3>
            <p className="text-xs text-gray-500">{t.category || t.mode}</p>
            {t.isPublished ? (
              <p className="text-green-600 text-xs mt-1">Published</p>
            ) : (
              <p className="text-yellow-600 text-xs mt-1">Draft</p>
            )}
          </div>
        </Link>
      ))}
      {templates.length === 0 && <p className="text-sm text-gray-500">No templates yet.</p>}
    </div>
  );
}
