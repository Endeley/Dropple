import OpenAI from "openai";

const client =
  process.env.OPENAI_API_KEY || process.env.OPENAI_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY })
    : null;

export async function generateProjectFiles(blueprint) {
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
Generate a full Next.js (App Router) project with Tailwind.
Rules:
- Use React components
- Use Tailwind classes
- Use Framer Motion for animations
- Export one component per file
- Pages go in /app/{route}/page.jsx
- Assets referenced by URL
- Include tokens as CSS variables in styles/globals.css
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
  return Object.keys(files).length ? files : getFallbackFiles(blueprint);
}

function getFallbackFiles(blueprint) {
  const pages = blueprint?.pages || [];
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
  --color-primary: ${blueprint?.colors?.primary?.[0] || "#2563eb"};
  --color-secondary: ${blueprint?.colors?.secondary?.[0] || "#9333ea"};
  --color-surface: ${blueprint?.colors?.neutral?.[0] || "#ffffff"};
  --color-text: ${blueprint?.colors?.neutral?.[1] || "#0f172a"};
}
@tailwind base;
@tailwind components;
@tailwind utilities;
`,
    "tailwind.config.js": `
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
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
