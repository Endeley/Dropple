// Simple local asset packs by category. Add files under /public/packs/{category}/
export const assetPacks = {
  fashion: [
    "/packs/fashion/fashion-1.jpg",
    "/packs/fashion/fashion-2.jpg",
    "/packs/fashion/fashion-3.jpg",
  ],
  ecommerce: [
    "/packs/ecommerce/ecommerce-1.jpg",
    "/packs/ecommerce/ecommerce-2.jpg",
  ],
  tech: ["/packs/tech/tech-1.jpg", "/packs/tech/tech-2.jpg"],
  music: ["/packs/music/music-1.jpg", "/packs/music/music-2.jpg"],
  fitness: ["/packs/fitness/fitness-1.jpg", "/packs/fitness/fitness-2.jpg"],
  business: ["/packs/business/business-1.jpg", "/packs/business/business-2.jpg"],
  travel: ["/packs/travel/travel-1.jpg", "/packs/travel/travel-2.jpg"],
  quotes: ["/packs/quotes/quotes-1.jpg"],
  events: ["/packs/events/events-1.jpg", "/packs/events/events-2.jpg"],
  podcast: ["/packs/podcast/podcast-1.jpg"],
  default: ["/packs/placeholders/cinematic-1.jpg", "/packs/placeholders/cinematic-2.jpg"],
};

export function pickPackImage(category = "") {
  const key = category?.toLowerCase() || "default";
  const list = assetPacks[key] || assetPacks.default;
  if (!list?.length) return null;
  const idx = Math.floor(Math.random() * list.length);
  return list[idx];
}
