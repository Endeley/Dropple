const CATEGORY_IMAGES = {
  "SaaS dashboard": [
    "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1600&q=80",
  ],
  "Landing page hero": [
    "https://images.unsplash.com/photo-1522199710521-72d69614c702?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80",
  ],
  "Mobile app UI": [
    "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1600&q=80",
  ],
  Poster: [
    "https://images.unsplash.com/photo-1505685296765-3a2736de412f?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=80",
  ],
  "Social post": [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80",
  ],
  "Graphic design": [
    "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80",
  ],
  "CV / Resume": [
    "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80",
  ],
  "Receipt / Invoice": [
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80",
  ],
  "E-commerce product": [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1600&q=80",
  ],
  Portfolio: [
    "https://images.unsplash.com/photo-1448932252197-d19750584e56?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1600&q=80",
  ],
};

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1522193672904-9899b0c2110c?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80",
];

function pickCategoryImage(category, seed) {
  const pool = CATEGORY_IMAGES[category || ""] || DEFAULT_IMAGES;
  const idx = Math.abs(hashCode((seed || "") + (category || ""))) % pool.length;
  return pool[idx];
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export function mapTemplateDoc(tpl) {
  if (!tpl) return null;
  const previewUrl = tpl.previewUrl || tpl.thumbnailUrl || tpl.thumbnail || pickCategoryImage(tpl.category, tpl._id || tpl.id);
  const price = tpl.price ?? 0;

  return {
    ...tpl,
    id: tpl._id || tpl.id,
    previewUrl,
    category: tpl.category || "General",
    tags: tpl.tags || [],
    description: tpl.description || "",
    creator: tpl.creatorName || tpl.authorId || tpl.userId || tpl.creator || "",
    creatorAvatar: tpl.creatorAvatar || "",
    insertCount: tpl.insertCount || 0,
    viewCount: tpl.viewCount || 0,
    favoriteCount: tpl.favoriteCount || 0,
    license: tpl.license || "free",
    price,
    type: tpl.type || "template",
  };
}
