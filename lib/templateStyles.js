export const templateStyles = [
  {
    id: "darkCinematic",
    label: "Dark Cinematic",
    description: "Moody contrast, neon accent, deep blacks, photo-driven hero.",
    palette: {
      background: "linear-gradient(135deg, #0b1224, #0f172a)",
      surface: "rgba(17, 24, 39, 0.85)",
      primary: "#8B5CF6",
      accent: "#F97316",
      text: "#F8FAFC",
      muted: "rgba(248, 250, 252, 0.72)",
    },
    fonts: ["Sora", "Inter", "Space Grotesk"],
    radius: 24,
    shadow: "0 24px 80px -40px rgba(0,0,0,0.55)",
    motionTheme: "cinematic",
  },
  {
    id: "neonPop",
    label: "Neon Pop",
    description: "Vibrant gradients, playful shapes, bold typography.",
    palette: {
      background: "linear-gradient(145deg, #1e1b4b, #312e81, #8b5cf6)",
      surface: "rgba(255, 255, 255, 0.08)",
      primary: "#A855F7",
      accent: "#22D3EE",
      text: "#E0E7FF",
      muted: "rgba(224, 231, 255, 0.8)",
    },
    fonts: ["Clash Display", "Inter", "Satoshi"],
    radius: 20,
    shadow: "0 22px 70px -38px rgba(56, 189, 248, 0.35)",
    motionTheme: "playfulBounce",
  },
  {
    id: "gradientLuxe",
    label: "Gradient Luxe",
    description: "High contrast luxe with glassmorphism panels and soft glow.",
    palette: {
      background: "linear-gradient(160deg, #0f172a, #111827 50%, #1f2937)",
      surface: "rgba(255, 255, 255, 0.06)",
      primary: "#F97316",
      accent: "#FACC15",
      text: "#F8FAFC",
      muted: "rgba(248, 250, 252, 0.72)",
    },
    fonts: ["Degular", "Manrope", "Inter"],
    radius: 28,
    shadow: "0 32px 90px -48px rgba(249, 115, 22, 0.38)",
    motionTheme: "smoothModern",
  },
  {
    id: "corporateBlue",
    label: "Corporate Blue",
    description: "Clean, professional, crisp whites with blue accents.",
    palette: {
      background: "#F8FAFC",
      surface: "#FFFFFF",
      primary: "#2563EB",
      accent: "#0EA5E9",
      text: "#0F172A",
      muted: "#475569",
    },
    fonts: ["Inter", "DM Sans", "Manrope"],
    radius: 16,
    shadow: "0 18px 60px -44px rgba(37, 99, 235, 0.35)",
    motionTheme: "smoothModern",
  },
  {
    id: "softPastel",
    label: "Soft Pastel",
    description: "Light gradients, rounded shapes, friendly and calm.",
    palette: {
      background: "linear-gradient(135deg, #fef3c7, #f5e0ff)",
      surface: "rgba(255, 255, 255, 0.82)",
      primary: "#F472B6",
      accent: "#34D399",
      text: "#0F172A",
      muted: "rgba(15, 23, 42, 0.65)",
    },
    fonts: ["Outfit", "Poppins", "Inter"],
    radius: 22,
    shadow: "0 18px 60px -44px rgba(244, 114, 182, 0.35)",
    motionTheme: "smoothModern",
  },
  {
    id: "fashionEditorial",
    label: "Fashion Editorial",
    description: "Bold type, high contrast, accent strokes, luxurious gradients.",
    palette: {
      background: "linear-gradient(150deg, #111827, #0b1224)",
      surface: "rgba(255, 255, 255, 0.05)",
      primary: "#F43F5E",
      accent: "#9F1239",
      text: "#F8FAFC",
      muted: "rgba(248, 250, 252, 0.75)",
    },
    fonts: ["Bodoni Moda", "Sora", "Inter"],
    radius: 18,
    shadow: "0 26px 80px -50px rgba(244, 63, 94, 0.45)",
    motionTheme: "cinematic",
  },
  {
    id: "techMinimal",
    label: "Tech Minimal",
    description: "Minimal grids, thin strokes, glass surfaces, cool neutrals.",
    palette: {
      background: "linear-gradient(135deg, #0f172a, #0b1224 35%, #020617)",
      surface: "rgba(255, 255, 255, 0.06)",
      primary: "#38BDF8",
      accent: "#A855F7",
      text: "#E2E8F0",
      muted: "rgba(226, 232, 240, 0.72)",
    },
    fonts: ["Space Grotesk", "Inter", "Satoshi"],
    radius: 14,
    shadow: "0 20px 70px -46px rgba(56, 189, 248, 0.35)",
    motionTheme: "smoothModern",
  },
];

export const templateStyleMap = templateStyles.reduce((acc, style) => {
  acc[style.id] = style;
  return acc;
}, {});

export function buildStylePrompt(styleId) {
  const style = templateStyleMap[styleId];
  if (!style) return "";
  const { label, palette, fonts, radius, shadow, motionTheme } = style;
  return `Use style "${label}". Palette: background=${palette.background}, surface=${palette.surface}, primary=${palette.primary}, accent=${palette.accent}, text=${palette.text}. Fonts: ${fonts.join(
    ", ",
  )}. Radius: ${radius}. Shadow: ${shadow}. Motion theme: ${motionTheme} (stagger, hover scale, ease consistent). Apply gradients/shapes accordingly.`;
}
