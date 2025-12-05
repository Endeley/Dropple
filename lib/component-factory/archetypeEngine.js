export function categorizeComponent(dna) {
  if (dna.type === "button") return "Button";
  if (dna.type === "container" && dna.hasImage && dna.text) return "Card";
  if (dna.type === "text" && dna.typography?.size && parseInt(dna.typography.size, 10) > 32)
    return "Heading";
  if (dna.type === "input") return "Input";
  if (dna.type === "navbar") return "Navbar";
  return "Component";
}
