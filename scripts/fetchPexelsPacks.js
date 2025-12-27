const fs = require("fs");
const path = require("path");

// Load PEXELS_API_KEY from .env.local if present
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  lines.forEach((line) => {
    const m = line.match(/^\s*PEXELS_API_KEY\s*=\s*(.+)\s*$/);
    if (m) {
      process.env.PEXELS_API_KEY = m[1].trim();
    }
  });
}

const API_KEY = process.env.PEXELS_API_KEY || "";
const BASE_URL = "https://api.pexels.com/v1/search";
const OUTPUT_ROOT = path.join(process.cwd(), "public", "packs");

const categories = [
  { id: "fashion", query: "fashion editorial portrait", perPage: 10 },
  { id: "ecommerce", query: "product studio shot", perPage: 10 },
  { id: "tech", query: "technology gradient abstract", perPage: 10 },
  { id: "music", query: "music concert portrait", perPage: 10 },
  { id: "fitness", query: "fitness workout portrait", perPage: 10 },
  { id: "business", query: "corporate portrait professional", perPage: 10 },
  { id: "travel", query: "travel landscape cinematic", perPage: 10 },
  { id: "events", query: "event poster portrait", perPage: 10 },
  { id: "podcast", query: "podcast host portrait", perPage: 10 },
  { id: "quotes", query: "minimal gradient background", perPage: 10 },
  { id: "tech3d", query: "3d technology render", perPage: 20 },
  { id: "illustration", query: "flat illustration design", perPage: 20 },
  { id: "nature", query: "nature landscape", perPage: 10 },
  { id: "street", query: "street photography", perPage: 10 },
  { id: "wallpapers", query: "abstract wallpaper", perPage: 10 },
  { id: "holiday", query: "holiday festive", perPage: 10 },
  { id: "texture", query: "abstract texture", perPage: 10 },
];

if (!API_KEY) {
  console.error("PEXELS_API_KEY missing");
  process.exit(1);
}

async function fetchCategory(cat) {
  const per = cat.perPage || 10;
  const url = `${BASE_URL}?per_page=${per}&query=${encodeURIComponent(cat.query)}`;
  const res = await fetch(url, { headers: { Authorization: API_KEY } });
  if (!res.ok) {
    console.warn(`Failed to fetch ${cat.id}: ${res.status}`);
    return [];
  }
  const data = await res.json();
  return data.photos || [];
}

async function downloadImage(url, dest) {
  const res = await fetch(url);
  if (!res.ok) return false;
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  return true;
}

async function run() {
  fs.mkdirSync(OUTPUT_ROOT, { recursive: true });
  const manifest = {};

  for (const cat of categories) {
    const photos = await fetchCategory(cat);
    const outDir = path.join(OUTPUT_ROOT, cat.id);
    fs.mkdirSync(outDir, { recursive: true });
    manifest[cat.id] = [];
    for (let i = 0; i < photos.length; i++) {
      const p = photos[i];
      const src = p.src?.large || p.src?.medium || p.src?.original;
      if (!src) continue;
      const fname = `${cat.id}-${i + 1}.jpg`;
      const dest = path.join(outDir, fname);
      const ok = await downloadImage(src, dest);
      if (ok) {
        manifest[cat.id].push(`/packs/${cat.id}/${fname}`);
      }
    }
    console.log(`Fetched ${manifest[cat.id].length} for ${cat.id}`);
  }

  const manifestPath = path.join(OUTPUT_ROOT, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify({ source: "pexels", license: "pexels", assets: manifest }, null, 2));
  console.log(`Manifest written to ${manifestPath}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
