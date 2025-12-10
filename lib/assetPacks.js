import fs from "fs";
import path from "path";

let manifestCache = null;
function loadManifest() {
  if (manifestCache) return manifestCache;
  const manifestPath = path.join(process.cwd(), "public", "packs", "manifest.json");
  if (fs.existsSync(manifestPath)) {
    try {
      const json = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      manifestCache = json;
      return manifestCache;
    } catch (err) {
      console.warn("Failed to read pack manifest", err?.message || err);
    }
  }
  manifestCache = { assets: {}, source: "pack", license: "pack" };
  return manifestCache;
}

export function pickPackImage(category = "") {
  const manifest = loadManifest();
  const key = category?.toLowerCase() || "default";
  const list = manifest.assets?.[key] || manifest.assets?.default || [];
  if (!list?.length) return null;
  const idx = Math.floor(Math.random() * list.length);
  return list[idx];
}
