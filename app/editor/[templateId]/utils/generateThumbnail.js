export async function generateThumbnailFromElement(el) {
  // Placeholder: integrate html2canvas or similar later
  if (!el) return null;
  try {
    // @ts-ignore
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(el, { scale: 0.25 });
    return canvas.toDataURL("image/png");
  } catch (err) {
    console.warn("Thumbnail generation skipped", err);
    return null;
  }
}
