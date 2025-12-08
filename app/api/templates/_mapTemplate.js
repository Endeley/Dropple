const TEMPLATE_PLACEHOLDER =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80";

export function mapTemplateDoc(tpl) {
  if (!tpl) return null;
  const previewUrl = tpl.previewUrl || tpl.thumbnailUrl || tpl.thumbnail || TEMPLATE_PLACEHOLDER;
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
