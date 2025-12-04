export function buildBrandKit(blueprint = {}, logos = [], patterns = []) {
  const colors = blueprint.colorPalette || {};
  const typ = blueprint.typography || {};

  const theme = {
    _id: "theme_" + crypto.randomUUID(),
    name: blueprint.name || "Brand Theme",
    tokens: {
      colors: {
        primary: colors.primary?.[0] || "#2563eb",
        secondary: colors.secondary?.[0] || "#9333ea",
        surface: colors.neutral?.[0] || "#ffffff",
        text: colors.neutral?.[1] || "#0f172a",
        background: colors.neutral?.[0] || "#f8fafc",
        success: colors.semantic?.success || "#22c55e",
        danger: colors.semantic?.danger || "#ef4444",
        warning: colors.semantic?.warning || "#f59e0b",
      },
    },
  };

  return {
    id: "brand_" + crypto.randomUUID(),
    name: blueprint.name,
    tagline: blueprint.tagline,
    personality: blueprint.brandPersonality || [],
    colors,
    typography: typ,
    logos,
    patterns,
    tokens: {
      radius: 12,
      spacing: [4, 8, 12, 16, 20, 32],
      shadows: ["0px 4px 10px rgba(0,0,0,0.1)"],
    },
    uiComponents: blueprint.uiComponents || [],
    theme,
  };
}
