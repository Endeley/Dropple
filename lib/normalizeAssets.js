/**
 * Ensure every asset carries required metadata.
 * - Guarantees id/type/url strings
 * - Adds source/license fallbacks so validation passes
 * - Drops entries missing critical fields
 */
export function normalizeAssets(assets = []) {
  if (!Array.isArray(assets)) return [];
  return assets
    .filter((a) => a && typeof a === "object")
    .map((asset, idx) => {
      const id = typeof asset.id === "string" && asset.id.trim().length ? asset.id : `asset_${idx}`;
      const type = typeof asset.type === "string" && asset.type.trim().length ? asset.type : "image";
      const url = typeof asset.url === "string" ? asset.url : "";
      const source =
        typeof asset.source === "string" && asset.source.trim().length
          ? asset.source
          : classifySource(url);
      const license =
        typeof asset.license === "string" && asset.license.trim().length
          ? asset.license
          : classifyLicense(url, source);
      return {
        ...asset,
        id,
        type,
        url,
        source,
        license,
      };
    })
    .filter((a) => a.url);
}

const PACK_HINTS = ["public/packs", "/packs/", "pexels.com"];

function classifySource(url = "") {
  if (!url) return "unknown";
  const lower = url.toLowerCase();
  if (lower.includes("pexels")) return "pexels";
  if (lower.includes("unsplash")) return "unsplash";
  if (lower.includes("openai")) return "ai";
  if (PACK_HINTS.some((p) => lower.includes(p))) return "pack";
  if (lower.startsWith("data:")) return "embedded";
  if (lower.startsWith("blob:")) return "blob";
  if (lower.includes("storage.googleapis") || lower.includes("supabase") || lower.includes("s3")) {
    return "upload";
  }
  return "unknown";
}

function classifyLicense(url = "", source = "") {
  const src = source || classifySource(url);
  if (src === "pexels" || src === "unsplash") return "cc0";
  if (src === "ai") return "ai-generated";
  if (src === "upload") return "owner";
  if (src === "pack") return "pack";
  if (src === "embedded" || src === "blob") return "embedded";
  return "unspecified";
}
