export function generatePage(pages = { components: [] }) {
  const imports = (pages.components || [])
    .map((c) => `import ${c} from "@/components/${c}";`)
    .join("\n");
  const body = (pages.components || [])
    .map((c) => `<${c} />`)
    .join("\n");

  return `
import React from "react";
${imports}

export default function Page() {
  return (
    <main>
      ${body}
    </main>
  );
}
`;
}
