export async function logTemplateEvent(templateId, type) {
  if (!templateId || !type) return;
  try {
    await fetch("/api/templates/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId, type }),
    });
  } catch (err) {
    console.warn("Failed to log template event", err);
  }
}

export async function toggleFavorite(templateId) {
  if (!templateId) return;
  try {
    await fetch("/api/templates/favorite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId }),
    });
  } catch (err) {
    console.warn("Failed to favorite template", err);
  }
}
