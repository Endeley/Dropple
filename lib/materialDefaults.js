export const materialSeedDefaults = {
  prompt: "Generate a Material 3 UI kit based on #6750A4",
  tokens: {
    colors: {
      primary: "#6750A4",
      onPrimary: "#FFFFFF",
      primaryContainer: "#EADDFF",
      onPrimaryContainer: "#21005D",
      secondary: "#625B71",
      onSecondary: "#FFFFFF",
      background: "#FFFBFE",
      onBackground: "#1C1B1F",
      surface: "#FFFBFE",
      onSurface: "#1C1B1F",
      surfaceVariant: "#E7E0EC",
      onSurfaceVariant: "#49454F",
    },
    typography: {
      displayLarge: { fontSize: 57, lineHeight: 64, weight: 400 },
      headlineLarge: { fontSize: 32, lineHeight: 40, weight: 700 },
      titleMedium: { fontSize: 16, lineHeight: 24, weight: 600 },
      labelLarge: { fontSize: 14, lineHeight: 20, weight: 600 },
      bodyMedium: { fontSize: 14, lineHeight: 20, weight: 400 },
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
    radius: { none: 0, xs: 4, sm: 8, md: 12, lg: 16, xl: 28 },
    elevation: {
      level0: "none",
      level1: "rgba(0,0,0,0.05)",
      level2: "rgba(0,0,0,0.08)",
      level3: "rgba(0,0,0,0.11)",
      level4: "rgba(0,0,0,0.14)",
    },
    motion: {
      easing: {
        standard: "cubic-bezier(0.2, 0, 0, 1)",
        accelerate: "cubic-bezier(0.3, 0, 1, 1)",
        decelerate: "cubic-bezier(0, 0, 0, 1)",
      },
      durations: { fast: 120, base: 240, slow: 400 },
    },
  },
};
