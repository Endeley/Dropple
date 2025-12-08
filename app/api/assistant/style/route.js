"use server";

const paletteHints = (theme) => {
  if (!theme?.tokens?.colors) return [];
  const colors = Object.values(theme.tokens.colors);
  const hasStrongAccent = colors.some((c) => typeof c === "string" && /#/.test(c) && c.length <= 7);
  const suggestions = [];
  if (!hasStrongAccent) suggestions.push("Add a stronger accent color to improve visual hierarchy.");
  if (colors.length > 8) suggestions.push("Reduce palette count to keep the UI cohesive.");
  return suggestions;
};

const typeHints = (theme) => {
  const fonts = theme?.tokens?.fonts || [];
  if (!fonts.length) return ["Define heading/body font tokens for consistency."];
  if (fonts.length > 3) return ["Too many font families; simplify to 1–2 families."];
  return [];
};

const spacingHints = (theme) => {
  const spacing = theme?.tokens?.spacing || [];
  const suggestions = [];
  if (!spacing.length) suggestions.push("Add a spacing scale (e.g., 4, 8, 12, 16, 24, 32)." );
  if (spacing.length && spacing[0] > 4) suggestions.push("Start spacing scale at 4px or 8px for small paddings.");
  return suggestions;
};

export async function POST(req) {
  try {
    const body = await req.json();
    const { theme } = body || {};
    if (!theme) return Response.json({ suggestions: ["No theme provided."] }, { status: 200 });

    const suggestions = [
      ...paletteHints(theme),
      ...typeHints(theme),
      ...spacingHints(theme),
    ];

    return Response.json({ suggestions });
  } catch (err) {
    console.error("Style advisor failed", err);
    return Response.json({ error: "Failed to analyze style" }, { status: 500 });
  }
}
