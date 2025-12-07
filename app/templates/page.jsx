"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const Section = ({ title, items }) => {
  if (!items?.length) return null;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
        <span className="text-xs text-neutral-500">{items.length} templates</span>
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((t) => (
          <div key={t.id} className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden group">
            <div className="relative h-44 bg-neutral-100">
              {t.previewUrl ? (
                <Image src={t.previewUrl} alt={t.name} fill className="object-cover" sizes="320px" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200" />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
              <div className="absolute top-2 left-2 text-[11px] px-2 py-[2px] rounded-full bg-white/90 text-neutral-700 border border-neutral-200">
                {t.category || "General"}
              </div>
              {t.license && t.license !== "free" ? (
                <div className="absolute top-2 right-2 text-[11px] px-2 py-[2px] rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                  {t.license === "pro" ? "Pro" : "Marketplace"}
                </div>
              ) : null}
            </div>
            <div className="p-3 space-y-1">
              <div className="text-sm font-semibold text-neutral-900 truncate">{t.name}</div>
              <div className="text-xs text-neutral-500 flex items-center justify-between">
                <span>
                  {t.width && t.height ? `${Math.round(t.width)}×${Math.round(t.height)}` : "Template"}
                </span>
                {t.creator ? (
                  <span className="truncate max-w-[120px] text-right">by {t.creator}</span>
                ) : null}
              </div>
              {(t.insertCount || t.viewCount || t.favoriteCount) ? (
                <div className="text-[11px] text-neutral-500 flex items-center gap-3">
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
  );
};

const CollectionSection = ({ title, items }) => {
  if (!items?.length) return null;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => (
          <div key={c._id} className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden group">
            <div className="relative h-36 bg-neutral-100">
              {c.thumbnailUrl ? (
                <Image src={c.thumbnailUrl} alt={c.name} fill className="object-cover" sizes="320px" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200" />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
            </div>
            <div className="p-3 space-y-1">
              <div className="text-sm font-semibold text-neutral-900 truncate">{c.name}</div>
              <div className="text-[11px] text-neutral-500">{(c.templateIds || []).length} templates</div>
              {c.curated ? <div className="text-[11px] text-emerald-600 font-semibold">Curated</div> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PackSection = ({ title, items }) => {
  if (!items?.length) return null;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <div key={p._id} className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden group">
            <div className="relative h-36 bg-neutral-100">
              {p.thumbnailUrl ? (
                <Image src={p.thumbnailUrl} alt={p.name} fill className="object-cover" sizes="320px" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200" />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
            </div>
            <div className="p-3 space-y-1">
              <div className="text-sm font-semibold text-neutral-900 truncate">{p.name}</div>
              <div className="text-[11px] text-neutral-500">{(p.templateIds || []).length} templates</div>
              {p.license && p.license !== "free" ? (
                <div className="text-[11px] text-amber-600 font-semibold">
                  {p.license === "pro" ? "Pro" : "Marketplace"} {p.price ? `· $${p.price}` : ""}
                </div>
              ) : (
                <div className="text-[11px] text-emerald-600 font-semibold">Free</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default function TemplatesPage() {
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [recent, setRecent] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [collections, setCollections] = useState([]);
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [t, p, r, rec, col, pk] = await Promise.all([
          fetch("/api/templates/trending").then((r) => r.json()),
          fetch("/api/templates/popular").then((r) => r.json()),
          fetch("/api/templates/recent").then((r) => r.json()),
          fetch("/api/templates/recommended").then((r) => r.json()),
          fetch("/api/templates/collections").then((r) => r.json()),
          fetch("/api/templates/packs").then((r) => r.json()),
        ]);
        setTrending(t.templates || []);
        setPopular(p.templates || []);
        setRecent(r.templates || []);
        setRecommended(rec.templates || []);
        setCollections(col.collections || []);
        setPacks(pk.packs || []);
      } catch (err) {
        console.error("Failed to load marketplace", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const hasContent = [trending, popular, recent, recommended, collections, packs].some((arr) => arr?.length);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-neutral-900">Template Marketplace</h1>
          <p className="text-sm text-neutral-600">
            Browse featured templates, see what’s trending, and get recommendations tailored for you.
          </p>
        </div>

        {loading && !hasContent ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                <div className="h-44 w-full bg-neutral-200 animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-neutral-200 rounded w-2/3 animate-pulse" />
                  <div className="h-3 bg-neutral-200 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
      <div className="space-y-8">
        <Section title="Recommended For You" items={recommended} />
        <Section title="Trending Today" items={trending} />
        <Section title="Popular This Week" items={popular} />
        <Section title="New & Noteworthy" items={recent} />
        <CollectionSection title="Featured Collections" items={collections} />
        <PackSection title="Template Packs" items={packs} />
      </div>
    )}

        {!loading && !hasContent ? (
          <div className="text-sm text-neutral-500 border border-dashed border-neutral-200 rounded-lg p-6 bg-white">
            No templates available yet.
          </div>
        ) : null}
      </div>
    </div>
  );
}
