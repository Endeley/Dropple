"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function PackDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [pack, setPack] = useState(null);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const res = await fetch("/api/templates/packs");
        const data = await res.json();
        const match = (data.packs || []).find((p) => p._id === id);
        setPack(match || null);
      } catch (err) {
        console.error("Failed to load pack", err);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!pack?.templateIds?.length) return;
    const load = async () => {
      try {
        const res = await fetch("/api/templates/marketplace");
        const data = await res.json();
        const templ = (data.templates || []).filter((t) => pack.templateIds.includes(t.id));
        setTemplates(templ);
      } catch (err) {
        console.error("Failed to load templates for pack", err);
      }
    };
    load();
  }, [pack]);

  if (!id) return null;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-start gap-4">
          <div className="relative h-20 w-20 rounded-lg border border-neutral-200 bg-neutral-100 overflow-hidden">
            {pack?.thumbnailUrl ? (
              <Image src={pack.thumbnailUrl} alt={pack.name} fill className="object-cover" sizes="120px" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200" />
            )}
          </div>
          <div>
            <div className="text-xl font-semibold text-neutral-900">{pack?.name || "Template Pack"}</div>
            <div className="text-sm text-neutral-500">{(pack?.templateIds || []).length} templates</div>
            {pack?.license && pack.license !== "free" ? (
              <div className="text-[11px] text-amber-600 font-semibold">
                {pack.license === "pro" ? "Pro" : "Marketplace"} {pack.price ? `· $${pack.price}` : ""}
              </div>
            ) : (
              <div className="text-[11px] text-emerald-600 font-semibold">Free</div>
            )}
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <div key={t.id} className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden group">
              <div className="relative h-36 bg-neutral-100">
                {t.previewUrl ? (
                  <Image src={t.previewUrl} alt={t.name} fill className="object-cover" sizes="320px" />
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
