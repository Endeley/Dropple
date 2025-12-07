"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

export default function CreatorPage() {
  const params = useParams();
  const id = params?.id;
  const [creator, setCreator] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [sort, setSort] = useState("popular");

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/creators/${id}`);
        const data = await res.json();
        setCreator(data.creator || null);
        setTemplates(data.templates || []);
      } catch (err) {
        console.error("Failed to load creator", err);
      }
    };
    load();
  }, [id]);

  const sortedTemplates = useMemo(() => {
    const list = [...templates];
    if (sort === "popular") {
      return list.sort((a, b) => (b.insertCount || 0) - (a.insertCount || 0));
    }
    return list.sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
  }, [templates, sort]);

  if (!id) return null;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-neutral-200 overflow-hidden flex items-center justify-center">
            {creator?.avatarUrl ? (
              <Image src={creator.avatarUrl} alt={creator.displayName || ""} width={64} height={64} className="object-cover" />
            ) : (
              <span className="text-lg font-semibold text-neutral-600">{creator?.displayName?.[0] || "?"}</span>
            )}
          </div>
          <div>
            <div className="text-xl font-semibold text-neutral-900">{creator?.displayName || "Creator"}</div>
            {creator?.bio ? <div className="text-sm text-neutral-600">{creator.bio}</div> : null}
            <div className="text-xs text-neutral-500 mt-1">{templates.length} templates</div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-neutral-500">Sort</span>
            <select
              className="border border-neutral-200 rounded-md px-2 py-1 text-xs text-neutral-700 bg-white"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="popular">Popular</option>
              <option value="recent">Recent</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {sortedTemplates.map((t) => (
            <div key={t._id} className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden group">
              <div className="relative h-36 bg-neutral-100">
                {t.thumbnailUrl ? (
                  <Image src={t.thumbnailUrl} alt={t.name} fill className="object-cover" sizes="320px" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200" />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
              </div>
              <div className="p-3 space-y-1">
                <div className="text-sm font-semibold text-neutral-900 truncate">{t.name}</div>
                <div className="text-[11px] text-neutral-500 flex items-center justify-between">
                  <span>{t.category || "General"}</span>
                  {t.license && t.license !== "free" ? (
                    <span className="text-amber-600">{t.license === "pro" ? "Pro" : "Marketplace"}</span>
                  ) : (
                    <span className="text-emerald-600">Free</span>
                  )}
                </div>
                {(t.insertCount || t.viewCount || t.favoriteCount) ? (
                  <div className="text-[11px] text-neutral-500 flex items-center gap-2">
                    {t.insertCount ? <span>⬇ {t.insertCount}</span> : null}
                    {t.viewCount ? <span>👁 {t.viewCount}</span> : null}
                    {t.favoriteCount ? <span>❤ {t.favoriteCount}</span> : null}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
