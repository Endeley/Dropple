const PEXELS_KEY = process.env.PEXELS_API_KEY || "";

export async function fetchPexelsImage(query = "design", size = "large") {
  if (!PEXELS_KEY) return null;
  try {
    const res = await fetch(`https://api.pexels.com/v1/search?per_page=1&query=${encodeURIComponent(query)}`, {
      headers: {
        Authorization: PEXELS_KEY,
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const photo = data?.photos?.[0];
    if (!photo) return null;
    const src = photo.src?.[size] || photo.src?.original || null;
    return src;
  } catch (err) {
    console.warn("Pexels fetch failed", err?.message || err);
    return null;
  }
}
