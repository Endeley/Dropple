export function generateDocs(name, dna, variants) {
  return `
# ${name}

## Variants:
- ${Object.keys(variants).join("\n- ")}

## Usage:
\`\`\`jsx
<${name} variant="solid">Label</${name}>
\`\`\`
`;
}
