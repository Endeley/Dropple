"use client";

import Image from "next/image";

export default function TemplateDetailModal({
  template,
  stats,
  related = [],
  onClose,
  onInsert,
  onFavorite,
  onRemix,
  onDetail,
  onSelectRelated,
}) {
  if (!template) return null;

  const hasVersions = template?.versions?.length > 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-[420px] max-w-[90vw] bg-white h-full shadow-2xl border-l border-neutral-200 p-4 overflow-y-auto">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-base font-semibold text-neutral-900">{template.name}</div>
            <div className="text-xs text-neutral-500">
              {template.category || "General"}
              {hasVersions ? (
                <span className="ml-2 inline-flex items-center text-[11px] text-amber-600 font-semibold">
                  Update available
                </span>
              ) : null}
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-2 py-1 rounded-md border border-neutral-200 text-xs text-neutral-700 hover:bg-neutral-100"
          >
            Close
          </button>
        </div>

        <div className="w-full aspect-[16/10] bg-neutral-50 rounded-lg overflow-hidden border border-neutral-200 relative mb-3">
          {template.previewUrl ? (
            <Image src={template.previewUrl} alt={template.name} fill className="object-contain" sizes="400px" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200" />
          )}
        </div>

        <div className="space-y-2 text-sm text-neutral-700">
          {template.creator ? (
            <div className="text-xs text-neutral-500">
              By{" "}
              <a
                href={`/creators/${template.creatorId || template.creator}`}
                className="text-violet-600 hover:underline"
              >
                {template.creator}
              </a>
            </div>
          ) : null}
          {template.description ? <p className="text-neutral-600">{template.description}</p> : null}
          <div className="text-xs text-neutral-500">
            {template.width && template.height ? `${Math.round(template.width)} × ${Math.round(template.height)}` : null}
          </div>
          {template.license && template.license !== "free" ? (
            <div className="text-[11px] text-amber-600 font-semibold">
              🔒 {template.license === "pro" ? "Pro template" : "Marketplace"} {template.price ? `· $${template.price}` : ""}
            </div>
          ) : (
            <div className="text-[11px] text-emerald-600 font-semibold">Free</div>
          )}

          {stats ? (
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div className="rounded-md bg-neutral-50 border border-neutral-200 p-2">
                <div className="text-neutral-500">Views</div>
                <div className="text-neutral-900 font-semibold">{stats.views || 0}</div>
              </div>
              <div className="rounded-md bg-neutral-50 border border-neutral-200 p-2">
                <div className="text-neutral-500">Inserts</div>
                <div className="text-neutral-900 font-semibold">{stats.inserts || 0}</div>
              </div>
              <div className="rounded-md bg-neutral-50 border border-neutral-200 p-2">
                <div className="text-neutral-500">Favorites</div>
                <div className="text-neutral-900 font-semibold">{stats.favorites || 0}</div>
              </div>
            </div>
          ) : null}

          {template?.versions?.length ? (
            <div className="text-[11px] text-neutral-600">
              Versions:
              <div className="flex flex-wrap gap-1 mt-1">
                {template.versions.map((v) => (
                  <span
                    key={v.version || v}
                    className="px-2 py-[2px] rounded-full border border-neutral-200 bg-neutral-50 text-neutral-700"
                  >
                    v{v.version || v}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {(template.insertCount || template.viewCount || template.favoriteCount) ? (
            <div className="text-[11px] text-neutral-500 flex items-center gap-3">
              {template.insertCount ? <span>⬇ {template.insertCount}</span> : null}
              {template.viewCount ? <span>👁 {template.viewCount}</span> : null}
              {template.favoriteCount ? <span>❤ {template.favoriteCount}</span> : null}
              {template.type === "template" ? (
                <button className="text-[11px] text-violet-600 font-semibold" onClick={onFavorite}>
                  ❤ Favorite
                </button>
              ) : null}
            </div>
          ) : null}

          {template.tags?.length ? (
            <div className="flex flex-wrap gap-1">
              {template.tags.map((t) => (
                <span key={t} className="text-[11px] px-2 py-[2px] rounded-full bg-neutral-100 text-neutral-600">
                  #{t}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            className="flex-1 px-3 py-2 rounded-md bg-violet-500 text-white text-sm font-semibold shadow-sm hover:bg-violet-600 transition"
            onClick={onInsert}
          >
            Insert into Canvas
          </button>
          <button
            className="px-3 py-2 rounded-md border border-neutral-200 text-sm text-neutral-700 hover:bg-neutral-100"
            onClick={onFavorite}
          >
            Save
          </button>
        </div>

        <div className="mt-2 flex gap-2">
          <button
            className="flex-1 px-3 py-2 rounded-md bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition"
            onClick={onRemix}
          >
            AI Remix
          </button>
          <button
            className="px-3 py-2 rounded-md border border-neutral-200 text-sm text-neutral-700 hover:bg-neutral-100"
            onClick={onDetail}
          >
            Detail
          </button>
        </div>

        {related?.length ? (
          <div className="mt-4">
            <div className="text-xs font-semibold text-neutral-800 mb-2">Related templates</div>
            <div className="grid grid-cols-2 gap-2">
              {related.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-neutral-200 overflow-hidden cursor-pointer hover:shadow-sm"
                  onClick={() => onSelectRelated?.(item)}
                >
                  <div className="w-full aspect-video bg-neutral-100 relative">
                    {item.previewUrl ? (
                      <Image src={item.previewUrl} alt={item.name} fill className="object-cover" sizes="200px" />
                    ) : null}
                  </div>
                  <div className="p-2">
                    <div className="text-[12px] font-semibold text-neutral-900 truncate">{item.name}</div>
                    <div className="text-[11px] text-neutral-500 truncate">{item.category || "General"}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
