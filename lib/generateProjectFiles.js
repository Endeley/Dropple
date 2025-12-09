import OpenAI from "openai";

const client =
  process.env.OPENAI_API_KEY || process.env.OPENAI_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY })
    : null;

export async function generateProjectFiles(blueprint) {
  if (blueprint?.deterministic) {
    return ensureThemeFiles(blueprint, getFallbackFiles(blueprint));
  }
  if (!client) {
    return getFallbackFiles(blueprint);
  }

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
You are Dropple's Code Generator AI.
Generate a full Next.js (App Router) project with Tailwind and Framer Motion.
Rules:
- Use React components
- Use Tailwind classes
- Use Framer Motion for animations
- Export one component per file
- Pages go in /app/{route}/page.jsx
- Assets referenced by URL
- Include tokens as CSS variables in styles/globals.css and extend tailwind.config.js with those tokens.
- If motionThemeId or motionTheme is provided, generate a motion config file (e.g., lib/motion.config.js) exporting ease/duration/stagger/hover/tap defaults, and use those in components.
- Honor brand/theme colors (primary, secondary, surface, background, text, muted) and motionThemeId if provided.
- Use layout.jsx for global fonts/theme
- NO TypeScript
Return JSON: { "files": { "path": "file content" } }`,
      },
      { role: "user", content: JSON.stringify(blueprint || {}) },
    ],
    response_format: { type: "json_object" },
    temperature: 0.4,
  });

  const content = res.choices?.[0]?.message?.content || "{}";
  const parsed = JSON.parse(content);
  const files = parsed.files || {};
  return Object.keys(files).length ? ensureThemeFiles(blueprint, files) : getFallbackFiles(blueprint);
}

function getFallbackFiles(blueprint) {
  const pages = blueprint?.pages || [];
  const colors = blueprint?.colors || {};
  const motionThemeId = blueprint?.motionThemeId || null;
  const motionTheme = blueprint?.motionTheme || {};
  const files = {
    "package.json": JSON.stringify(
      {
        name: "dropple-export",
        private: true,
        scripts: {
          dev: "next dev",
          build: "next build",
          start: "next start",
        },
        dependencies: {
          next: "14.2.0",
          react: "18.2.0",
          "react-dom": "18.2.0",
          "framer-motion": "11.0.0",
          tailwindcss: "3.4.4",
          autoprefixer: "10.4.19",
          postcss: "8.4.38",
        },
      },
      null,
      2,
    ),
    "app/layout.jsx": `
import "./globals.css";
export const metadata = { title: "Dropple Export", description: "Generated from Dropple" };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
`,
    "styles/globals.css": `
:root {
  --color-primary: ${colors.primary?.[0] || "#2563eb"};
  --color-secondary: ${colors.secondary?.[0] || "#9333ea"};
  --color-surface: ${colors.neutral?.[0] || "#ffffff"};
  --color-background: ${colors.background || colors.neutral?.[0] || "#f8fafc"};
  --color-text: ${colors.neutral?.[1] || "#0f172a"};
  --color-muted: ${colors.muted || "rgba(15,23,42,0.6)"};
  --shadow-elev-1: 0 10px 30px -18px rgba(0,0,0,0.25);
  --motion-ease: ${motionTheme?.ease || "easeOut"};
  --motion-duration: ${motionTheme?.durationScale ? 0.6 * motionTheme.durationScale : 0.6}s;
  --motion-stagger: ${motionTheme?.stagger || 0.08}s;
  --motion-hover-scale: ${motionTheme?.hoverScale || 1.02};
  --motion-tap-scale: ${motionTheme?.tapScale || 0.98};
}
@tailwind base;
@tailwind components;
@tailwind utilities;
`,
    "tailwind.config.js": `
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        surface: "var(--color-surface)",
        background: "var(--color-background)",
        text: "var(--color-text)",
        muted: "var(--color-muted)",
      },
      boxShadow: {
        elev: "var(--shadow-elev-1)",
      },
      transitionDuration: {
        motion: "var(--motion-duration)",
      },
      boxShadow: {
        elev: "var(--shadow-elev-1)",
      },
    },
  },
  plugins: [],
};
`,
    "lib/motion.config.js": `
export const motionTheme = {
  ease: "${motionTheme?.ease || "easeOut"}",
  duration: ${motionTheme?.durationScale ? 0.6 * motionTheme.durationScale : 0.6},
  stagger: ${motionTheme?.stagger || 0.08},
  hoverScale: ${motionTheme?.hoverScale || 1.02},
  tapScale: ${motionTheme?.tapScale || 0.98},
};
`,
  };

  pages.forEach((page, idx) => {
    files[`app${page.route || "/page"}/page.jsx`] = `
export default function Page() {
  return (
    <main className="min-h-screen px-8 py-10">
      <h1 className="text-3xl font-bold mb-6">${page.name || "Page"}</h1>
      <div className="grid gap-4">
        ${page.components
          .map((c) => `<div className="border p-4 rounded bg-white shadow-sm">${c.type || "layer"}</div>`)
          .join("\n")}
      </div>
    </main>
  );
}
`;
  });

  return files;
}

function ensureThemeFiles(blueprint, files) {
  const colors = blueprint?.colors || {};
  const motionTheme = blueprint?.motionTheme || {};

  const globalsPath = Object.keys(files).find((p) => p.includes("globals.css")) || "styles/globals.css";
  const tailwindPath = Object.keys(files).find((p) => p.includes("tailwind.config")) || "tailwind.config.js";
  const motionPath = "lib/motion.config.js";

  const globals = `
:root {
  --color-primary: ${colors.primary?.[0] || "#2563eb"};
  --color-secondary: ${colors.secondary?.[0] || "#9333ea"};
  --color-surface: ${colors.neutral?.[0] || "#ffffff"};
  --color-background: ${colors.background || colors.neutral?.[0] || "#f8fafc"};
  --color-text: ${colors.neutral?.[1] || "#0f172a"};
  --color-muted: ${colors.muted || "rgba(15,23,42,0.6)"};
  --shadow-elev-1: 0 10px 30px -18px rgba(0,0,0,0.25);
  --motion-ease: ${motionTheme?.ease || "easeOut"};
  --motion-duration: ${motionTheme?.durationScale ? 0.6 * motionTheme.durationScale : 0.6}s;
  --motion-stagger: ${motionTheme?.stagger || 0.08}s;
  --motion-hover-scale: ${motionTheme?.hoverScale || 1.02};
  --motion-tap-scale: ${motionTheme?.tapScale || 0.98};
}
@tailwind base;
@tailwind components;
@tailwind utilities;
`;

  const tailwind = `
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./lib/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        surface: "var(--color-surface)",
        background: "var(--color-background)",
        text: "var(--color-text)",
        muted: "var(--color-muted)",
      },
      boxShadow: {
        elev: "var(--shadow-elev-1)",
      },
      transitionDuration: {
        motion: "var(--motion-duration)",
      },
    },
  },
  plugins: [],
};
`;

  const motion = `
export const motionTheme = {
  ease: "${motionTheme?.ease || "easeOut"}",
  duration: ${motionTheme?.durationScale ? 0.6 * motionTheme.durationScale : 0.6},
  stagger: ${motionTheme?.stagger || 0.08},
  hoverScale: ${motionTheme?.hoverScale || 1.02},
  tapScale: ${motionTheme?.tapScale || 0.98},
};
`;

  return {
    ...files,
    [globalsPath]: globals,
    [tailwindPath]: tailwind,
    [motionPath]: motion,
  };
}
